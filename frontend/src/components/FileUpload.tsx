import { useCallback, useState } from 'react'
import { Upload, FileText, X, FileImage, FileCode, Presentation } from 'lucide-react'
import { getFileExtension, formatFileSize, SUPPORTED_FORMATS, FORMAT_LABELS, type FileFormat } from '@/utils/format'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  selectedFile: File | null
  onClearFile: () => void
}

const formatIcons: Record<FileFormat, typeof FileText> = {
  '.docx': FileText,
  '.pdf': FileImage,
  '.pptx': Presentation,
  '.md': FileCode,
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
  const FormatIcon = fileExt ? formatIcons[fileExt] : FileText

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer overflow-hidden
          ${isDragging
            ? 'border-primary-500 bg-primary-50 scale-[1.02]'
            : 'border-slate-200 hover:border-primary-400 hover:bg-slate-50'
          }
          ${selectedFile ? 'bg-white' : ''}
        `}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <div className={`
          absolute inset-0 opacity-0 transition-opacity duration-300
          ${isDragging ? 'opacity-100' : ''}
        `}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl" />
        </div>

        <input
          id="file-input"
          type="file"
          className="hidden"
          accept={SUPPORTED_FORMATS.join(',')}
          onChange={handleFileInput}
        />

        {!selectedFile ? (
          <div className="relative animate-fade-in">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary-200">
              <Upload className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              拖拽文件到此处上传
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              或点击选择文件
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {SUPPORTED_FORMATS.map(fmt => {
                const Icon = formatIcons[fmt]
                return (
                  <span
                    key={fmt}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 text-sm font-medium rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    {FORMAT_LABELS[fmt]}
                  </span>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="relative flex items-center gap-5 animate-slide-up">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200">
              <FormatIcon className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-slate-800 text-lg truncate">
                {selectedFile.name}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {formatFileSize(selectedFile.size)} · {fileExt ? FORMAT_LABELS[fileExt] : '未知格式'}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClearFile()
              }}
              className="group p-3 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110"
            >
              <X className="w-6 h-6 text-slate-400 group-hover:text-red-500" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
