import { useState, useEffect, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import FileUpload from '@/components/FileUpload'
import FormatSelector from '@/components/FormatSelector'
import ConvertButton from '@/components/ConvertButton'
import ConvertCompleteModal from '@/components/ConvertCompleteModal'
import HistoryList from '@/components/HistoryList'
import FormatInfo, { ConversionPaths } from '@/components/FormatInfo'
import { convertFile, getHistory, type HistoryItem } from '@/utils/api'
import { getFileExtension, type FileFormat } from '@/utils/format'

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [targetFormat, setTargetFormat] = useState<FileFormat | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [resultFile, setResultFile] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [error, setError] = useState<string | null>(null)

  const loadHistory = useCallback(async () => {
    try {
      const res = await getHistory()
      if (res.success) {
        setHistory(res.data)
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file)
    setTargetFormat(null)
    setResultFile(null)
    setError(null)
    setModalOpen(false)
  }, [])

  const handleClearFile = useCallback(() => {
    setSelectedFile(null)
    setTargetFormat(null)
    setResultFile(null)
    setError(null)
    setModalOpen(false)
  }, [])

  const handleConvert = useCallback(async () => {
    if (!selectedFile || !targetFormat) return

    setIsConverting(true)
    setError(null)
    setResultFile(null)
    setModalOpen(false)

    try {
      const res = await convertFile(selectedFile, targetFormat)
      if (res.success && res.resultFile) {
        setResultFile(res.resultFile)
        setModalOpen(true)
        await loadHistory()
      } else {
        setError(res.error || '转换失败')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '转换请求失败')
    } finally {
      setIsConverting(false)
    }
  }, [selectedFile, targetFormat, loadHistory])

  const sourceFormat = selectedFile ? getFileExtension(selectedFile.name) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="DocuForge Logo" className="w-12 h-12 rounded-xl shadow-lg object-cover" />
            <div>
              <h1 className="text-xl font-bold text-slate-800">DocuForge</h1>
              <p className="text-xs text-slate-500">文档格式互转工具</p>
            </div>
          </div>
          <button
            onClick={loadHistory}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="刷新历史"
          >
            <RefreshCw className="w-5 h-5 text-slate-500" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Convert Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8 animate-slide-up">
          <div className="space-y-6">
            <FileUpload
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              onClearFile={handleClearFile}
            />

            <FormatSelector
              sourceFormat={sourceFormat}
              targetFormat={targetFormat}
              onTargetFormatChange={setTargetFormat}
            />

            <ConvertButton
              onClick={handleConvert}
              isLoading={isConverting}
              disabled={!selectedFile || !targetFormat}
            />

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl animate-slide-up">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
        </section>

        {/* Convert Complete Modal */}
        <ConvertCompleteModal
          open={modalOpen}
          resultFile={resultFile || ''}
          fileName={selectedFile?.name || ''}
          onClose={() => setModalOpen(false)}
          onConvertAgain={() => {
            setModalOpen(false)
            setResultFile(null)
            setSelectedFile(null)
            setTargetFormat(null)
          }}
        />

        {/* History Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">转换历史</h2>
          <HistoryList items={history} onRefresh={loadHistory} />
        </section>

        {/* Format Info Section */}
        <section className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">支持的格式</h2>
          <FormatInfo />

          <h3 className="text-base font-semibold text-slate-700 mt-6 mb-3">支持的转换路径</h3>
          <ConversionPaths />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white/50 mt-12">
        <div className="max-w-5xl mx-auto px-6 py-4 text-center">
          <p className="text-sm text-slate-500">
            DocuForge v1.0.0 · 基于 Pandoc 驱动
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
