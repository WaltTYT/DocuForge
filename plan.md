# DocuForge 优化计划

## 一、Bug 修复：Word 转 PDF 失败

### 1.1 问题描述
- Word (.docx) 转换为 PDF 时报错：`'xelatex' not found` 或 `'pdflatex' not found`
- Pandoc 生成 PDF 需要 LaTeX 引擎，但用户环境未安装

### 1.2 已实施的解决方案（当前）

**三层回退策略**：在 `docuforge/converter.py` 中实现

| 层级 | 方案 | 效果 | 依赖 |
|------|------|------|------|
| 1 | `--pdf-engine=xelatex` + 中文字体 | 最佳，保留格式和中文 | 需要 MiKTeX/TeX Live |
| 2 | Pandoc 默认模式（无引擎） | 中等，可能不支持中文 | 无 |
| 3 | reportlab Python 库生成 | 基础，纯文本 | `pip install reportlab` |

**代码逻辑**：
```python
for attempt, args in enumerate([
    ["--pdf-engine=xelatex", "-V", "CJKmainfont=Microsoft YaHei"],
    [],
]):
    try:
        _run_pandoc(tmp_md, output_file, args)
        pdf_success = True
        break
    except RuntimeError as e:
        if attempt == 0 and ("xelatex" in str(e) or "pdflatex" in str(e) or "pdf-engine" in str(e)):
            continue
        elif attempt == 1 and HAS_REPORTLAB:
            _generate_pdf_with_reportlab(md_content, output_file)
            pdf_success = True
            break
        else:
            raise
```

### 1.3 验证步骤
1. 安装 reportlab：`pip install reportlab`
2. 重启后端：`python backend/app.py`
3. 测试 Word → PDF 转换

---

## 二、优化方案：智能转换策略

### 2.1 问题分析
当前架构：`输入 → MarkItDown → Markdown → Pandoc → 输出`

**缺点**：
- 所有文档统一走 MarkItDown 读取，复杂文档会丢失格式
- MarkItDown 的表格、图片、公式处理不够完善
- Pandoc 直接处理 docx → pdf 效果更好，但当前架构必须经过 Markdown 中转

### 2.2 优化目标
根据文档复杂度选择最优转换路径：
- **简单文档**：走 MarkItDown 路径（快速、轻量）
- **复杂文档**：直接走 Pandoc 路径（保留格式）或 Pandoc + 自定义解析

### 2.3 文档复杂度评估指标

| 指标 | 简单文档 | 复杂文档 |
|------|----------|----------|
| 页数 | < 10 页 | ≥ 10 页 |
| 表格 | 无或简单表格 | 复杂表格、合并单元格 |
| 图片 | 无或少量图片 | 大量图片、图表 |
| 公式 | 无 | 数学公式（LaTeX/OMML） |
| 样式 | 基础样式（标题、列表） | 复杂样式（分栏、页眉页脚） |
| 结构 | 线性结构 | 目录、交叉引用 |

### 2.4 智能路由策略

```
输入文件
    ↓
[文档复杂度分析器]
    ↓
    ├── 简单文档 ─────→ MarkItDown → Markdown → Pandoc → 输出
    │
    └── 复杂文档 ─────→ Pandoc 直接转换（docx → pdf）
                        └── 或 Pandoc + 自定义解析（修复 MarkItDown 丢失的格式）
```

### 2.5 实现步骤

#### 步骤 1：实现文档复杂度分析器

**文件**：`docuforge/analyzer.py`

**功能**：
- 解析 docx 文件，提取以下特征：
  - 页数/段落数
  - 表格数量和复杂度（行数、列数、合并单元格）
  - 图片数量
  - 公式数量（OMML/LaTeX）
  - 样式类型（标题、列表、分栏等）
  - 结构元素（目录、页眉页脚、脚注）

**算法**：
```python
def analyze_document(filepath: str) -> DocumentComplexity:
    """分析文档复杂度，返回复杂度等级"""
    # 提取特征
    features = extract_features(filepath)
    # 计算复杂度分数
    score = calculate_complexity_score(features)
    # 返回等级：SIMPLE / COMPLEX
    return DocumentComplexity.SIMPLE if score < THRESHOLD else DocumentComplexity.COMPLEX
```

#### 步骤 2：重构转换器，支持多路径

**文件**：`docuforge/converter.py`

**修改内容**：
- 新增 `convert_with_strategy()` 函数
- 根据复杂度分析结果选择转换路径
- 简单文档：保持现有 MarkItDown → Pandoc 路径
- 复杂文档：
  - docx → pdf：直接调用 `pandoc input.docx -o output.pdf`
  - pdf → docx：使用 markitdown 读取 + pandoc 写入，或使用 pdfplumber 增强
  - pptx → 其他：使用 python-pptx 提取 + pandoc 写入

#### 步骤 3：增强复杂文档处理

**文件**：`docuforge/complex_parser.py`

**功能**：
- 针对复杂文档的自定义解析逻辑：
  - 表格修复：处理合并单元格、边框样式
  - 图片处理：提取并重新嵌入
  - 公式处理：保留 LaTeX 格式
  - 样式保留：标题层级、字体、颜色

#### 步骤 4：测试与验证

**测试用例**：
| 文档类型 | 复杂度 | 预期路径 | 验证指标 |
|----------|--------|----------|----------|
| 纯文本说明文档 | 简单 | MarkItDown → Pandoc | 文本完整，格式正确 |
| 技术论文（含表格、公式） | 复杂 | Pandoc 直接转换 | 表格结构、公式保留 |
| 报告（含图表、页眉页脚） | 复杂 | Pandoc + 自定义解析 | 图片嵌入、页眉页脚保留 |

---

## 三、待办清单

### Bug 修复（进行中）
- [x] 添加 PDF 引擎回退逻辑
- [x] 添加 reportlab 作为最终回退方案
- [x] 安装 reportlab 依赖
- [x] 修复 Word → PDF 转换（base64 图片 + 中文字体）
- [x] 修复中文文件名上传问题（secure_filename 丢失扩展名）
- [x] 添加 None 值防御性检查（防止 None.strip() 错误）
- [x] 验证 PPTX → PDF 转换

### 优化方案（待实施）
- [ ] 实现文档复杂度分析器 (`analyzer.py`)
- [ ] 重构转换器，支持智能路由
- [ ] 实现复杂文档自定义解析 (`complex_parser.py`)
- [ ] 添加测试用例
- [ ] 验证转换效果

---

## 四、参考资源

1. **Pandoc 文档**：https://pandoc.org/MANUAL.html
2. **MarkItDown**：https://github.com/markitdown/markitdown
3. **python-docx**：https://python-docx.readthedocs.io/
4. **MiKTeX 安装**：https://miktex.org/download