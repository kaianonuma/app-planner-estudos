import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Verifica se as credenciais estão configuradas
const isConfigured = supabaseUrl && supabaseAnonKey && supabaseUrl !== '' && supabaseAnonKey !== ''

if (!isConfigured) {
  console.warn('⚠️ Supabase não configurado. Configure as variáveis de ambiente.')
}

// Cria o cliente Supabase com configurações otimizadas
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  global: {
    headers: {
      'x-application-name': 'study-flow',
    },
  },
  db: {
    schema: 'public',
  },
})

// Helper para verificar se o Supabase está configurado
export const isSupabaseConfigured = () => isConfigured

// Helper para obter o usuário atual com tratamento de erro robusto
export const getCurrentUser = async () => {
  if (!isConfigured) {
    console.warn('Supabase não configurado')
    return { user: null, error: new Error('Supabase não configurado') }
  }

  try {
    const { data, error } = await supabase.auth.getUser()
    
    if (error) {
      // Ignora erros de rede comuns que não afetam a funcionalidade
      if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
        console.warn('Erro de rede ao buscar usuário (ignorado):', error.message)
        return { user: null, error: null }
      }
      
      console.error('Error getting user:', error)
      return { user: null, error }
    }
    
    return { user: data.user, error: null }
  } catch (error) {
    // Captura erros de rede e outros erros inesperados
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network')) {
      console.warn('Erro de rede capturado (ignorado):', errorMessage)
      return { user: null, error: null }
    }
    
    console.error('Error getting user:', error)
    return { user: null, error: error instanceof Error ? error : new Error(errorMessage) }
  }
}

// Helper para verificar se o usuário está autenticado
export const isAuthenticated = async () => {
  const { user } = await getCurrentUser()
  return !!user
}

// Types para o banco de dados
export type Profile = {
  id: string
  name: string | null
  email: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type Routine = {
  id: string
  user_id: string
  wake_up_time: string
  study_methods: string[]
  daily_tasks: string[]
  priorities: string[]
  rest_time: string
  created_at: string
  updated_at: string
}

export type Task = {
  id: string
  user_id: string
  routine_id: string | null
  title: string
  description: string | null
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed'
  completed_at?: string
  created_at: string
}

export type StudySession = {
  id: string
  user_id: string
  routine_id: string | null
  date: string
  hours_studied: number
  tasks_completed: number
  motivation_score: number
  notes?: string
  created_at: string
}

export type AIAnalysis = {
  id: string
  user_id: string
  routine_id: string | null
  analysis_type: 'routine' | 'progress' | 'motivation'
  insights: string
  recommendations: string[]
  metrics: {
    hours_studied?: number
    days_completed?: number
    weekly_progress?: number
    motivation_level?: number
  }
  created_at: string
}
