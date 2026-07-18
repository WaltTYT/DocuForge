"""CLI 命令行接口"""

import argparse
import os
import sys

from . import __version__
from .converter import convert, get_supported_formats


def main():
    parser = argparse.ArgumentParser(
        prog="docuforge",
        description="DocuForge - 文档格式互转工具 (Word/PDF/PPT/Markdown)",
    )
    parser.add_argument("-v", "--version", action="version", version=f"DocuForge {__version__}")

    subparsers = parser.add_subparsers(dest="command", help="可用命令")

    # convert 命令
    conv_parser = subparsers.add_parser("convert", aliases=["c"], help="转换文件格式")
    conv_parser.add_argument("input", help="输入文件路径")
    conv_parser.add_argument("output", help="输出文件路径 (格式由扩展名决定)")

    # batch 命令
    batch_parser = subparsers.add_parser("batch", aliases=["b"], help="批量转换")
    batch_parser.add_argument("input_dir", help="输入目录")
    batch_parser.add_argument("output_dir", help="输出目录")
    batch_parser.add_argument("-t", "--to", required=True, help="目标格式 (如 .docx, .md, .pdf, .pptx)")
    batch_parser.add_argument("-f", "--from", dest="from_fmt", default=None, help="仅转换指定源格式")

    # formats 命令
    subparsers.add_parser("formats", aliases=["f"], help="显示支持的格式")

    args = parser.parse_args()

    if args.command is None:
        parser.print_help()
        sys.exit(0)

    if args.command in ("formats", "f"):
        fmts = get_supported_formats()
        print("支持的格式:", ", ".join(fmts))
        print("\n所有格式可通过 Markdown 中转互转")

    if args.command in ("convert", "c"):
        if not os.path.isfile(args.input):
            print(f"错误: 输入文件不存在: {args.input}", file=sys.stderr)
            sys.exit(1)
        try:
            print(f"正在转换: {args.input} -> {args.output}")
            convert(args.input, args.output)
            print(f"转换完成: {args.output}")
        except Exception as e:
            print(f"转换失败: {e}", file=sys.stderr)
            sys.exit(1)
        return

    if args.command in ("batch", "b"):
        if not os.path.isdir(args.input_dir):
            print(f"错误: 输入目录不存在: {args.input_dir}", file=sys.stderr)
            sys.exit(1)

        from .converter import SUPPORTED_FORMATS
        os.makedirs(args.output_dir, exist_ok=True)
        target_fmt = args.to if args.to.startswith(".") else f".{args.to}"

        success, failed = 0, 0
        for fname in os.listdir(args.input_dir):
            fpath = os.path.join(args.input_dir, fname)
            if not os.path.isfile(fpath):
                continue
            ext = os.path.splitext(fname)[1].lower()
            if ext not in SUPPORTED_FORMATS:
                continue
            if args.from_fmt and ext != (args.from_fmt if args.from_fmt.startswith(".") else f".{args.from_fmt}"):
                continue
            if ext == target_fmt:
                continue

            out_name = os.path.splitext(fname)[0] + target_fmt
            out_path = os.path.join(args.output_dir, out_name)
            try:
                print(f"  {fname} -> {out_name}")
                convert(fpath, out_path)
                success += 1
            except Exception as e:
                print(f"  {fname} -> 失败: {e}", file=sys.stderr)
                failed += 1

        print(f"\n批量转换完成: 成功 {success}, 失败 {failed}")


if __name__ == "__main__":
    main()
