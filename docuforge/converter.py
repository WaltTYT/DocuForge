"""核心转换引擎 - 基于 MarkItDown + Pandoc 实现文档互转"""

import os
import subprocess
import tempfile
from pathlib import Path

from markitdown import MarkItDown

# 支持的格式
SUPPORTED_FORMATS = {".docx", ".pdf", ".pptx", ".md", ".html", ".xlsx", ".csv", ".txt", ".epub"}


def _find_pandoc() -> str:
    """查找 pandoc 可执行文件"""
    search_paths = [
        r"C:\Users\Walt\AppData\Local\Pandoc\pandoc.exe",
        r"C:\Program Files\Pandoc\pandoc.exe",
        r"C:\Program Files (x86)\Pandoc\pandoc.exe",
    ]
    for p in search_paths:
        if os.path.isfile(p):
            return p
    return "pandoc"


def _run_pandoc(input_file: str, output_file: str, extra_args: list = None):
    """调用 pandoc 执行转换"""
    pandoc = _find_pandoc()
    cmd = [pandoc, input_file, "-o", output_file]
    if extra_args:
        cmd.extend(extra_args)
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"Pandoc 转换失败: {result.stderr.strip()}")


def _get_format(filepath: str) -> str:
    """获取文件扩展名（小写）"""
    return Path(filepath).suffix.lower()


def _check_format(fmt: str):
    """检查格式是否支持"""
    if fmt not in SUPPORTED_FORMATS:
        raise ValueError(
            f"不支持的格式: {fmt}，支持的格式: {', '.join(sorted(SUPPORTED_FORMATS))}"
        )


def convert(input_file: str, output_file: str):
    """
    将 input_file 转换为 output_file，格式由扩展名自动推断。

    架构：
      输入文件 → MarkItDown → Markdown → Pandoc → 输出文件

    支持的格式: .docx, .pdf, .pptx, .md, .html, .xlsx, .csv, .txt, .epub
    """
    input_file = os.path.abspath(input_file)
    output_file = os.path.abspath(output_file)

    if not os.path.isfile(input_file):
        raise FileNotFoundError(f"输入文件不存在: {input_file}")

    src_fmt = _get_format(input_file)
    dst_fmt = _get_format(output_file)
    _check_format(src_fmt)
    _check_format(dst_fmt)

    if src_fmt == dst_fmt:
        raise ValueError("输入和输出格式相同，无需转换")

    os.makedirs(os.path.dirname(output_file) or ".", exist_ok=True)

    # Step 1: 输入 → Markdown（通过 MarkItDown）
    md = MarkItDown()
    result = md.convert(input_file)
    md_content = result.text_content

    # Step 2: Markdown → 输出（通过 Pandoc）
    with tempfile.NamedTemporaryFile(
        suffix=".md", mode="w", encoding="utf-8", delete=False
    ) as f:
        f.write(md_content)
        tmp_md = f.name

    try:
        if dst_fmt == ".md":
            # 目标就是 Markdown，直接写文件
            with open(output_file, "w", encoding="utf-8") as f:
                f.write(md_content)
        elif dst_fmt == ".pdf":
            # PDF 需要 LaTeX 引擎渲染中文
            _run_pandoc(
                tmp_md,
                output_file,
                ["--pdf-engine=xelatex", "-V", "CJKmainfont=Microsoft YaHei"],
            )
        else:
            _run_pandoc(tmp_md, output_file)
    finally:
        if os.path.isfile(tmp_md):
            os.unlink(tmp_md)


def get_supported_formats() -> list:
    """返回支持的格式列表"""
    return sorted(SUPPORTED_FORMATS)
