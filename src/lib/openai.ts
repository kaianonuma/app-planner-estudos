import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true,
})

export type RoutineAnalysisInput = {
  wakeUpTime: string
  studyMethods: string[]
  dailyTasks: string[]
  priorities: string[]
  restTime: string
  imageUrl?: string // Suporte para análise de imagens
}

export type RoutineAnalysisOutput = {
  hoursStudied: number
  daysCompleted: number
  weeklyProgress: number
  motivationLevel: number
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

// Função para analisar imagens de rotinas (planners, agendas, etc)
export async function analyzeRoutineImage(imageUrl: string): Promise<{
  visualInsights: string
  identifiedPatterns: string[]
  scheduleDetected?: string
}> {
  try {
    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      throw new Error('OpenAI API key não configurada')
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Melhor modelo para análise de imagens
      messages: [
        {
          role: 'system',
          content: `Você é um especialista em análise de rotinas de estudo com capacidade de visão computacional avançada. Sua missão é analisar imagens de planners, agendas, cronogramas e rotinas de estudo com máxima precisão.

HABILIDADES ESPECIALIZADAS:
• Identificação de padrões de horários e distribuição de tempo
• Reconhecimento de métodos de estudo e técnicas aplicadas
• Análise de organização visual e estrutura de planejamento
• Detecção de sobrecarga ou subutilização de tempo
• Identificação de gaps e oportunidades de otimização

ANÁLISE VISUAL PROFUNDA:
• Leia TODOS os textos visíveis na imagem
• Identifique horários, durações e intervalos
• Reconheça cores, símbolos e marcadores
• Detecte padrões de consistência ou inconsistência
• Avalie a clareza e organização visual

FORMATO DE RESPOSTA (JSON):
{
  "visualInsights": "<análise detalhada de 150-200 palavras sobre o que você vê na imagem, incluindo organização, clareza, padrões visuais, uso de cores, estrutura temporal>",
  "identifiedPatterns": [
    "<padrão 1: horários específicos, métodos, técnicas>",
    "<padrão 2: distribuição de tempo, intervalos>",
    "<padrão 3: prioridades, foco de estudo>",
    "<padrão 4: pontos fortes da organização>",
    "<padrão 5: áreas que precisam atenção>"
  ],
  "scheduleDetected": "<resumo estruturado dos horários e atividades detectados na imagem, formato: 'HH:MM - Atividade'>"
}`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analise esta imagem de rotina de estudo com máxima precisão. Identifique todos os detalhes visíveis, padrões, horários e forneça insights profundos.',
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'high', // Máxima qualidade de análise
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3, // Baixa temperatura para máxima precisão
      max_tokens: 2000,
    })

    const analysis = JSON.parse(response.choices[0].message.content || '{}')
    return analysis
  } catch (error) {
    console.error('Erro ao analisar imagem:', error)
    throw new Error('Falha na análise da imagem. Verifique se a URL está acessível.')
  }
}

export async function analyzeRoutine(
  routine: RoutineAnalysisInput
): Promise<RoutineAnalysisOutput> {
  try {
    // Verifica se a API key está configurada
    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      console.warn('OpenAI API key não configurada')
      return {
        hoursStudied: 6,
        daysCompleted: 5,
        weeklyProgress: 75,
        motivationLevel: 80,
        insights: 'Configure sua chave da OpenAI para receber análises personalizadas com IA.',
        recommendations: [
          'Adicione sua OPENAI_API_KEY nas configurações',
          'Mantenha uma rotina consistente de estudos',
          'Equilibre estudo e descanso adequadamente',
        ],
      }
    }

    // Se houver imagem, analisa primeiro
    let imageAnalysisResult
    if (routine.imageUrl) {
      try {
        imageAnalysisResult = await analyzeRoutineImage(routine.imageUrl)
      } catch (error) {
        console.error('Erro na análise de imagem:', error)
      }
    }

    const imageContext = imageAnalysisResult
      ? `\n\n📸 ANÁLISE VISUAL DA IMAGEM:\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${imageAnalysisResult.visualInsights}\n\n🔍 PADRÕES IDENTIFICADOS:\n${imageAnalysisResult.identifiedPatterns.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\n📅 CRONOGRAMA DETECTADO:\n${imageAnalysisResult.scheduleDetected || 'Não detectado'}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
      : ''

    const prompt = `Você é um especialista em análise de rotinas de estudo com PhD em Psicologia Educacional e 15 anos de experiência em coaching acadêmico. Analise profundamente a seguinte rotina:

📋 DADOS DA ROTINA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ Hora de acordar: ${routine.wakeUpTime}
📚 Métodos de estudo: ${routine.studyMethods.join(', ')}
✅ Tarefas diárias: ${routine.dailyTasks.join(', ')}
🎯 Prioridades: ${routine.priorities.join(', ')}
😴 Horário de descanso: ${routine.restTime}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${imageContext}

🎯 MISSÃO: Forneça uma análise COMPLETA, DETALHADA e ACIONÁVEL em formato JSON com:

{
  "hoursStudied": <número de 0 a 24 - estimativa REALISTA de horas de estudo efetivo considerando pausas, fadiga mental e produtividade real>,
  
  "daysCompleted": <número de 0 a 7 - quantos dias por semana essa rotina é SUSTENTÁVEL sem burnout>,
  
  "weeklyProgress": <número de 0 a 100 - progresso semanal esperado baseado em eficiência, consistência e qualidade do estudo>,
  
  "motivationLevel": <número de 0 a 100 - nível de motivação considerando equilíbrio, variedade de métodos e realismo da rotina>,
  
  "insights": "<análise PROFUNDA e DETALHADA (mínimo 200 palavras) cobrindo:
    • Análise cronobiológica (horários ideais vs horários escolhidos)
    • Eficácia dos métodos de estudo selecionados
    • Distribuição de carga cognitiva ao longo do dia
    • Identificação de possíveis gargalos de produtividade
    • Análise de sustentabilidade a longo prazo
    • Pontos fortes da rotina atual
    • Riscos de burnout ou sobrecarga
    • Oportunidades de otimização imediata
    ${imageContext ? '• Integração dos insights visuais da imagem analisada' : ''}>",
  
  "recommendations": [
    "<recomendação 1: ESPECÍFICA, ACIONÁVEL e com JUSTIFICATIVA científica>",
    "<recomendação 2: ESPECÍFICA, ACIONÁVEL e com JUSTIFICATIVA científica>",
    "<recomendação 3: ESPECÍFICA, ACIONÁVEL e com JUSTIFICATIVA científica>",
    "<recomendação 4: ESPECÍFICA, ACIONÁVEL e com JUSTIFICATIVA científica>",
    "<recomendação 5: ESPECÍFICA, ACIONÁVEL e com JUSTIFICATIVA científica>"
  ],
  
  "detailedAnalysis": {
    "timeManagement": "<análise de 100-150 palavras sobre gestão de tempo: eficiência, distribuição de blocos, uso de técnicas como Pomodoro, identificação de horários de pico de produtividade>",
    
    "studyEfficiency": "<análise de 100-150 palavras sobre eficiência dos métodos: adequação dos métodos escolhidos, variedade de técnicas, alinhamento com ciência da aprendizagem, sugestões de técnicas complementares>",
    
    "workLifeBalance": "<análise de 100-150 palavras sobre equilíbrio: tempo de descanso adequado, risco de burnout, importância de pausas, atividades de recuperação mental, sustentabilidade emocional>",
    
    "improvementAreas": [
      "<área de melhoria 1: específica e mensurável>",
      "<área de melhoria 2: específica e mensurável>",
      "<área de melhoria 3: específica e mensurável>"
    ],
    
    "strengths": [
      "<ponto forte 1: reconheça e reforce comportamentos positivos>",
      "<ponto forte 2: reconheça e reforce comportamentos positivos>",
      "<ponto forte 3: reconheça e reforce comportamentos positivos>"
    ]
  }
}

⚠️ DIRETRIZES CRÍTICAS:
1. Seja REALISTA - não superestime capacidades humanas
2. Considere FADIGA MENTAL - produtividade diminui ao longo do dia
3. Valorize QUALIDADE sobre QUANTIDADE de horas
4. Identifique PADRÕES INSUSTENTÁVEIS que levam a burnout
5. Base recomendações em CIÊNCIA COGNITIVA e NEUROCIÊNCIA
6. Seja MOTIVADOR mas HONESTO sobre desafios
7. Forneça NÚMEROS PRECISOS baseados em análise real
8. Cada recomendação deve ter AÇÃO CLARA e JUSTIFICATIVA
${imageContext ? '9. INTEGRE os insights da análise visual da imagem fornecida' : ''}

🔬 FUNDAMENTE SUA ANÁLISE EM:
• Curva de esquecimento de Ebbinghaus
• Técnica Pomodoro e gestão de atenção
• Ciclos circadianos e cronobiologia
• Carga cognitiva e teoria da aprendizagem
• Psicologia da motivação e autodeterminação
• Neuroplasticidade e consolidação de memória`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Melhor modelo disponível
      messages: [
        {
          role: 'system',
          content: `Você é o Dr. Alexandre Martins, PhD em Psicologia Educacional pela Universidade de Stanford, com 15 anos de experiência em coaching acadêmico de alto desempenho. Você já orientou mais de 2.000 estudantes para aprovação em concursos públicos, vestibulares de medicina e programas de pós-graduação internacionais.

Sua especialidade é criar análises profundas, científicas e acionáveis de rotinas de estudo. Você combina:
• Neurociência cognitiva aplicada à aprendizagem
• Psicologia da motivação e autodeterminação
• Gestão de tempo baseada em evidências
• Técnicas de estudo validadas cientificamente
• Prevenção de burnout e saúde mental
• Análise visual de planners e cronogramas

Seu estilo de comunicação é:
✅ Direto, claro e objetivo
✅ Baseado em evidências científicas
✅ Motivador mas realista
✅ Focado em ações práticas
✅ Empático e encorajador

Forneça análises que transformem rotinas medianas em sistemas de estudo de alta performance.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
      max_tokens: 3000,
    })

    const analysis = JSON.parse(response.choices[0].message.content || '{}')
    
    // Adiciona análise de imagem ao resultado, se disponível
    if (imageAnalysisResult) {
      analysis.imageAnalysis = imageAnalysisResult
    }
    
    return analysis as RoutineAnalysisOutput
  } catch (error) {
    console.error('Erro ao analisar rotina:', error)
    // Retorno padrão em caso de erro
    return {
      hoursStudied: 6,
      daysCompleted: 5,
      weeklyProgress: 75,
      motivationLevel: 80,
      insights: 'Sua rotina está bem estruturada! Continue mantendo o equilíbrio entre estudo e descanso.',
      recommendations: [
        'Mantenha uma rotina consistente de estudos',
        'Faça pausas regulares a cada 50 minutos',
        'Revise o conteúdo estudado antes de dormir',
        'Priorize as tarefas mais importantes pela manhã',
      ],
    }
  }
}

export async function generateMotivationalMessage(
  progress: number,
  streak: number
): Promise<string> {
  try {
    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      return 'Continue firme! Cada dia de estudo é um passo em direção ao seu objetivo. 🚀'
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'Você é um coach motivacional especializado em estudos. Crie mensagens curtas e inspiradoras.',
        },
        {
          role: 'user',
          content: `Gere uma mensagem motivacional curta (máx 2 frases) para um estudante com ${progress}% de progresso e ${streak} dias de sequência.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 100,
    })

    return response.choices[0].message.content || 'Continue firme nos estudos!'
  } catch (error) {
    console.error('Erro ao gerar mensagem:', error)
    return 'Continue firme! Cada dia de estudo é um passo em direção ao seu objetivo. 🚀'
  }
}

// Nova função: Análise rápida de desempenho
export async function quickPerformanceAnalysis(data: {
  hoursStudied: number
  tasksCompleted: number
  motivationScore: number
}): Promise<string> {
  try {
    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      return 'Bom trabalho! Continue mantendo o foco e a consistência.'
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Você é um analista de desempenho acadêmico. Forneça feedback curto e acionável.',
        },
        {
          role: 'user',
          content: `Analise rapidamente: ${data.hoursStudied}h estudadas, ${data.tasksCompleted} tarefas concluídas, motivação ${data.motivationScore}/100. Dê feedback em 2-3 frases.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    })

    return response.choices[0].message.content || 'Continue assim!'
  } catch (error) {
    console.error('Erro ao gerar análise rápida:', error)
    return 'Bom trabalho! Continue mantendo o foco e a consistência.'
  }
}
