import { ArrowRight, FileText, FileType, FileCode, Presentation } from 'lucide-react'
import { SUPPORTED_FORMATS, FORMAT_LABELS, type FileFormat } from '@/utils/format'

const FORMAT_ICON_MAP: Record<FileFormat, React.ReactNode> = {
  '.docx': <FileText className="w-5 h-5" />,
  '.pdf': <FileType className="w-5 h-5" />,
  '.pptx': <Presentation className="w-5 h-5" />,
  '.md': <FileCode className="w-5 h-5" />,
}

const FORMAT_COLORS: Record<FileFormat, string> = {
  '.docx': 'bg-blue-100 text-blue-700',
  '.pdf': 'bg-red-100 text-red-700',
  '.pptx': 'bg-orange-100 text-orange-700',
  '.md': 'bg-green-100 text-green-700',
}

export default function FormatInfo() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {SUPPORTED_FORMATS.map((fmt, index) => (
        <div
          key={fmt}
          className="bg-white rounded-xl p-4 border border-slate-100 hover:border-primary-200 hover:shadow-md transition-all duration-300 animate-slide-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${FORMAT_COLORS[fmt]}`}>
            {FORMAT_ICON_MAP[fmt]}
          </div>
          <h4 className="font-semibold text-slate-800">{FORMAT_LABELS[fmt]}</h4>
          <p className="text-sm text-slate-500">{fmt}</p>
        </div>
      ))}
    </div>
  )
}

export function ConversionPaths() {
  const paths = [
    { from: '.md' as FileFormat, to: '.docx' as FileFormat },
    { from: '.md' as FileFormat, to: '.pdf' as FileFormat },
    { from: '.md' as FileFormat, to: '.pptx' as FileFormat },
    { from: '.docx' as FileFormat, to: '.md' as FileFormat },
    { from: '.docx' as FileFormat, to: '.pdf' as FileFormat },
    { from: '.pdf' as FileFormat, to: '.md' as FileFormat },
    { from: '.pdf' as FileFormat, to: '.docx' as FileFormat },
    { from: '.pptx' as FileFormat, to: '.md' as FileFormat },
    { from: '.pptx' as FileFormat, to: '.docx' as FileFormat },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {paths.map((path, index) => (
        <div
          key={index}
          className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-100 text-sm"
        >
          <span className={`px-2 py-0.5 rounded ${FORMAT_COLORS[path.from]} text-xs font-medium`}>
            {FORMAT_LABELS[path.from]}
          </span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span className={`px-2 py-0.5 rounded ${FORMAT_COLORS[path.to]} text-xs font-medium`}>
            {FORMAT_LABELS[path.to]}
          </span>
        </div>
      ))}
    </div>
  )
}
