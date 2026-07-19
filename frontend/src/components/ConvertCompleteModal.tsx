import { X, CheckCircle2, Download, RotateCcw, Sparkles } from 'lucide-react'
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
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-bounce-in overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary-50 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-50 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:scale-110"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>

        <div className="relative text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-200 animate-pulse-glow">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-accent-500" />
            <h3 className="text-2xl font-bold text-slate-900">转换完成</h3>
            <Sparkles className="w-5 h-5 text-accent-500" />
          </div>
          <p className="text-slate-500">
            {fileName} 已成功转换为 {resultFile.split('.').pop()?.toUpperCase()} 格式
          </p>
        </div>

        <div className="relative space-y-4">
          <a
            href={getDownloadUrl(resultFile)}
            className="flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold rounded-2xl hover:shadow-btn-hover hover:-translate-y-0.5 transition-all duration-300"
          >
            <Download className="w-5 h-5" />
            下载文件
          </a>

          <button
            onClick={onConvertAgain}
            className="flex items-center justify-center gap-3 w-full py-4 bg-slate-50 text-slate-700 font-semibold rounded-2xl hover:bg-slate-100 transition-all duration-200"
          >
            <RotateCcw className="w-5 h-5" />
            继续转换其他文件
          </button>
        </div>
      </div>
    </div>
  )
}
