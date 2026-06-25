import { Cpu, CheckCircle } from 'lucide-react'

export default function ModelSelector() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-2">
        <Cpu className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-semibold text-gray-700">AI 모델</span>
        <div className="ml-auto flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
          <span className="text-xs text-green-600">Claude API 연결됨</span>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-2">claude-sonnet-4-6 (고정)</p>
    </div>
  )
}
