'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, BookOpen, Target, Coffee, Plus, X, Sparkles, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { ImageUpload } from './image-upload'

const routineSchema = z.object({
  wakeUpTime: z.string().min(1, 'Hora de acordar é obrigatória'),
  studyMethod: z.string().optional(),
  dailyTask: z.string().optional(),
  priority: z.string().optional(),
  restTime: z.string().min(1, 'Horário de descanso é obrigatório'),
})

type RoutineFormData = z.infer<typeof routineSchema>

type RoutineFormProps = {
  onAnalyze: (data: {
    wakeUpTime: string
    studyMethods: string[]
    dailyTasks: string[]
    priorities: string[]
    restTime: string
    imageUrl?: string
  }) => void
  isAnalyzing: boolean
}

export function RoutineForm({ onAnalyze, isAnalyzing }: RoutineFormProps) {
  const [studyMethods, setStudyMethods] = useState<string[]>([])
  const [dailyTasks, setDailyTasks] = useState<string[]>([])
  const [priorities, setPriorities] = useState<string[]>([])
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [showImageUpload, setShowImageUpload] = useState(false)

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<RoutineFormData>({
    resolver: zodResolver(routineSchema),
  })

  const addItem = (type: 'method' | 'task' | 'priority', value: string) => {
    if (!value.trim()) return

    if (type === 'method') {
      setStudyMethods([...studyMethods, value])
      setValue('studyMethod', '')
    } else if (type === 'task') {
      setDailyTasks([...dailyTasks, value])
      setValue('dailyTask', '')
    } else {
      setPriorities([...priorities, value])
      setValue('priority', '')
    }
  }

  const removeItem = (type: 'method' | 'task' | 'priority', index: number) => {
    if (type === 'method') {
      setStudyMethods(studyMethods.filter((_, i) => i !== index))
    } else if (type === 'task') {
      setDailyTasks(dailyTasks.filter((_, i) => i !== index))
    } else {
      setPriorities(priorities.filter((_, i) => i !== index))
    }
  }

  const onSubmit = (data: RoutineFormData) => {
    if (studyMethods.length === 0) {
      toast.error('Adicione pelo menos um método de estudo')
      return
    }
    if (dailyTasks.length === 0) {
      toast.error('Adicione pelo menos uma tarefa diária')
      return
    }
    if (priorities.length === 0) {
      toast.error('Adicione pelo menos uma prioridade')
      return
    }

    onAnalyze({
      wakeUpTime: data.wakeUpTime,
      studyMethods,
      dailyTasks,
      priorities,
      restTime: data.restTime,
      imageUrl: imageUrl || undefined,
    })
  }

  return (
    <div className="space-y-6">
      <Card className="w-full border-purple-200/50 shadow-xl bg-gradient-to-br from-white to-purple-50/30">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Configure sua Rotina
          </CardTitle>
          <CardDescription className="text-base">
            Preencha os detalhes da sua rotina de estudos para análise com IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Hora de Acordar */}
            <div className="space-y-2">
              <Label htmlFor="wakeUpTime" className="flex items-center gap-2 text-base font-semibold">
                <Clock className="w-5 h-5 text-purple-600" />
                Hora de Acordar
              </Label>
              <Input
                id="wakeUpTime"
                type="time"
                {...register('wakeUpTime')}
                className="text-base border-purple-200 focus:border-purple-400 focus:ring-purple-400"
              />
              {errors.wakeUpTime && (
                <p className="text-sm text-red-500">{errors.wakeUpTime.message}</p>
              )}
            </div>

            {/* Métodos de Estudo */}
            <div className="space-y-2">
              <Label htmlFor="studyMethod" className="flex items-center gap-2 text-base font-semibold">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Métodos de Estudo
              </Label>
              <div className="flex gap-2">
                <Input
                  id="studyMethod"
                  placeholder="Ex: Pomodoro, Flashcards, Resumos..."
                  {...register('studyMethod')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addItem('method', e.currentTarget.value)
                    }
                  }}
                  className="text-base border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                />
                <Button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('studyMethod') as HTMLInputElement
                    addItem('method', input.value)
                  }}
                  size="icon"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {studyMethods.map((method, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-3 py-1 text-sm bg-purple-100 text-purple-700 hover:bg-purple-200"
                  >
                    {method}
                    <button
                      type="button"
                      onClick={() => removeItem('method', index)}
                      className="ml-2 hover:text-purple-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tarefas do Dia */}
            <div className="space-y-2">
              <Label htmlFor="dailyTask" className="flex items-center gap-2 text-base font-semibold">
                <Target className="w-5 h-5 text-green-600" />
                Tarefas do Dia
              </Label>
              <div className="flex gap-2">
                <Input
                  id="dailyTask"
                  placeholder="Ex: Revisar matemática, Fazer exercícios..."
                  {...register('dailyTask')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addItem('task', e.currentTarget.value)
                    }
                  }}
                  className="text-base border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                />
                <Button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('dailyTask') as HTMLInputElement
                    addItem('task', input.value)
                  }}
                  size="icon"
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {dailyTasks.map((task, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-3 py-1 text-sm bg-green-100 text-green-700 hover:bg-green-200"
                  >
                    {task}
                    <button
                      type="button"
                      onClick={() => removeItem('task', index)}
                      className="ml-2 hover:text-green-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Prioridades */}
            <div className="space-y-2">
              <Label htmlFor="priority" className="flex items-center gap-2 text-base font-semibold">
                <Sparkles className="w-5 h-5 text-amber-600" />
                Prioridades
              </Label>
              <div className="flex gap-2">
                <Input
                  id="priority"
                  placeholder="Ex: Prova de física, Projeto final..."
                  {...register('priority')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addItem('priority', e.currentTarget.value)
                    }
                  }}
                  className="text-base border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                />
                <Button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('priority') as HTMLInputElement
                    addItem('priority', input.value)
                  }}
                  size="icon"
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {priorities.map((priority, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-3 py-1 text-sm bg-amber-100 text-amber-700 hover:bg-amber-200"
                  >
                    {priority}
                    <button
                      type="button"
                      onClick={() => removeItem('priority', index)}
                      className="ml-2 hover:text-amber-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Horário de Descanso */}
            <div className="space-y-2">
              <Label htmlFor="restTime" className="flex items-center gap-2 text-base font-semibold">
                <Coffee className="w-5 h-5 text-rose-600" />
                Horário de Descanso
              </Label>
              <Input
                id="restTime"
                type="time"
                {...register('restTime')}
                className="text-base border-purple-200 focus:border-purple-400 focus:ring-purple-400"
              />
              {errors.restTime && (
                <p className="text-sm text-red-500">{errors.restTime.message}</p>
              )}
            </div>

            {/* Botão para mostrar upload de imagem */}
            <Button
              type="button"
              onClick={() => setShowImageUpload(!showImageUpload)}
              variant="outline"
              className="w-full border-purple-200 hover:bg-purple-50"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              {showImageUpload ? 'Ocultar Upload de Imagem' : 'Adicionar Imagem da Rotina (Opcional)'}
            </Button>

            <Button
              type="submit"
              disabled={isAnalyzing}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 hover:from-purple-700 hover:via-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                  Analisando com IA...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Analisar Rotina com IA
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Upload de Imagem (condicional) */}
      {showImageUpload && (
        <ImageUpload
          onImageAnalyzed={(url) => setImageUrl(url)}
          isAnalyzing={isAnalyzing}
        />
      )}
    </div>
  )
}
