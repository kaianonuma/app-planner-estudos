'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { LucideIcon } from 'lucide-react'

type StatsCardProps = {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  progress?: number
  gradient: string
  iconColor: string
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  progress,
  gradient,
  iconColor,
}: StatsCardProps) {
  return (
    <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${gradient}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-white/90">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${iconColor} bg-white/20`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white">{value}</div>
        {subtitle && <p className="text-xs text-white/80 mt-1">{subtitle}</p>}
        {progress !== undefined && (
          <div className="mt-3">
            <Progress value={progress} className="h-2 bg-white/20" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
