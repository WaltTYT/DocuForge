import { ArrowRight, FileText, FileImage, FileCode, Presentation } from 'lucide-react'
import { SUPPORTED_FORMATS, FORMAT_LABELS, type FileFormat } from '@/utils/format'

const FORMAT_ICON_MAP: Record<FileFormat, React.ReactNode> = {
  '.docx': <FileText className="w-6 h-6" />,
  '.pdf': <FileImage className="w-6 h-6" />,
  '.pptx': <Presentation className="w-6 h-6" />,
  '.md': <FileCode className="w-6 h-6" />,
}

const FORMAT_COLORS: Record<FileFormat, string> = {
  '.docx': 'bg-blue-50 text-blue-600',
  '.pdf': 'bg-red-50 text-red-600',
  '.pptx': 'bg-orange-50 text-orange-600',
  '.md': 'bg-green-50 text-green-600',
}

const FORMAT_BORDER_COLORS: Record<FileFormat, string> = {
  '.docx': 'hover:border-blue-200',
  '.pdf': 'hover:border-red-200',
  '.pptx': 'hover:border-orange-200',
  '.md': 'hover:border-green-200',
}

export default function FormatInfo() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {SUPPORTED_FORMATS.map((fmt, index) => (
        <div
          key={fmt}
          className={`
            bg-white rounded-2xl p-5 border border-slate-100 ${FORMAT_BORDER_COLORS[fmt]}
            hover:shadow-card-hover transition-all duration-300 animate-slide-up
            group cursor-pointer
          `}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${FORMAT_COLORS[fmt]} group-hover:scale-110 transition-transform duration-300`}>
            {FORMAT_ICON_MAP[fmt]}
          </div>
          <h4 className="font-bold text-slate-800">{FORMAT_LABELS[fmt]}</h4>
          <p className="text-sm text-slate-400 mt-1">{fmt}</p>
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
    <div className="flex flex-wrap gap-3">
      {paths.map((path, index) => (
        <div
          key={index}
          className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-slate-100 text-sm hover:border-primary-200 hover:shadow-md transition-all duration-200"
        >
          <span className={`px-2.5 py-1 rounded-lg ${FORMAT_COLORS[path.from]} text-xs font-semibold`}>
            {FORMAT_LABELS[path.from]}
          </span>
          <ArrowRight className="w-4 h-4 text-slate-400" />
          <span className={`px-2.5 py-1 rounded-lg ${FORMAT_COLORS[path.to]} text-xs font-semibold`}>
            {FORMAT_LABELS[path.to]}
          </span>
        </div>
      ))}
    </div>
  )
}
