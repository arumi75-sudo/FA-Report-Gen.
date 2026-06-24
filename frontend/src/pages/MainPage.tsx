import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { Site, ReportItem, Report, IngestResponse } from '../types'
import ModelSelector from '../components/ModelSelector'
import InputPanel from '../components/InputPanel'
import SiteTree from '../components/SiteTree'
import ChecklistPanel from '../components/ChecklistPanel'
import ReportOutput from '../components/ReportOutput'

export default function MainPage() {
  const [model, setModel] = useState('exaone3.5:7.8b')
  const [sites, setSites] = useState<Site[]>([])
  const [items, setItems] = useState<ReportItem[]>([])
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null)

  const fetchSites = useCallback(async () => {
    try {
      const res = await axios.get<Site[]>('/api/sites')
      setSites(res.data)
    } catch (e) {
      console.error('sites fetch error', e)
    }
  }, [])

  const fetchItems = useCallback(async () => {
    try {
      const url = selectedSiteId
        ? `/api/report-items?site_id=${selectedSiteId}`
        : '/api/report-items'
      const res = await axios.get<ReportItem[]>(url)
      setItems(res.data)
    } catch (e) {
      console.error('items fetch error', e)
    }
  }, [selectedSiteId])

  useEffect(() => {
    fetchSites()
  }, [fetchSites])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const handleIngestSuccess = async (_result: IngestResponse) => {
    await fetchSites()
    await fetchItems()
  }

  const handleToggle = (id: number, value: boolean) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_included: value } : item))
    )
  }

  const handleReportGenerated = (_report: Report) => {
    // 성공 시 특별한 처리 없음 — ReportOutput이 자체 표시
  }

  return (
    <div className="grid grid-cols-12 gap-4 h-full">
      {/* 좌측: 모델 선택 + 입력 패널 + 사이트 트리 */}
      <div className="col-span-3 flex flex-col gap-4">
        <ModelSelector value={model} onChange={setModel} />
        <InputPanel model={model} onSuccess={handleIngestSuccess} />
        <SiteTree
          sites={sites}
          selectedSiteId={selectedSiteId}
          onSelectSite={setSelectedSiteId}
        />
      </div>

      {/* 중앙: 체크리스트 */}
      <div className="col-span-4">
        <ChecklistPanel items={items} onToggle={handleToggle} />
      </div>

      {/* 우측: 보고서 출력 */}
      <div className="col-span-5">
        <ReportOutput
          model={model}
          siteId={selectedSiteId}
          onGenerated={handleReportGenerated}
        />
      </div>
    </div>
  )
}
