import { useState } from 'react'
import { Site } from '../types'
import {
  Building2, FolderOpen, Folder, AlertTriangle, CheckCircle2,
  ChevronRight, ChevronDown, Database,
} from 'lucide-react'

interface Props {
  sites: Site[]
  selectedSiteId: number | null
  onSelectSite: (id: number | null) => void
}

const SEVERITY_COLOR = {
  high: 'text-red-600 bg-red-50',
  mid: 'text-amber-600 bg-amber-50',
  low: 'text-green-600 bg-green-50',
}

export default function SiteTree({ sites, selectedSiteId, onSelectSite }: Props) {
  const [expandedSites, setExpandedSites] = useState<Set<number>>(new Set())
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set())

  const toggleSite = (id: number) => {
    setExpandedSites((prev) => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }

  const toggleProject = (id: number) => {
    setExpandedProjects((prev) => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-red-500" />
          현장 / 프로젝트 / 이슈
        </h2>
        {selectedSiteId && (
          <button
            onClick={() => onSelectSite(null)}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            전체 보기
          </button>
        )}
      </div>

      {sites.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Database className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-xs">아직 데이터가 없습니다.</p>
          <p className="text-xs">텍스트나 파일을 입력하면</p>
          <p className="text-xs">현장이 자동으로 분류됩니다.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {sites.map((site) => {
            const isExpanded = expandedSites.has(site.id)
            const isSelected = selectedSiteId === site.id
            return (
              <div key={site.id}>
                {/* Site Row */}
                <div
                  className={`flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'bg-red-50 border border-red-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    onSelectSite(isSelected ? null : site.id)
                    toggleSite(site.id)
                  }}
                >
                  <button
                    className="shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleSite(site.id)
                    }}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </button>
                  <Building2 className="w-4 h-4 text-red-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-gray-800 truncate block">{site.code}</span>
                    <span className="text-xs text-gray-500 truncate block">{site.name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs text-gray-400 block">{site.input_count}건</span>
                    <span className="text-xs text-gray-400 block">{site.projects.length}PJ</span>
                  </div>
                </div>

                {/* Projects */}
                {isExpanded && (
                  <div className="ml-5 border-l border-gray-100 pl-3 mt-1 space-y-1">
                    {site.projects.length === 0 ? (
                      <p className="text-xs text-gray-400 py-1 px-2">프로젝트 없음</p>
                    ) : (
                      site.projects.map((proj) => {
                        const isProjExpanded = expandedProjects.has(proj.id)
                        return (
                          <div key={proj.id}>
                            <div
                              className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                              onClick={() => toggleProject(proj.id)}
                            >
                              <button className="shrink-0">
                                {isProjExpanded ? (
                                  <ChevronDown className="w-3 h-3 text-gray-300" />
                                ) : (
                                  <ChevronRight className="w-3 h-3 text-gray-300" />
                                )}
                              </button>
                              {isProjExpanded ? (
                                <FolderOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              ) : (
                                <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              )}
                              <span className="text-xs text-gray-700 flex-1 truncate">{proj.name}</span>
                              <span
                                className={`text-xs px-1.5 py-0.5 rounded shrink-0 ${
                                  proj.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                                }`}
                              >
                                {proj.status === 'active' ? '진행' : '완료'}
                              </span>
                            </div>

                            {/* Issues */}
                            {isProjExpanded && (
                              <div className="ml-5 border-l border-gray-100 pl-3 space-y-1">
                                {proj.issues.length === 0 ? (
                                  <p className="text-xs text-gray-400 py-1 px-2">이슈 없음</p>
                                ) : (
                                  proj.issues.map((issue) => (
                                    <div
                                      key={issue.id}
                                      className="flex items-start gap-2 px-2 py-1.5 rounded hover:bg-gray-50"
                                    >
                                      {issue.status === 'resolved' ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                                      ) : (
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                      )}
                                      <span className="text-xs text-gray-600 flex-1 leading-tight">{issue.title}</span>
                                      <span
                                        className={`text-xs px-1.5 py-0.5 rounded shrink-0 font-medium ${
                                          SEVERITY_COLOR[issue.severity as keyof typeof SEVERITY_COLOR] || 'text-gray-500 bg-gray-100'
                                        }`}
                                      >
                                        {issue.severity.toUpperCase()}
                                      </span>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
