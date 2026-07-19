"""核心转换引擎 - 基于 MarkItDown + Pandoc 实现文档互转"""

import os
import re
import subprocess
import tempfile
from pathlib import Path

from markitdown import MarkItDown

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
    from reportlab.lib.enums import TA_LEFT
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False

# 中文字体注册标记
_FONT_REGISTERED = False


def _register_chinese_font():
    """注册中文字体，返回字体名"""
    global _FONT_REGISTERED
    if _FONT_REGISTERED:
        return "ChineseFont"

    # 尝试多个中文字体路径
    font_paths = [
        r"C:\Windows\Fonts\msyh.ttc",    # Microsoft YaHei
        r"C:\Windows\Fonts\msyhbd.ttc",  # Microsoft YaHei Bold
        r"C:\Windows\Fonts\simhei.ttf",  # SimHei
        r"C:\Windows\Fonts\simsun.ttc",  # SimSun
    ]

    for font_path in font_paths:
        if os.path.isfile(font_path):
            try:
                pdfmetrics.registerFont(TTFont("ChineseFont", font_path))
                _FONT_REGISTERED = True
                return "ChineseFont"
            except Exception:
                continue

    return "Helvetica"

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
            # PDF 转换：先尝试 xelatex，失败则回退到无引擎模式，最后用 reportlab
            pdf_success = False
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
            if not pdf_success:
                raise RuntimeError("PDF 转换失败，未找到可用的 PDF 引擎")
        else:
            _run_pandoc(tmp_md, output_file)
    finally:
        if os.path.isfile(tmp_md):
            os.unlink(tmp_md)


def _generate_pdf_with_reportlab(md_content: str, output_file: str):
    """使用 reportlab 生成 PDF（回退方案）"""
    font_name = _register_chinese_font()

    doc = SimpleDocTemplate(
        output_file,
        pagesize=A4,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72,
    )
    styles = getSampleStyleSheet()

    # 配置样式
    normal_style = styles["Normal"]
    normal_style.alignment = TA_LEFT
    normal_style.fontName = font_name
    normal_style.fontSize = 11
    normal_style.leading = 18

    heading_styles = ["Heading1", "Heading2", "Heading3"]
    for hs_name in heading_styles:
        hs = styles[hs_name]
        hs.fontName = font_name

    flowables = []

    # 清理 Markdown 内容
    # 1. 移除 base64 图片（![...](data:image/...)）
    md_content = re.sub(r"!\[[^\]]*\]\(data:image/[^)]+\)", "[图片]", md_content)
    # 2. 移除普通图片引用的 base64 数据（保留文件名）
    md_content = re.sub(r"\(data:image/[^)]+\)", "(图片数据)", md_content)
    # 3. 转义 XML 特殊字符
    md_content = md_content.replace("&", "&amp;")

    lines = md_content.split("\n")
    for line in lines:
        line = line.strip()
        if not line:
            flowables.append(Spacer(1, 8))
            continue

        # 处理标题
        if line.startswith("### "):
            flowables.append(Paragraph(line[4:], styles["Heading3"]))
        elif line.startswith("## "):
            flowables.append(Paragraph(line[3:], styles["Heading2"]))
        elif line.startswith("# "):
            flowables.append(Paragraph(line[2:], styles["Heading1"]))
        else:
            # 普通段落，过滤掉无法解析的标签
            try:
                flowables.append(Paragraph(line, normal_style))
            except Exception:
                # 如果解析失败，用纯文本方式添加
                safe_text = re.sub(r"<[^>]+>", "", line)
                if safe_text.strip():
                    flowables.append(Paragraph(safe_text, normal_style))

    doc.build(flowables)


def get_supported_formats() -> list:
    """返回支持的格式列表"""
    return sorted(SUPPORTED_FORMATS)
