import { AlertTriangle, X } from 'lucide-react'

interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmText = '确定',
  cancelText = '取消',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 animate-slide-up">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:scale-110"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
          <p className="text-slate-500 mb-8">{message}</p>

          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all duration-200"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 px-4 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all duration-200 shadow-md shadow-red-200"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
