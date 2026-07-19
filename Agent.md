# Agent.md - DocuForge 项目规范

## 1. 项目概述

- **项目名称**：DocuForge
- **版本**：1.0.0
- **描述**：文档格式互转工具，支持 Word (.docx)、PDF (.pdf)、PPT (.pptx)、Markdown (.md) 之间的相互转换

### 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Python | 3.12.6 | 后端主语言 |
| Flask | >=2.0.0 | 后端 API 框架 |
| markitdown | >=0.1.0 | 文档读取引擎（PDF/DOCX/PPTX → Markdown） |
| Pandoc | 3.10 | 文档写入引擎（Markdown → DOCX/PDF/PPTX） |
| React | 18.3.1 | 前端框架 |
| TypeScript | 5.5.3 | 前端类型系统 |
| Vite | 5.3.1 | 前端构建工具 |
| TailwindCSS | 3.4.4 | 前端样式框架 |
| axios | 1.7.2 | HTTP 请求库 |
| lucide-react | 0.400.0 | 图标组件库 |

### 架构

前后端分离架构：
- **前端**：React + TypeScript + Vite + TailwindCSS，运行在 `http://localhost:5173`
- **后端**：Flask + markitdown + Pandoc，运行在 `http://localhost:5000`
- **转换流程**：输入文件 → MarkItDown 读取 → Markdown → Pandoc 写入 → 输出文件

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
  - 类名：`PascalCase`（如 `ConvertButton`）
  - React 组件：`PascalCase`
  - TypeScript 接口/类型：`PascalCase`
- 保持代码整洁和可维护

### 2.5 安全指南

- 不硬编码任何密钥或凭证
- 文件路径输入需验证，防止路径穿越攻击
- 临时文件使用后及时清理
- 外部命令调用（subprocess）需验证参数合法性
- 文件上传需校验格式（仅允许 `.docx`、`.pdf`、`.pptx`、`.md`）

---

## 3. 项目结构

```
DocuForge/
├── main.py                  # CLI 入口
├── requirements.txt         # Python 依赖
├── Agent.md                 # Agent 规范文件
├── venv/                    # Python 虚拟环境
├── docuforge/               # 核心转换包
│   ├── __init__.py           # 包定义 & 版本号
│   ├── converter.py          # 核心转换引擎（MarkItDown + Pandoc）
│   └── cli.py                # CLI 命令行接口
├── backend/                 # Flask 后端
│   ├── app.py                # API 服务入口
│   ├── requirements.txt      # 后端依赖
│   ├── uploads/              # 上传文件目录
│   └── outputs/              # 输出文件目录
└── frontend/                # React 前端
    ├── index.html            # HTML 模板
    ├── package.json          # 前端依赖
    ├── vite.config.ts        # Vite 配置
    ├── tailwind.config.js    # TailwindCSS 配置
    ├── postcss.config.js     # PostCSS 配置
    ├── tsconfig.json         # TypeScript 配置
    ├── public/               # 静态资源（logo.png）
    └── src/
        ├── main.tsx           # 前端入口
        ├── App.tsx            # 主应用组件
        ├── index.css          # 全局样式
        ├── components/        # UI 组件
        │   ├── FileUpload.tsx
        │   ├── FormatSelector.tsx
        │   ├── ConvertButton.tsx
        │   ├── ConvertCompleteModal.tsx
        │   ├── HistoryList.tsx
        │   └── FormatInfo.tsx
        └── utils/             # 工具函数
            ├── api.ts
            └── format.ts
```

---

## 4. 关键配置文件

| 文件 | 用途 |
|------|------|
| `requirements.txt` | Python 核心依赖（markitdown[all]） |
| `backend/requirements.txt` | Flask 后端依赖（flask、flask-cors） |
| `backend/app.py` | Flask API 服务（/api/convert、/api/history） |
| `docuforge/converter.py` | 核心转换逻辑（MarkItDown 读取 + Pandoc 写入） |
| `frontend/package.json` | 前端依赖声明 |
| `frontend/vite.config.ts` | Vite 构建配置 |
| `frontend/tailwind.config.js` | TailwindCSS 主题配置 |
| `venv/` | Python 虚拟环境（激活命令：`.\venv\Scripts\Activate.ps1`） |

---

## 5. 安全基线

- 文件路径通过 `os.path.abspath()` 规范化
- 格式校验：仅允许 `.docx`、`.pdf`、`.pptx`、`.md` 四种格式
- 临时文件在转换完成后清理
- Pandoc 路径查找：优先检查 `C:\Users\Walt\AppData\Local\Pandoc\pandoc.exe`，回退到系统 PATH
- Flask CORS 配置：允许 `http://localhost:5173` 跨域请求

---

## 6. 测试指南

- 项目暂无自动化测试框架
- 手动测试方式：

**后端测试：**
```powershell
.\venv\Scripts\Activate.ps1
python main.py convert test.md test.docx
python main.py formats
```

**前端测试：**
```powershell
cd frontend
npm run dev
```
访问 `http://localhost:5173` 上传文件测试转换功能

---

## 7. 部署

### 运行环境要求

- Python 3.12+
- Node.js 20+
- Pandoc 3.10（安装于 `C:\Users\Walt\AppData\Local\Pandoc`，需加入系统 PATH）

### 启动步骤

**后端：**
```powershell
cd d:\study\TraeProject\DocuForge
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
pip install flask flask-cors
python backend/app.py
```

**前端：**
```powershell
cd d:\study\TraeProject\DocuForge\frontend
npm install
npm run dev
```

访问 `http://localhost:5173` 即可使用

---

## 8. 版本控制

- **远程仓库**：`https://github.com/WaltTYT/DocuForge`
- **当前分支**：`main`

### 8.1 提交格式规范

| 类型 | 格式 | 说明 | 示例 |
|------|------|------|------|
| 初始化项目 | `init(模块: 初始化描述)` | 初始化项目结构、配置文件 | `init(all: 初始化 DocuForge 项目)` |
| 增加功能 | `add(模块: 功能描述)` | 添加新功能、新依赖、新文件 | `add(后端: 添加批量转换功能)` |
| 修复bug | `fix(模块: 修复描述)` | 修复问题、修正错误 | `fix(前端: 修复图片尺寸限制)` |
| 删除内容 | `delete(模块: 删除描述)` | 删除文件、移除无用代码 | `delete(前端: 删除默认模板文件)` |
| 重构 | `refactor(模块: 重构描述)` | 代码重构，不改变功能 | `refactor(后端: 优化异常处理)` |
| 文档 | `docs(模块: 文档描述)` | 更新文档 | `docs(README: 更新部署说明)` |

### 8.2 提交格式规则

- **模块标识**：使用 `后端`、`前端`、`核心`、`all` 或具体模块名
- **分隔符**：使用 `:` 分隔模块和描述，**无空格**
- **多提交**：使用 `&&` 连接多个提交类型，前后各有一个空格
- **示例**：`add(核心: 添加批量转换功能) && fix(CLI: 修复参数解析错误)`

---

## 9. 已知约束

- Pandoc 安装路径：`C:\Users\Walt\AppData\Local\Pandoc\pandoc.exe`
- 转换流程：输入文件 → MarkItDown → Markdown → Pandoc → 输出文件
- 前端运行端口：`http://localhost:5173`
- 后端运行端口：`http://localhost:5000`
- 虚拟环境位于 `venv/` 目录，运行前需激活

---

## 10. Agent 自检清单

- [ ] 代码遵循项目约定（snake_case 命名、4 空格缩进）
- [ ] 未暴露任何机密或凭证
- [ ] 所有输入均已验证（文件格式、文件路径）
- [ ] 测试通过（手动验证转换功能）
- [ ] 变更最小化且聚焦
- [ ] 已获得用户提交/推送权限