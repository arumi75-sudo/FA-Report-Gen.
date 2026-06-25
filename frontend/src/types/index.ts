export interface Issue {
  id: number
  title: string
  severity: 'high' | 'mid' | 'low'
  status: 'open' | 'resolved'
  created_at: string
}

export interface Project {
  id: number
  name: string
  status: 'active' | 'closed'
  created_at: string
  issues: Issue[]
}

export interface Site {
  id: number
  name: string
  code: string
  description: string | null
  created_at: string
  projects: Project[]
  input_count: number
}

export interface ReportItem {
  id: number
  input_data_id: number
  category: string
  content: string
  is_included: boolean
  created_at: string
  file_name: string | null
  site_code: string | null
}

export interface Report {
  id: number
  title: string
  final_content: string
  model_used: string | null
  download_url: string | null
  created_at: string
}

export interface IngestResponse {
  input_data_id: number
  site_code: string | null
  site_name: string | null
  project_name: string | null
  report_items_count: number
  message: string
}
