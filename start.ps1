# DocuForge 一键启动脚本
# 使用方法: 在 PowerShell 中执行 .\start.ps1

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DocuForge - 文档格式互转工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Python 虚拟环境
$VenvPath = Join-Path $ProjectRoot "venv"
if (-not (Test-Path $VenvPath)) {
    Write-Host "[1/4] 创建 Python 虚拟环境..." -ForegroundColor Yellow
    python -m venv $VenvPath
} else {
    Write-Host "[1/4] Python 虚拟环境已存在" -ForegroundColor Green
}

# 激活虚拟环境并安装后端依赖
$VenvPython = Join-Path $VenvPath "Scripts\python.exe"
$BackendReq = Join-Path $ProjectRoot "backend\requirements.txt"
$MainReq = Join-Path $ProjectRoot "requirements.txt"

Write-Host "[2/4] 安装 Python 依赖..." -ForegroundColor Yellow
& $VenvPython -m pip install -r $BackendReq --quiet 2>&1 | Out-Null
& $VenvPython -m pip install -r $MainReq --quiet 2>&1 | Out-Null
Write-Host "  Python 依赖已就绪" -ForegroundColor Green

# 检查前端依赖
$FrontendDir = Join-Path $ProjectRoot "frontend"
$NodeModules = Join-Path $FrontendDir "node_modules"

if (-not (Test-Path $NodeModules)) {
    Write-Host "[3/4] 安装前端依赖 (npm install)..." -ForegroundColor Yellow
    Set-Location $FrontendDir
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  npm install 失败，请手动执行: cd frontend; npm install" -ForegroundColor Red
    } else {
        Write-Host "  前端依赖已就绪" -ForegroundColor Green
    }
} else {
    Write-Host "[3/4] 前端依赖已存在" -ForegroundColor Green
}

Set-Location $ProjectRoot

# 启动后端
Write-Host "[4/4] 启动服务..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  后端: http://localhost:5000" -ForegroundColor Green
Write-Host "  前端: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "  按 Ctrl+C 停止所有服务" -ForegroundColor Yellow
Write-Host ""

$BackendApp = Join-Path $ProjectRoot "backend\app.py"

$backendJob = Start-Job -ScriptBlock {
    param($VenvPython, $BackendApp)
    & $VenvPython $BackendApp
} -ArgumentList $VenvPython, $BackendApp

$frontendJob = Start-Job -ScriptBlock {
    param($FrontendDir)
    Set-Location $FrontendDir
    npm run dev
} -ArgumentList $FrontendDir

try {
    while ($true) {
        Start-Sleep -Seconds 2
        $backendOutput = Receive-Job -Job $backendJob
        if ($backendOutput) {
            foreach ($line in $backendOutput) {
                Write-Host "[后端] $line" -ForegroundColor Blue
            }
        }
        $frontendOutput = Receive-Job -Job $frontendJob
        if ($frontendOutput) {
            foreach ($line in $frontendOutput) {
                Write-Host "[前端] $line" -ForegroundColor Magenta
            }
        }
        if (-not (Get-Job -Job $backendJob -ErrorAction SilentlyContinue) -or 
            -not (Get-Job -Job $frontendJob -ErrorAction SilentlyContinue)) {
            break
        }
    }
} finally {
    Write-Host ""
    Write-Host "正在停止服务..." -ForegroundColor Yellow
    Stop-Job -Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job -Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $frontendJob -ErrorAction SilentlyContinue
    Write-Host "服务已停止" -ForegroundColor Red
}
