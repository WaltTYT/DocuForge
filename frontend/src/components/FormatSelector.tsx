import { useState } from 'react'
import { ChevronDown, Check, FileText, FileImage, Presentation, FileCode } from 'lucide-react'
import { type FileFormat, FORMAT_LABELS, getAvailableTargetFormats } from '@/utils/format'

interface FormatSelectorProps {
  sourceFormat: FileFormat | null
  targetFormat: FileFormat | null
  onTargetFormatChange: (format: FileFormat) => void
}

const formatIcons: Record<FileFormat, typeof FileText> = {
  '.docx': FileText,
  '.pdf': FileImage,
  '.pptx': Presentation,
  '.md': FileCode,
}

export default function FormatSelector({
  sourceFormat,
  targetFormat,
  onTargetFormatChange,
}: FormatSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const availableFormats = sourceFormat ? getAvailableTargetFormats(sourceFormat) : []

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-slate-700 mb-3">
        目标格式
      </label>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={!sourceFormat}
          className={`
            w-full flex items-center justify-between bg-white border-2 rounded-xl px-4 py-4 text-left transition-all duration-200
            ${sourceFormat
              ? 'border-slate-200 hover:border-primary-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 cursor-pointer'
              : 'border-slate-100 bg-slate-50 cursor-not-allowed'
            }
          `}
        >
          <div className="flex items-center gap-3">
            {targetFormat ? (
              <>
                {(() => {
                  const Icon = formatIcons[targetFormat]
                  return Icon ? <Icon className="w-5 h-5 text-primary-600" /> : null
                })()}
                <span className="font-semibold text-slate-800">
                  {FORMAT_LABELS[targetFormat]} ({targetFormat})
                </span>
              </>
            ) : (
              <span className="text-slate-400">
                {sourceFormat ? '选择目标格式...' : '请先上传文件'}
              </span>
            )}
          </div>
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && sourceFormat && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-lg shadow-slate-100 z-50 overflow-hidden animate-fade-in">
            <div className="py-1">
              {availableFormats.map((fmt) => {
                const Icon = formatIcons[fmt]
                const isSelected = targetFormat === fmt
                return (
                  <button
                    key={fmt}
                    onClick={() => {
                      onTargetFormatChange(fmt)
                      setIsOpen(false)
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150
                      ${isSelected ? 'bg-primary-50 text-primary-700' : 'hover:bg-slate-50 text-slate-700'}
                    `}
                  >
                    {Icon && <Icon className="w-5 h-5" />}
                    <span className="flex-1 font-medium">{FORMAT_LABELS[fmt]}</span>
                    <span className="text-sm text-slate-400">{fmt}</span>
                    {isSelected && <Check className="w-5 h-5 text-primary-500" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
