'use client'

import { useState, useEffect } from 'react'
import { RoutineForm } from '@/components/custom/routine-form'
import { StatsCard } from '@/components/custom/stats-card'
import { AnalysisDisplay } from '@/components/custom/analysis-display'
import { Clock, Calendar, TrendingUp, Heart, BarChart3, LogOut, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { analyzeRoutine, type RoutineAnalysisInput, type RoutineAnalysisOutput } from '@/lib/openai'
import { saveRoutine, saveAIAnalysis, saveStudySession } from '@/lib/supabase-actions'
import { getCurrentUser, signOut } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isGuest, setIsGuest] = useState(false)
  const [analysis, setAnalysis] = useState<RoutineAnalysisOutput | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentRoutineId, setCurrentRoutineId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkUser()

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setUser(session.user)
        setIsGuest(false)
        setIsLoading(false)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setIsGuest(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const checkUser = async () => {
    try {
      // Verificar se está em modo convidado
      const guestMode = localStorage.getItem('guestMode')
      if (guestMode === 'true') {
        setIsGuest(true)
        setIsLoading(false)
        return
      }

      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        setIsGuest(false)
      } else {
        // Se não tem usuário e não está em modo convidado, redireciona para login
        router.push('/login')
      }
    } catch (error) {
      // Em caso de erro, permite acesso como convidado
      setIsGuest(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      localStorage.removeItem('guestMode')
      toast.success('Logout realizado com sucesso!')
      router.push('/login')
    } catch (error) {
      toast.error('Erro ao fazer logout')
    }
  }

  const handleExitGuestMode = () => {
    localStorage.removeItem('guestMode')
    setIsGuest(false)
    router.push('/login')
  }

  const handleAnalyze = async (routineData: RoutineAnalysisInput) => {
    setIsAnalyzing(true)
    toast.loading('Analisando sua rotina com IA especializada...', { id: 'analyzing' })

    try {
      // Se for convidado, apenas analisa sem salvar
      if (isGuest) {
        const result = await analyzeRoutine(routineData)
        setAnalysis(result)
        toast.success('Análise completa concluída! (Modo convidado - dados não salvos)', { id: 'analyzing' })
        return
      }

      // 1. Salvar rotina no Supabase
      const routineResult = await saveRoutine({
        wakeTime: routineData.wakeUpTime,
        studyMethods: routineData.studyMethods,
        tasks: routineData.dailyTasks,
        priorities: routineData.priorities,
        restTime: routineData.restTime,
      })

      if (!routineResult.success) {
        const errorMessage = typeof routineResult.error === 'string' 
          ? routineResult.error 
          : 'Erro ao salvar rotina. Verifique se você está autenticado.'
        throw new Error(errorMessage)
      }

      const routineId = routineResult.data.id
      setCurrentRoutineId(routineId)

      // 2. Analisar com IA
      const result = await analyzeRoutine(routineData)
      setAnalysis(result)

      // 3. Salvar análise no Supabase
      await saveAIAnalysis({
        routineId,
        analysisData: result,
      })

      // 4. Criar sessão de estudo inicial
      await saveStudySession({
        routineId,
        date: new Date().toISOString().split('T')[0],
        hoursStudied: result.hoursStudied,
        tasksCompleted: routineData.dailyTasks,
        notes: 'Sessão inicial criada pela análise de IA',
      })

      toast.success('Rotina salva e análise completa concluída!', { id: 'analyzing' })
    } catch (error: any) {
      const errorMessage = error?.message || 'Erro ao analisar rotina. Tente novamente.'
      console.error('Error in handleAnalyze:', error)
      toast.error(errorMessage, { id: 'analyzing' })
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="border-b border-purple-200/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                スタディフロー
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                {isGuest ? (
                  <span className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className="inline-block w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                    Modo Convidado
                  </span>
                ) : (
                  `Olá, ${user?.user_metadata?.name || user?.email}`
                )}
              </p>
            </div>
            <div className="flex gap-2">
              {!isGuest && (
                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              )}
              {isGuest ? (
                <Button
                  onClick={handleExitGuestMode}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Fazer Login
                </Button>
              ) : (
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="border-purple-200 hover:bg-purple-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Guest Mode Banner */}
      {isGuest && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm sm:text-base">
              🎯 Você está no modo convidado. Suas análises não serão salvas.{' '}
              <button
                onClick={handleExitGuestMode}
                className="underline font-semibold hover:text-orange-100 transition-colors"
              >
                Criar uma conta
              </button>
              {' '}para salvar seu progresso!
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:py-8 space-y-8">
        {/* Stats Grid */}
        {analysis && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatsCard
              title="Horas Estudadas"
              value={`${analysis.hoursStudied}h`}
              subtitle="Estimativa diária"
              icon={Clock}
              gradient="bg-gradient-to-br from-purple-500 to-purple-600"
              iconColor="text-purple-600"
            />
            <StatsCard
              title="Dias Cumpridos"
              value={analysis.daysCompleted}
              subtitle="Sequência semanal"
              icon={Calendar}
              gradient="bg-gradient-to-br from-blue-500 to-blue-600"
              iconColor="text-blue-600"
            />
            <StatsCard
              title="Progresso Semanal"
              value={`${analysis.weeklyProgress}%`}
              subtitle="Meta da semana"
              icon={TrendingUp}
              progress={analysis.weeklyProgress}
              gradient="bg-gradient-to-br from-green-500 to-teal-600"
              iconColor="text-green-600"
            />
            <StatsCard
              title="Motivação"
              value={`${analysis.motivationLevel}%`}
              subtitle="Nível atual"
              icon={Heart}
              progress={analysis.motivationLevel}
              gradient="bg-gradient-to-br from-rose-500 to-pink-600"
              iconColor="text-rose-600"
            />
          </div>
        )}

        {/* Form and Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-6">
            <RoutineForm onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
          </div>

          {analysis && (
            <div className="space-y-6">
              <AnalysisDisplay
                insights={analysis.insights}
                recommendations={analysis.recommendations}
                detailedAnalysis={analysis.detailedAnalysis}
                imageAnalysis={analysis.imageAnalysis}
              />
            </div>
          )}
        </div>

        {/* Info Cards */}
        {!analysis && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-8">
            <div className="p-6 bg-white rounded-xl shadow-lg border border-purple-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Análise Inteligente
              </h3>
              <p className="text-sm text-gray-600">
                IA especializada analisa sua rotina e fornece insights personalizados baseados em ciência
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-lg border border-blue-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Acompanhamento
              </h3>
              <p className="text-sm text-gray-600">
                Monitore seu progresso ao longo do tempo com métricas detalhadas e científicas
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-lg border border-green-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Motivação
              </h3>
              <p className="text-sm text-gray-600">
                Receba recomendações acionáveis e mantenha-se motivado em sua jornada de estudos
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-purple-200/50 bg-white/80 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-sm text-gray-600">
            スタディフロー - Planner de estudos com IA especializada
          </p>
        </div>
      </footer>
    </div>
  )
}
