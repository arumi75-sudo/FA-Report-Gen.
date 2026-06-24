import { useEffect, useState } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import { Report } from '../types'
import { History, ChevronDown, ChevronUp, FileText } from 'lucide-react'

export default function HistoryPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    axios.get<Report[]>('/api/reports').then((r) => setReports(r.data)).catch(console.error)
  }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
        <History className="w-5 h-5 text-red-500" />
        보고서 히스토리
        <span className="text-sm font-normal text-gray-400">({reports.length}건)</span>
      </h2>

      {reports.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>생성된 보고서가 없습니다.</p>
        </div>
      ) : (
        reports.map((report) => (
          <div key={report.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === report.id ? null : report.id)}
              className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <FileText className="w-4 h-4 text-red-500 shrink-0" />
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-gray-800">{report.title}</p>
                <p className="text-xs text-gray-400">
                  {new Date(report.created_at).toLocaleString('ko-KR')}
                  {report.model_used && ` · ${report.model_used}`}
                </p>
              </div>
              {expanded === report.id ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {expanded === report.id && (
              <div className="border-t border-gray-100 p-5">
                <div className="prose prose-sm max-w-none text-gray-800">
                  <ReactMarkdown>{report.final_content}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
