import { useCallback, useState } from 'react'
import { Upload, FileText, X } from 'lucide-react'
import { getFileExtension, formatFileSize, SUPPORTED_FORMATS, FORMAT_LABELS, type FileFormat } from '@/utils/format'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  selectedFile: File | null
  onClearFile: () => void
}

export default function FileUpload({ onFileSelect, selectedFile, onClearFile }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const ext = getFileExtension(files[0].name)
      if (ext) {
        onFileSelect(files[0])
      }
    }
  }, [onFileSelect])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const ext = getFileExtension(files[0].name)
      if (ext) {
        onFileSelect(files[0])
      }
    }
  }, [onFileSelect])

  const fileExt = selectedFile ? getFileExtension(selectedFile.name) as FileFormat : null

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer
          ${isDragging
            ? 'border-primary-500 bg-primary-50 scale-[1.02]'
            : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50'
          }
          ${selectedFile ? 'bg-white' : ''}
        `}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          className="hidden"
          accept={SUPPORTED_FORMATS.join(',')}
          onChange={handleFileInput}
        />

        {!selectedFile ? (
          <div className="animate-fade-in">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              拖拽文件到此处上传
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              或点击选择文件
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUPPORTED_FORMATS.map(fmt => (
                <span
                  key={fmt}
                  className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full"
                >
                  {FORMAT_LABELS[fmt]}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 animate-slide-up">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-md">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-slate-800 truncate">
                {selectedFile.name}
              </p>
              <p className="text-sm text-slate-500">
                {formatFileSize(selectedFile.size)} · {fileExt ? FORMAT_LABELS[fileExt] : '未知格式'}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClearFile()
              }}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
