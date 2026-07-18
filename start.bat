@echo off
chcp 65001 >nul
title DocuForge 一键启动

echo ========================================
echo   DocuForge - 文档格式互转工具
echo ========================================
echo.

cd /d "%~dp0"

REM 检查 Python 虚拟环境
if not exist "venv" (
    echo [1/5] 创建 Python 虚拟环境...
    python -m venv venv
) else (
    echo [1/5] Python 虚拟环境已存在
)

REM 安装 Python 依赖
echo [2/5] 安装 Python 依赖...
call venv\Scripts\activate.bat
pip install -r backend\requirements.txt -q
pip install -r requirements.txt -q
echo   Python 依赖已就绪

REM 检查前端依赖
echo [3/5] 检查前端依赖...
if not exist "frontend\node_modules" (
    echo   正在安装前端依赖...
    cd frontend
    call npm install
    cd ..
) else (
    echo   前端依赖已就绪
)

echo [4/5] 启动服务...
echo.
echo   后端: http://localhost:5000
echo   前端: http://localhost:5173
echo.
echo   按任意键退出
echo.

REM 启动后端（新窗口）
start "DocuForge Backend" cmd /k "cd /d %~dp0 && venv\Scripts\activate.bat && python backend\app.py"

REM 启动前端（新窗口）
start "DocuForge Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

REM 等待用户按键
pause

REM 关闭子窗口
taskkill /fi "WINDOWTITLE eq DocuForge Backend" /im cmd.exe >nul 2>&1
taskkill /fi "WINDOWTITLE eq DocuForge Frontend" /im cmd.exe >nul 2>&1

echo.
echo 服务已停止
pause
