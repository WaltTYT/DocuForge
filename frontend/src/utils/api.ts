import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
})

export interface ConvertResponse {
  success: boolean
  taskId?: string
  resultFile?: string
  message?: string
  error?: string
}

export interface HistoryItem {
  id: string
  sourceFile: string
  targetFormat: string
  resultFile: string
  status: 'success' | 'failed'
  timestamp: string
  error?: string
}

export interface HistoryResponse {
  success: boolean
  data: HistoryItem[]
}

export async function convertFile(file: File, targetFormat: string): Promise<ConvertResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('targetFormat', targetFormat)

  const response = await api.post<ConvertResponse>('/convert', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export async function getHistory(): Promise<HistoryResponse> {
  const response = await api.get<HistoryResponse>('/history')
  return response.data
}

export function getDownloadUrl(filename: string): string {
  return `/api/download/${encodeURIComponent(filename)}`
}

export async function clearHistory(): Promise<{ success: boolean; deleted?: number }> {
  const response = await api.post('/clear')
  return response.data
}
