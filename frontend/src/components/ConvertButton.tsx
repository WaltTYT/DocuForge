import { Loader2, Check, ArrowRight } from 'lucide-react'

interface ConvertButtonProps {
  onClick: () => void
  isLoading: boolean
  isComplete: boolean
  disabled: boolean
}

export default function ConvertButton({ onClick, isLoading, isComplete, disabled }: ConvertButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300
        flex items-center justify-center gap-3
        ${isComplete
          ? 'bg-green-500 text-white shadow-lg shadow-green-200'
          : isLoading
            ? 'bg-primary-500 text-white cursor-wait'
            : disabled
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-200 hover:shadow-xl hover:shadow-primary-300 hover:-translate-y-0.5 active:translate-y-0'
        }
      `}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>转换中...</span>
        </>
      ) : isComplete ? (
        <>
          <Check className="w-5 h-5" />
          <span>转换完成</span>
        </>
      ) : (
        <>
          <span>开始转换</span>
          <ArrowRight className="w-5 h-5" />
        </>
      )}
    </button>
  )
}
