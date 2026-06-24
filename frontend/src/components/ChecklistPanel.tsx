import axios from 'axios'
import { ReportItem } from '../types'
import { CheckSquare, Square, Tag, FileText, ToggleLeft, ToggleRight } from 'lucide-react'

interface Props {
  items: ReportItem[]
  onToggle: (id: number, value: boolean) => void
}

const CATEGORY_COLORS: Record<string, string> = {
  현황: 'bg-blue-50 text-blue-700 border-blue-200',
  이슈: 'bg-red-50 text-red-700 border-red-200',
  조치사항: 'bg-amber-50 text-amber-700 border-amber-200',
  계획: 'bg-green-50 text-green-700 border-green-200',
  기타: 'bg-gray-50 text-gray-700 border-gray-200',
}

export default function ChecklistPanel({ items, onToggle }: Props) {
  const includedCount = items.filter((i) => i.is_included).length

  const handleToggle = async (item: ReportItem) => {
    const newVal = !item.is_included
    onToggle(item.id, newVal)
    try {
      await axios.patch(`/api/report-items/${item.id}`, { is_included: newVal })
    } catch {
      onToggle(item.id, !newVal) // rollback
    }
  }

  const toggleAll = async (val: boolean) => {
    for (const item of items) {
      if (item.is_included !== val) {
        onToggle(item.id, val)
        try {
          await axios.patch(`/api/report-items/${item.id}`, { is_included: val })
        } catch {
          onToggle(item.id, !val)
        }
      }
    }
  }

  // Group by category
  const grouped = items.reduce<Record<string, ReportItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Tag className="w-4 h-4 text-red-500" />
          보고서 항목 선택
          <span className="text-xs font-normal text-gray-400">
            ({includedCount}/{items.length} 선택됨)
          </span>
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => toggleAll(true)}
            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
          >
            <ToggleRight className="w-3.5 h-3.5" /> 전체 선택
          </button>
          <button
            onClick={() => toggleAll(false)}
            className="text-xs text-gray-400 hover:underline flex items-center gap-1"
          >
            <ToggleLeft className="w-3.5 h-3.5" /> 전체 해제
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-xs">아직 보고서 항목이 없습니다.</p>
          <p className="text-xs">데이터를 입력하면 자동으로 항목이 생성됩니다.</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin">
          {Object.entries(grouped).map(([category, catItems]) => (
            <div key={category}>
              <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border mb-2 ${CATEGORY_COLORS[category] || CATEGORY_COLORS['기타']}`}>
                {category}
                <span className="font-normal opacity-70">({catItems.length})</span>
              </div>
              <div className="space-y-2">
                {catItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggle(item)}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      item.is_included
                        ? 'border-blue-200 bg-blue-50/50'
                        : 'border-gray-100 bg-gray-50/50 opacity-60'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {item.is_included ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 leading-relaxed">{item.content}</p>
                      {item.file_name && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {item.file_name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
