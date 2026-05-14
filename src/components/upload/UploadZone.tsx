'use client'
import { useCallback, useState } from 'react'
import { Upload, CheckCircle2, AlertCircle, FileSpreadsheet, X } from 'lucide-react'
import clsx from 'clsx'

interface UploadZoneProps {
  label: string
  description: string
  accept?: string
  loaded: boolean
  rowCount?: number
  onFile: (file: File) => Promise<void>
  onClear?: () => void
}

export function UploadZone({ label, description, accept = '.xlsx,.xls,.csv', loaded, rowCount, onFile, onClear }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  const handle = useCallback(async (file: File) => {
    setError(null)
    setLoading(true)
    try {
      await onFile(file)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [onFile])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handle(file)
  }, [handle])

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handle(file)
  }, [handle])

  return (
    <div className={clsx(
      'relative rounded-xl border-2 border-dashed transition-all duration-200',
      loaded
        ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20'
        : dragging
          ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/20 scale-[1.01]'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/40'
    )}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <label className="flex flex-col items-center gap-3 p-6 cursor-pointer">
        <input type="file" accept={accept} className="sr-only" onChange={onChange} />

        {loading ? (
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        ) : loaded ? (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
        ) : (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800">
            <FileSpreadsheet className="w-5 h-5 text-slate-500" />
          </div>
        )}

        <div className="text-center">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
          {loaded && rowCount !== undefined && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">{rowCount} rows loaded</p>
          )}
        </div>

        {!loaded && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg font-medium">
            <Upload className="w-3 h-3" />
            Click or drag to upload
          </div>
        )}
      </label>

      {loaded && onClear && (
        <button
          onClick={e => { e.stopPropagation(); onClear() }}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          title="Remove file"
        >
          <X className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
        </button>
      )}

      {error && (
        <div className="mx-4 mb-4 flex items-start gap-2 p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  )
}
