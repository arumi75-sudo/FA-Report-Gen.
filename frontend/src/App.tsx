import { useState } from 'react'
import MainPage from './pages/MainPage'
import HistoryPage from './pages/HistoryPage'
import { FileText, History, Activity } from 'lucide-react'

type Tab = 'main' | 'history'

export default function App() {
  const [tab, setTab] = useState<Tab>('main')

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">FA Report Generator</h1>
              <p className="text-xs text-gray-500">LG에너지솔루션 현장 보고서 AI 생성 시스템</p>
            </div>
          </div>
          <nav className="flex gap-1">
            <button
              onClick={() => setTab('main')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === 'main'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              보고서 생성
            </button>
            <button
              onClick={() => setTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === 'history'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <History className="w-4 h-4" />
              히스토리
            </button>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 py-4">
        {tab === 'main' ? <MainPage /> : <HistoryPage />}
      </main>
    </div>
  )
}
