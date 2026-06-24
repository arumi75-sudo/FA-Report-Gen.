import { useRef, useState } from 'react'
import axios from 'axios'
import { Upload, Send, Loader2, CheckCircle2, FileText, X } from 'lucide-react'
import { IngestResponse } from '../types'

interface Props {
  model: string
  onSuccess: (result: IngestResponse) => void
}

export default function InputPanel({ model, onSuccess }: Props) {
  const [text, setText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const [lastResult, setLastResult] = useState<IngestResponse | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleTextSubmit = async () => {
    if (!text.trim()) return
    setLoading(true)
    setProgress('텍스트 분석 중...')
    try {
      const res = await axios.post<IngestResponse>('/api/ingest/text', {
        content: text,
        model,
      })
      setLastResult(res.data)
      onSuccess(res.data)
      setText('')
    } catch (e: any) {
      alert('오류: ' + (e.response?.data?.detail || e.message))
    } finally {
      setLoading(false)
      setProgress('')
    }
  }

  const handleFileSubmit = async () => {
    if (files.length === 0) return
    setLoading(true)
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      setProgress(`파일 처리 중 (${i + 1}/${files.length}): ${file.name}`)
      const form = new FormData()
      form.append('file', file)
      form.append('model', model)
      try {
        const res = await axios.post<IngestResponse>('/api/ingest/file', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        setLastResult(res.data)
        onSuccess(res.data)
      } catch (e: any) {
        alert(`${file.name} 처리 오류: ` + (e.response?.data?.detail || e.message))
      }
    }
    setFiles([])
    setLoading(false)
    setProgress('')
  }

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
      <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <Send className="w-4 h-4 text-red-500" />
        데이터 입력
      </h2>

      {/* 텍스트 입력 */}
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">텍스트 직접 입력</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="현장 보고 내용, 회의록, 이슈 내용 등을 붙여넣기 하세요...&#10;&#10;예) ESMI 현장에서 배터리 모듈 라인 이슈가 발생하였습니다..."
          rows={8}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
        <button
          onClick={handleTextSubmit}
          disabled={loading || !text.trim()}
          className="mt-2 w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {loading ? progress || '처리 중...' : '텍스트 분석 및 저장'}
        </button>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <label className="text-xs font-medium text-gray-500 mb-2 block">파일 업로드 (PDF / Word / Excel)</label>
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-red-300 hover:bg-red-50 transition-colors"
        >
          <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
          <p className="text-xs text-gray-500">클릭하여 파일 선택</p>
          <p className="text-xs text-gray-400">.pdf .docx .xlsx 지원</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.xlsx,.xls,.txt,.csv"
          className="hidden"
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
        />

        {files.length > 0 && (
          <div className="mt-2 space-y-1">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-50 rounded px-3 py-1.5 text-xs">
                <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="flex-1 truncate">{f.name}</span>
                <span className="text-gray-400 shrink-0">{(f.size / 1024).toFixed(0)}KB</span>
                <button onClick={() => removeFile(i)}>
                  <X className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            ))}
            <button
              onClick={handleFileSubmit}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition-colors mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {loading ? progress || '처리 중...' : `${files.length}개 파일 분석`}
            </button>
          </div>
        )}
      </div>

      {lastResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-xs">
          <div className="flex items-center gap-1.5 text-green-700 font-medium mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            처리 완료
          </div>
          <div className="text-green-600 space-y-0.5">
            <p>• 현장: {lastResult.site_name || '미분류'} ({lastResult.site_code})</p>
            {lastResult.project_name && <p>• 프로젝트: {lastResult.project_name}</p>}
            <p>• 생성된 보고서 항목: {lastResult.report_items_count}개</p>
          </div>
        </div>
      )}
    </div>
  )
}
