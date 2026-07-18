import { X, CheckCircle2, Download, RotateCcw } from 'lucide-react'
import { getDownloadUrl } from '@/utils/api'

interface ConvertCompleteModalProps {
  open: boolean
  resultFile: string
  fileName: string
  onClose: () => void
  onConvertAgain: () => void
}

export default function ConvertCompleteModal({
  open,
  resultFile,
  fileName,
  onClose,
  onConvertAgain,
}: ConvertCompleteModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      {/* modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>

        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">转换完成</h3>
          <p className="text-sm text-slate-500 mt-1">
            {fileName} 已成功转换
          </p>
        </div>

        <div className="space-y-3">
          <a
            href={getDownloadUrl(resultFile)}
            className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-200 hover:-translate-y-0.5 transition-all duration-200"
          >
            <Download className="w-5 h-5" />
            下载文件
          </a>

          <button
            onClick={onConvertAgain}
            className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            继续转换
          </button>
        </div>
      </div>
    </div>
  )
}
