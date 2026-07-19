import { Loader2, ArrowRight, Zap } from 'lucide-react'

interface ConvertButtonProps {
  onClick: () => void
  isLoading: boolean
  disabled: boolean
}

export default function ConvertButton({ onClick, isLoading, disabled }: ConvertButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        relative w-full py-5 rounded-2xl font-bold text-lg transition-all duration-300
        flex items-center justify-center gap-3 overflow-hidden
        ${isLoading
          ? 'bg-primary-600 text-white cursor-wait'
          : disabled
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-btn hover:shadow-btn-hover hover:-translate-y-0.5 active:translate-y-0'
        }
      `}
    >
      {!disabled && !isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
      )}
      
      {isLoading ? (
        <>
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>转换中...</span>
        </>
      ) : (
        <>
          <Zap className="w-5 h-5" />
          <span>开始转换</span>
          <ArrowRight className="w-5 h-5" />
        </>
      )}
    </button>
  )
}
