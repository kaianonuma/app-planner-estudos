'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, signOut } from '@/lib/auth'
import { getUserStudySessions, getUserAIAnalysis, getWeeklyProgress } from '@/lib/supabase-actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Brain,
  LogOut,
  Home,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [studySessions, setStudySessions] = useState<any[]>([])
  const [aiAnalysis, setAiAnalysis] = useState<any[]>([])
  const [weeklyProgress, setWeeklyProgress] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      router.push('/login')
      return
    }

    setUser(currentUser)

    // Carregar dados do dashboard
    const [sessionsResult, analysisResult, progressResult] = await Promise.all([
      getUserStudySessions(),
      getUserAIAnalysis(),
      getWeeklyProgress(),
    ])

    if (sessionsResult.success) setStudySessions(sessionsResult.data)
    if (analysisResult.success) setAiAnalysis(analysisResult.data)
    if (progressResult.success) setWeeklyProgress(progressResult.data)

    setIsLoading(false)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Logout realizado com sucesso!')
      router.push('/login')
    } catch (error) {
      toast.error('Erro ao fazer logout')
    }
  }

  // Calcular estatísticas
  const totalHoursStudied = studySessions.reduce((acc, session) => acc + session.hours_studied, 0)
  const averageMotivation = studySessions.length > 0
    ? Math.round(studySessions.reduce((acc, session) => acc + session.motivation_score, 0) / studySessions.length)
    : 0
  const totalTasksCompleted = studySessions.reduce((acc, session) => acc + session.tasks_completed, 0)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
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
                Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Acompanhe seu progresso de estudos
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/">
                <Button variant="outline" className="border-purple-200 hover:bg-purple-50">
                  <Home className="w-4 h-4 mr-2" />
                  Início
                </Button>
              </Link>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="border-purple-200 hover:bg-purple-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 sm:py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="border-purple-200/50 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total de Horas
                </CardTitle>
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {totalHoursStudied.toFixed(1)}h
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Horas estudadas
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200/50 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Sessões
                </CardTitle>
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {studySessions.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Sessões registradas
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-200/50 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Tarefas
                </CardTitle>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {totalTasksCompleted}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Tarefas completadas
              </p>
            </CardContent>
          </Card>

          <Card className="border-rose-200/50 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Motivação
                </CardTitle>
                <Sparkles className="w-5 h-5 text-rose-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {averageMotivation}%
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Nível médio
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sessions */}
        <Card className="border-purple-200/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Sessões Recentes
            </CardTitle>
            <CardDescription>
              Suas últimas sessões de estudo registradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {studySessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma sessão registrada ainda</p>
                <p className="text-sm mt-1">Comece criando sua primeira rotina!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {studySessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-gray-900">
                          {new Date(session.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      {session.notes && (
                        <p className="text-sm text-gray-600 ml-6">{session.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-purple-600">
                          {session.hours_studied}h
                        </div>
                        <div className="text-xs text-gray-500">Horas</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-blue-600">
                          {session.tasks_completed}
                        </div>
                        <div className="text-xs text-gray-500">Tarefas</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-rose-600">
                          {session.motivation_score}%
                        </div>
                        <div className="text-xs text-gray-500">Motivação</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Analysis */}
        <Card className="border-blue-200/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              Análises da IA
            </CardTitle>
            <CardDescription>
              Insights e recomendações personalizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {aiAnalysis.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma análise disponível ainda</p>
                <p className="text-sm mt-1">Crie uma rotina para receber insights da IA!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {aiAnalysis.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Sparkles className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {analysis.insights}
                        </h4>
                        {analysis.recommendations && analysis.recommendations.length > 0 && (
                          <ul className="space-y-1 text-sm text-gray-600">
                            {analysis.recommendations.map((rec: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(analysis.created_at).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(analysis.created_at).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
