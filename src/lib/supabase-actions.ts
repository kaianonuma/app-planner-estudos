import { supabase } from './supabase'

// Salvar rotina
export async function saveRoutine(data: {
  wakeTime: string
  studyMethods: string[]
  tasks: string[]
  priorities: string[]
  restTime: string
}) {
  try {
    // Pegar usuário autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      // Ignora erros de rede que não impedem a funcionalidade
      if (!userError.message.includes('Failed to fetch') && !userError.message.includes('Network')) {
        console.error('Error getting user:', userError)
        throw new Error(`Erro ao obter usuário: ${userError.message}`)
      }
    }

    if (!user) {
      throw new Error('Usuário não autenticado. Faça login para salvar sua rotina.')
    }

    console.log('Saving routine for user:', user.id)

    const { data: routine, error } = await supabase
      .from('routines')
      .insert({
        user_id: user.id,
        wake_up_time: data.wakeTime,
        study_methods: data.studyMethods,
        daily_tasks: data.tasks,
        priorities: data.priorities,
        rest_time: data.restTime,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      
      // Mensagens de erro mais amigáveis
      if (error.code === '42501') {
        throw new Error(`
          ❌ Erro de permissão no banco de dados.
          
          Para corrigir:
          1. Acesse o Supabase Dashboard
          2. Vá em "SQL Editor"
          3. Execute o script em supabase-setup.sql
          
          Detalhes técnicos: ${error.message}
        `)
      }
      
      if (error.code === '23503') {
        throw new Error('Erro de referência no banco de dados. Verifique se o usuário existe.')
      }
      
      throw new Error(`Erro ao salvar rotina: ${error.message}`)
    }

    console.log('Routine saved successfully:', routine)
    return { success: true, data: routine }
  } catch (error: any) {
    console.error('Error saving routine:', error)
    return { 
      success: false, 
      error: error.message || 'Erro desconhecido ao salvar rotina'
    }
  }
}

// Salvar análise de IA
export async function saveAIAnalysis(data: {
  routineId: string
  analysisData: {
    hoursStudied: number
    daysCompleted: number
    weeklyProgress: number
    motivationLevel: number
    insights: string
    recommendations: string[]
  }
}) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      if (!userError.message.includes('Failed to fetch') && !userError.message.includes('Network')) {
        console.error('Error getting user:', userError)
        throw new Error(`Erro ao obter usuário: ${userError.message}`)
      }
    }

    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const { data: analysis, error } = await supabase
      .from('ai_analysis')
      .insert({
        user_id: user.id,
        routine_id: data.routineId,
        analysis_type: 'routine',
        insights: data.analysisData.insights,
        recommendations: data.analysisData.recommendations,
        metrics: {
          hours_studied: data.analysisData.hoursStudied,
          days_completed: data.analysisData.daysCompleted,
          weekly_progress: data.analysisData.weeklyProgress,
          motivation_level: data.analysisData.motivationLevel,
        },
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error details:', error)
      
      if (error.code === '42501') {
        throw new Error('Erro de permissão. Execute o script SQL de configuração no Supabase.')
      }
      
      throw new Error(`Erro ao salvar análise: ${error.message}`)
    }

    return { success: true, data: analysis }
  } catch (error: any) {
    console.error('Error saving AI analysis:', error)
    return { 
      success: false, 
      error: error.message || 'Erro desconhecido ao salvar análise'
    }
  }
}

// Salvar sessão de estudo
export async function saveStudySession(data: {
  routineId: string
  date: string
  hoursStudied: number
  tasksCompleted: string[]
  notes?: string
}) {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      if (!userError.message.includes('Failed to fetch') && !userError.message.includes('Network')) {
        console.error('Error getting user:', userError)
        throw new Error(`Erro ao obter usuário: ${userError.message}`)
      }
    }

    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const { data: session, error } = await supabase
      .from('study_sessions')
      .insert({
        user_id: user.id,
        routine_id: data.routineId,
        date: data.date,
        hours_studied: data.hoursStudied,
        tasks_completed: data.tasksCompleted.length,
        motivation_score: 75, // Score padrão
        notes: data.notes,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error details:', error)
      
      if (error.code === '42501') {
        throw new Error('Erro de permissão. Execute o script SQL de configuração no Supabase.')
      }
      
      throw new Error(`Erro ao salvar sessão: ${error.message}`)
    }

    return { success: true, data: session }
  } catch (error: any) {
    console.error('Error saving study session:', error)
    return { 
      success: false, 
      error: error.message || 'Erro desconhecido ao salvar sessão'
    }
  }
}

// Buscar rotinas do usuário
export async function getUserRoutines() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Usuário não autenticado')
    }

    const { data, error } = await supabase
      .from('routines')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error('Error fetching routines:', error)
    return { success: false, error: error.message, data: [] }
  }
}

// Buscar sessões de estudo do usuário
export async function getUserStudySessions() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Usuário não autenticado')
    }

    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(10)

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error('Error fetching study sessions:', error)
    return { success: false, error: error.message, data: [] }
  }
}

// Buscar análises de IA do usuário
export async function getUserAIAnalysis() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Usuário não autenticado')
    }

    const { data, error } = await supabase
      .from('ai_analysis')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error('Error fetching AI analysis:', error)
    return { success: false, error: error.message, data: [] }
  }
}

// Buscar progresso semanal
export async function getWeeklyProgress() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Usuário não autenticado')
    }

    const { data, error } = await supabase
      .from('weekly_progress')
      .select('*')
      .eq('user_id', user.id)
      .order('week_start', { ascending: false })
      .limit(4)

    if (error) throw error

    return { success: true, data }
  } catch (error: any) {
    console.error('Error fetching weekly progress:', error)
    return { success: false, error: error.message, data: [] }
  }
}
