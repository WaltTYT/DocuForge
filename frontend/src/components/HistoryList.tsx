import { Download, FileText, CheckCircle, XCircle, Clock } from 'lucide-react'
import { getDownloadUrl } from '@/utils/api'
import { FORMAT_LABELS, type FileFormat } from '@/utils/format'
import type { HistoryItem } from '@/utils/api'

interface HistoryListProps {
  items: HistoryItem[]
  onRefresh: () => void
}

export default function HistoryList({ items }: HistoryListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">暂无转换记录</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="bg-white rounded-xl p-4 border border-slate-100 hover:border-primary-200 hover:shadow-md transition-all duration-200 animate-slide-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-center gap-3">
            <div className={`
              w-10 h-10 rounded-lg flex items-center justify-center
              ${item.status === 'success' ? 'bg-green-100' : 'bg-red-100'}
            `}>
              <FileText className={`w-5 h-5 ${item.status === 'success' ? 'text-green-600' : 'text-red-600'}`} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-800 truncate">
                {item.sourceFile}
              </p>
              <p className="text-sm text-slate-500">
                → {FORMAT_LABELS[item.targetFormat as FileFormat] || item.targetFormat}
                <span className="mx-2">·</span>
                {new Date(item.timestamp).toLocaleString('zh-CN')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {item.status === 'success' ? (
                <>
                  <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    成功
                  </span>
                  <a
                    href={getDownloadUrl(item.resultFile)}
                    className="p-2 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg transition-colors"
                    title="下载文件"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </>
              ) : (
                <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                  <XCircle className="w-3 h-3" />
                  失败
                </span>
              )}
            </div>
          </div>

          {item.error && (
            <div className="mt-2 p-2 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">{item.error}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
