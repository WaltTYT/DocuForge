# Agent.md - DocuForge 项目规范

## 1. 项目概述

- **项目名称**：DocuForge
- **版本**：1.0.0
- **描述**：文档格式互转工具，支持 Word (.docx)、PDF (.pdf)、PPT (.pptx)、Markdown (.md) 之间的相互转换

### 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Python | 3.12.6 | 主语言 |
| Pandoc | 3.10 | 文档转换引擎（安装于 `C:\Users\Walt\AppData\Roaming\pandoc`） |
| python-pptx | >=1.0.0 | PPT 文件读写 |
| PyMuPDF | >=1.24.0 | PDF 文本/图片提取 |
| Pillow | >=10.0.0 | 图片处理 |
| reportlab | >=4.0.0 | PDF 生成（回退方案） |

### 架构

单体 CLI 应用，核心转换引擎基于 Pandoc 命令行调用 + Python 库（PyMuPDF、python-pptx、reportlab）补充处理。

---

## 2. Agent 规则

### 2.1 基本原则

- 每一次执行任务时，都必须先检查用户配置和项目记忆中的偏好设置
- 按要求执行，不多不少
- 除非绝对必要，否则绝不创建文件
- 优先编辑现有文件，而非创建新文件
- 除非明确要求，否则绝不主动创建文档文件（*.md 或 README）
- 提交或推送代码变更前需要明确获得用户许可
- 没有用户明确允许，绝不推送项目到 GitHub
- 没有用户明确允许，绝不删除项目中的任何文件

### 2.2 任务开始前

- 检查可用技能 - 检查 `<available_skills>` 中是否有相关技能
- 查看记忆上下文 - 查看用户配置和项目记忆中的偏好设置
- 先规划后执行 - 使用 `TodoWrite` 处理复杂的多步骤任务
- 提出澄清问题 - 如果需求不明确，使用 `AskUserQuestion` 工具

### 2.3 任务执行规则

**探索阶段：**
- 使用 `SearchCodebase`、`Grep`、`Glob` 理解代码结构
- 阅读相关文件后再做修改，不要猜测代码内容

**规划阶段：**
- 使用 `TodoWrite` 分解任务步骤
- 明确修改哪些文件、新增哪些功能

**实现阶段：**
- 优先编辑现有文件，避免创建新文件
- 保持变更最小化，聚焦于当前任务

**验证阶段：**
- 使用 `GetDiagnostics` 检查代码错误
- 运行相关命令验证功能是否正常

### 2.4 代码风格规则

- **除非用户明确要求，否则不添加任何注释**
- 遵循现有的缩进模式：4 空格缩进
- 使用一致的命名约定：
  - 模块/文件名：`snake_case`（如 `converter.py`）
  - 函数/变量名：`snake_case`（如 `_find_pandoc`）
  - 常量：`UPPER_SNAKE_CASE`（如 `SUPPORTED_FORMATS`）
  - 类名：`PascalCase`
- 保持代码整洁和可维护

### 2.5 安全指南

- 不硬编码任何密钥或凭证
- 文件路径输入需验证，防止路径穿越攻击
- 临时文件使用后及时清理（`finally` 块中 `os.unlink`）
- 外部命令调用（subprocess）需验证参数合法性

---

## 3. 项目结构

```
DocuForge/
├── main.py                  # 程序入口
├── requirements.txt         # Python 依赖
├── Agent.md                 # Agent 规范文件
├── venv/                    # Python 虚拟环境
└── docuforge/               # 核心包
    ├── __init__.py           # 包定义 & 版本号
    ├── converter.py          # 核心转换引擎
    └── cli.py                # CLI 命令行接口
```

---

## 4. 关键配置文件

| 文件 | 用途 |
|------|------|
| `requirements.txt` | Python 依赖声明 |
| `main.py` | 程序入口，调用 CLI 模块 |
| `docuforge/converter.py` | 核心转换逻辑，Pandoc 调用 + Python 库处理 |
| `docuforge/cli.py` | argparse CLI 定义（convert / batch / formats 命令） |
| `venv/` | Python 虚拟环境（激活命令：`.\venv\Scripts\Activate.ps1`） |

---

## 5. 安全基线

- 文件路径通过 `os.path.abspath()` 规范化
- 格式校验：仅允许 `.docx`、`.pdf`、`.pptx`、`.md` 四种格式
- 临时文件在 `finally` 块中清理
- Pandoc 路径查找：优先检查 `C:\Users\Walt\AppData\Roaming\pandoc\pandoc.exe`，回退到系统 PATH

---

## 6. 测试指南

- 项目暂无自动化测试框架
- 手动测试方式：
  ```powershell
  .\venv\Scripts\Activate.ps1
  python main.py convert test.md test.docx
  python main.py formats
  ```

---

## 7. 部署

### 运行环境要求

- Python 3.12+
- Pandoc 3.10（安装于 `C:\Users\Walt\AppData\Roaming\pandoc`，需加入系统 PATH 或在指定路径存在）

### 启动步骤

```powershell
cd d:\study\TraeProject\DocuForge
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python main.py convert <输入文件> <输出文件>
```

---

## 8. 版本控制

- **远程仓库**：未配置
- **当前分支**：未初始化 Git 仓库

### 8.1 提交格式规范

| 类型 | 格式 | 说明 | 示例 |
|------|------|------|------|
| 初始化项目 | `init(模块 : 初始化描述)` | 初始化项目结构、配置文件 | `init(all : 初始化 DocuForge 项目)` |
| 增加功能 | `add(模块 : 功能描述)` | 添加新功能、新依赖、新文件 | `add(核心 : 添加 PDF 转 Word 功能)` |
| 修复bug | `fix(模块 : 修复描述)` | 修复问题、修正错误 | `fix(核心 : 修复中文 PDF 编码问题)` |
| 删除内容 | `delete(模块 : 删除描述)` | 删除文件、移除无用代码 | `delete(核心 : 移除废弃的转换方法)` |
| 重构 | `refactor(模块 : 重构描述)` | 代码重构，不改变功能 | `refactor(核心 : 优化转换路由逻辑)` |
| 文档 | `docs(模块 : 文档描述)` | 更新文档 | `docs(README : 更新使用说明)` |

### 8.2 提交格式规则

- **模块标识**：使用 `核心`、`CLI`、`all` 或具体模块名
- **分隔符**：使用 `:` 分隔模块和描述，两侧各有一个空格
- **多提交**：使用 `&&` 连接多个提交类型，前后各有一个空格
- **示例**：`add(核心 : 添加批量转换功能) && fix(CLI : 修复参数解析错误)`

---

## 9. 已知约束

- Pandoc 安装路径固定为 `C:\Users\Walt\AppData\Roaming\pandoc`
- PDF 生成依赖 LaTeX 引擎（xelatex），若不可用则回退到 reportlab（功能有限，仅纯文本）
- PDF 转其他格式仅提取文本内容，不保留原始排版和图片
- 虚拟环境位于 `venv/` 目录，运行前需激活

---

## 10. Agent 自检清单

- [ ] 代码遵循项目约定（snake_case 命名、4 空格缩进）
- [ ] 未暴露任何机密或凭证
- [ ] 所有输入均已验证（文件格式、文件路径）
- [ ] 测试通过（手动验证转换功能）
- [ ] 变更最小化且聚焦
- [ ] 已获得用户提交/推送权限
