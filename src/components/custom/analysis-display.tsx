'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Brain, Lightbulb, TrendingUp, Clock, Target, Heart, CheckCircle2, AlertCircle, Image as ImageIcon, Eye } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type AnalysisDisplayProps = {
  insights: string
  recommendations: string[]
  detailedAnalysis?: {
    timeManagement: string
    studyEfficiency: string
    workLifeBalance: string
    improvementAreas: string[]
    strengths: string[]
  }
  imageAnalysis?: {
    visualInsights: string
    identifiedPatterns: string[]
    scheduleDetected?: string
  }
}

export function AnalysisDisplay({ insights, recommendations, detailedAnalysis, imageAnalysis }: AnalysisDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Card de Análise Visual (se disponível) */}
      {imageAnalysis && (
        <Card className="w-full border-indigo-200/50 shadow-xl bg-gradient-to-br from-white to-indigo-50/30">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-indigo-600" />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Análise Visual da Imagem
              </span>
            </CardTitle>
            <CardDescription>
              Insights extraídos da análise visual do seu planner/cronograma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Insights Visuais */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-semibold text-gray-900">O que a IA viu</h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed bg-indigo-50/50 p-4 rounded-lg border border-indigo-100 whitespace-pre-line">
                {imageAnalysis.visualInsights}
              </p>
            </div>

            {/* Padrões Identificados */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-semibold text-gray-900">Padrões Detectados</h3>
              </div>
              <div className="space-y-2">
                {imageAnalysis.identifiedPatterns.map((pattern, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100"
                  >
                    <Badge className="mt-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white shrink-0">
                      {index + 1}
                    </Badge>
                    <p className="text-sm text-gray-700 leading-relaxed flex-1">{pattern}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cronograma Detectado */}
            {imageAnalysis.scheduleDetected && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-semibold text-gray-900">Cronograma Identificado</h3>
                </div>
                <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line font-mono">
                    {imageAnalysis.scheduleDetected}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Card Principal - Análise Geral */}
      <Card className="w-full border-blue-200/50 shadow-xl bg-gradient-to-br from-white to-blue-50/30">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Análise Completa da IA
            </span>
          </CardTitle>
          <CardDescription className="text-base">
            Insights personalizados e científicos sobre sua rotina de estudos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Insights Principais */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Análise Detalhada</h3>
            </div>
            <p className="text-base text-gray-700 leading-relaxed bg-purple-50/50 p-4 rounded-lg border border-purple-100 whitespace-pre-line">
              {insights}
            </p>
          </div>

          <Separator className="bg-gradient-to-r from-purple-200 via-blue-200 to-purple-200" />

          {/* Recomendações */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-semibold text-gray-900">Recomendações Acionáveis</h3>
            </div>
            <div className="space-y-2">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-100 hover:shadow-md transition-shadow duration-200"
                >
                  <Badge className="mt-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white shrink-0">
                    {index + 1}
                  </Badge>
                  <p className="text-sm text-gray-700 leading-relaxed flex-1">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card de Análise Detalhada (se disponível) */}
      {detailedAnalysis && (
        <Card className="w-full border-purple-200/50 shadow-xl bg-gradient-to-br from-white to-purple-50/30">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Análise Aprofundada
              </span>
            </CardTitle>
            <CardDescription>
              Detalhamento científico de cada aspecto da sua rotina
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="time" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="time" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="hidden sm:inline">Gestão de Tempo</span>
                  <span className="sm:hidden">Tempo</span>
                </TabsTrigger>
                <TabsTrigger value="efficiency" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Eficiência</span>
                  <span className="sm:hidden">Efic.</span>
                </TabsTrigger>
                <TabsTrigger value="balance" className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  <span className="hidden sm:inline">Equilíbrio</span>
                  <span className="sm:hidden">Equil.</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="time" className="space-y-4">
                <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Gestão de Tempo
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {detailedAnalysis.timeManagement}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="efficiency" className="space-y-4">
                <div className="bg-green-50/50 p-4 rounded-lg border border-green-100">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    Eficiência dos Estudos
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {detailedAnalysis.studyEfficiency}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="balance" className="space-y-4">
                <div className="bg-rose-50/50 p-4 rounded-lg border border-rose-100">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-600" />
                    Equilíbrio Vida-Estudo
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {detailedAnalysis.workLifeBalance}
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <Separator className="my-6 bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200" />

            {/* Pontos Fortes e Áreas de Melhoria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pontos Fortes */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Pontos Fortes
                </h4>
                <div className="space-y-2">
                  {detailedAnalysis.strengths.map((strength, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 bg-green-50/50 rounded-lg border border-green-100"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-700 leading-relaxed">{strength}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Áreas de Melhoria */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  Áreas de Melhoria
                </h4>
                <div className="space-y-2">
                  {detailedAnalysis.improvementAreas.map((area, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 bg-orange-50/50 rounded-lg border border-orange-100"
                    >
                      <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-700 leading-relaxed">{area}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
