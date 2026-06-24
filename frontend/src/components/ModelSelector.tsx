import { useEffect, useState } from 'react'
import { OllamaModel } from '../types'
import axios from 'axios'
import { Cpu, AlertCircle, CheckCircle } from 'lucide-react'

interface Props {
  value: string
  onChange: (model: string) => void
}

export default function ModelSelector({ value, onChange }: Props) {
  const [models, setModels] = useState<OllamaModel[]>([])
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  useEffect(() => {
    checkOllama()
  }, [])

  const checkOllama = async () => {
    try {
      const res = await axios.get('/api/ollama/status')
      if (res.data.running) {
        setStatus('online')
        const modRes = await axios.get('/api/ollama/models')
        setModels(modRes.data.models)
        if (modRes.data.models.length > 0 && !value) {
          onChange(modRes.data.models[0].name)
        }
      } else {
        setStatus('offline')
      }
    } catch {
      setStatus('offline')
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Cpu className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-semibold text-gray-700">AI 모델 선택</span>
        <div className="ml-auto flex items-center gap-1.5">
          {status === 'online' ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              <span className="text-xs text-green-600">Ollama 연결됨</span>
            </>
          ) : status === 'offline' ? (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-red-500" />
              <span className="text-xs text-red-600">Ollama 오프라인</span>
            </>
          ) : (
            <span className="text-xs text-gray-400">확인 중...</span>
          )}
        </div>
      </div>

      {status === 'offline' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 text-xs text-amber-700">
          Ollama가 실행되지 않았습니다. <code className="font-mono bg-amber-100 px-1 rounded">ollama serve</code> 명령을 실행하세요.
        </div>
      )}

      {models.length > 0 ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          {models.map((m) => (
            <option key={m.name} value={m.name}>
              {m.name} ({(m.size / 1024 / 1024 / 1024).toFixed(1)}GB)
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="예: exaone3.5:7.8b"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      )}

      <p className="text-xs text-gray-400 mt-2">
        권장: EXAONE (한국어 특화) · Qwen2.5 (다국어) · Gemma3
      </p>
    </div>
  )
}
