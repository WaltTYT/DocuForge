export type FileFormat = '.docx' | '.pdf' | '.pptx' | '.md'

export const SUPPORTED_FORMATS: FileFormat[] = ['.docx', '.pdf', '.pptx', '.md']

export const FORMAT_LABELS: Record<FileFormat, string> = {
  '.docx': 'Word',
  '.pdf': 'PDF',
  '.pptx': 'PPT',
  '.md': 'Markdown',
}

export const FORMAT_ICONS: Record<FileFormat, string> = {
  '.docx': 'FileText',
  '.pdf': 'FileType',
  '.pptx': 'Presentation',
  '.md': 'FileCode',
}

export function getFileExtension(filename: string): FileFormat | null {
  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase() as FileFormat
  if (SUPPORTED_FORMATS.includes(ext)) {
    return ext
  }
  return null
}

export function getAvailableTargetFormats(sourceFormat: FileFormat): FileFormat[] {
  return SUPPORTED_FORMATS.filter(f => f !== sourceFormat)
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
