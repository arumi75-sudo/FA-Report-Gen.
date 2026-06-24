import { useState } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import { FileOutput, Loader2, Download, Copy, Check } from 'lucide-react'
import { Report } from '../types'

interface Props {
  model: string
  siteId: number | null
  onGenerated: (report: Report) => void
}

export default function ReportOutput({ model, siteId, onGenerated }: Props) {
  const [title, setTitle] = useState('현장 현황 보고서')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<Report | null>(null)
  const [copied, setCopied] = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      const res = await axios.post<Report>('/api/reports/generate', {
        title,
        model,
        site_id: siteId,
      })
      setReport(res.data)
      onGenerated(res.data)
    } catch (e: any) {
      alert('오류: ' + (e.response?.data?.detail || e.message))
    } finally {
      setLoading(false)
    }
  }

  const copy = async () => {
    if (!report) return
    await navigator.clipboard.writeText(report.final_content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const download = () => {
    if (!report) return
    const blob = new Blob([report.final_content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${report.title}_${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <FileOutput className="w-4 h-4 text-red-500" />
        보고서 생성
      </h2>

      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="보고서 제목"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
        <button
          onClick={generate}
          disabled={loading}
          className="shrink-0 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileOutput className="w-4 h-4" />}
          {loading ? '생성 중...' : '보고서 생성'}
        </button>
      </div>

      {siteId && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          현재 선택된 현장의 항목만 포함됩니다. 전체 항목을 포함하려면 트리에서 선택을 해제하세요.
        </p>
      )}

      {report && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
            <div>
              <span className="text-sm font-semibold text-gray-800">{report.title}</span>
              <span className="text-xs text-gray-400 ml-2">
                {new Date(report.created_at).toLocaleString('ko-KR')}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copy}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-100 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? '복사됨' : '복사'}
              </button>
              <button
                onClick={download}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-100 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                다운로드
              </button>
            </div>
          </div>
          <div className="p-4 max-h-[500px] overflow-y-auto scrollbar-thin">
            <div className="prose prose-sm max-w-none text-gray-800">
              <ReactMarkdown>{report.final_content}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
