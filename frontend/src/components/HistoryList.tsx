import { Download, FileText, FileImage, Presentation, FileCode, CheckCircle, XCircle, Clock } from 'lucide-react'
import { getDownloadUrl } from '@/utils/api'
import { FORMAT_LABELS, getFileExtension, type FileFormat } from '@/utils/format'
import type { HistoryItem } from '@/utils/api'

interface HistoryListProps {
  items: HistoryItem[]
  onRefresh: () => void
}

const formatIcons: Record<FileFormat, typeof FileText> = {
  '.docx': FileText,
  '.pdf': FileImage,
  '.pptx': Presentation,
  '.md': FileCode,
}

export default function HistoryList({ items }: HistoryListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-slate-500 font-medium">暂无转换记录</p>
        <p className="text-sm text-slate-400 mt-1">上传文件并转换后，记录会显示在这里</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const sourceExt = getFileExtension(item.sourceFile) as FileFormat
        const TargetIcon = formatIcons[item.targetFormat as FileFormat] || FileText
        const SourceIcon = sourceExt ? formatIcons[sourceExt] : FileText
        
        return (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-primary-200 hover:shadow-card-hover transition-all duration-300 animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-4">
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center
                ${item.status === 'success' ? 'bg-green-50' : 'bg-red-50'}
              `}>
                {item.status === 'success' ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <SourceIcon className="w-4 h-4 text-slate-400" />
                  <p className="font-semibold text-slate-800 truncate">
                    {item.sourceFile}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-slate-300">→</span>
                  <TargetIcon className="w-4 h-4 text-primary-500" />
                  <span className="text-sm text-slate-600">
                    {FORMAT_LABELS[item.targetFormat as FileFormat] || item.targetFormat}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-sm text-slate-400">
                    {new Date(item.timestamp).toLocaleString('zh-CN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {item.status === 'success' ? (
                  <>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                      <CheckCircle className="w-3.5 h-3.5" />
                      成功
                    </span>
                    <a
                      href={getDownloadUrl(item.resultFile)}
                      className="group p-2.5 bg-primary-50 hover:bg-primary-100 text-primary-600 rounded-xl transition-all duration-200 hover:scale-110"
                      title="下载文件"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  </>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 text-xs font-semibold rounded-full">
                    <XCircle className="w-3.5 h-3.5" />
                    失败
                  </span>
                )}
              </div>
            </div>

            {item.error && (
              <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100">
                <p className="text-sm text-red-600">{item.error}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
