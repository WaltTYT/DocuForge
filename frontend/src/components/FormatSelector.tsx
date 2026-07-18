import { ChevronDown } from 'lucide-react'
import { type FileFormat, FORMAT_LABELS, getAvailableTargetFormats } from '@/utils/format'

interface FormatSelectorProps {
  sourceFormat: FileFormat | null
  targetFormat: FileFormat | null
  onTargetFormatChange: (format: FileFormat) => void
}

export default function FormatSelector({
  sourceFormat,
  targetFormat,
  onTargetFormatChange,
}: FormatSelectorProps) {
  const availableFormats = sourceFormat ? getAvailableTargetFormats(sourceFormat) : []

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        目标格式
      </label>
      <div className="relative">
        <select
          value={targetFormat || ''}
          onChange={(e) => onTargetFormatChange(e.target.value as FileFormat)}
          disabled={!sourceFormat}
          className={`
            w-full appearance-none bg-white border-2 rounded-xl px-4 py-3 pr-10 text-slate-800 font-medium
            transition-all duration-200 cursor-pointer
            ${sourceFormat
              ? 'border-slate-200 hover:border-primary-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-100'
              : 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed'
            }
          `}
        >
          <option value="">
            {sourceFormat ? '选择目标格式...' : '请先上传文件'}
          </option>
          {availableFormats.map(fmt => (
            <option key={fmt} value={fmt}>
              {FORMAT_LABELS[fmt]} ({fmt})
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
      </div>
    </div>
  )
}
