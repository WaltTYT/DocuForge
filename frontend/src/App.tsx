import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Trash2, ArrowDownToLine, Zap } from 'lucide-react'
import FileUpload from '@/components/FileUpload'
import FormatSelector from '@/components/FormatSelector'
import ConvertButton from '@/components/ConvertButton'
import ConvertCompleteModal from '@/components/ConvertCompleteModal'
import HistoryList from '@/components/HistoryList'
import FormatInfo, { ConversionPaths } from '@/components/FormatInfo'
import { convertFile, getHistory, clearHistory, type HistoryItem } from '@/utils/api'
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

  const handleClear = useCallback(async () => {
    if (!window.confirm('确定清除所有历史记录和文件吗？')) return
    try {
      await clearHistory()
      setHistory([])
    } catch {
      // ignore
    }
  }, [])

  const sourceFormat = selectedFile ? getFileExtension(selectedFile.name) : null

  return (
    <div className="min-h-screen bg-gradient-radial">
      <header className="glass-effect border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
                <ArrowDownToLine className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Docu<span className="text-gradient">Forge</span>
              </h1>
              <p className="text-xs text-slate-500">文档格式互转工具</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClear}
              className="group relative p-2.5 rounded-xl transition-all duration-200 text-slate-400 hover:text-red-500 hover:bg-red-50"
              title="清除历史"
            >
              <Trash2 className="w-5 h-5" />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                清除历史
              </span>
            </button>
            <button
              onClick={loadHistory}
              className="group relative p-2.5 rounded-xl transition-all duration-200 text-slate-400 hover:text-primary-600 hover:bg-primary-50"
              title="刷新历史"
            >
              <RefreshCw className="w-5 h-5" />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                刷新历史
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <section className="bg-white rounded-3xl shadow-card p-8 mb-8 animate-slide-up border border-slate-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full mb-4">
              <Zap className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">支持多种格式互转</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">选择文件并开始转换</h2>
            <p className="text-slate-500">拖拽上传或点击选择，一键完成格式转换</p>
          </div>

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
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl animate-fade-in">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
        </section>

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

        <section className="bg-white rounded-3xl shadow-card p-8 mb-8 animate-slide-up border border-slate-100" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">转换历史</h2>
            <span className="text-sm text-slate-400">最近 {history.length} 条记录</span>
          </div>
          <HistoryList items={history} onRefresh={loadHistory} />
        </section>

        <section className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="bg-white rounded-3xl shadow-card p-8 border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6">支持的格式</h2>
            <FormatInfo />

            <h3 className="text-lg font-semibold text-slate-800 mt-8 mb-4">支持的转换路径</h3>
            <ConversionPaths />
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 bg-white/50 mt-16">
        <div className="max-w-4xl mx-auto px-6 py-6 text-center">
          <p className="text-sm text-slate-400">
            DocuForge v1.0.0 · 基于 Pandoc & MarkItDown 驱动
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
