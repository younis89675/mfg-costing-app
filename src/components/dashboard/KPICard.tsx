'use client'
import clsx from 'clsx'
import type { LucideIcon } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string
  change?: number
  icon: LucideIcon
  iconColor?: string
  trend?: 'up' | 'down' | 'neutral'
  subtitle?: string
}

export function KPICard({ title, value, change, icon: Icon, iconColor = 'text-blue-600', trend, subtitle }: KPICardProps) {
  return (
    <div className="kpi-card gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{title}</span>
        <div className={clsx('flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800/80', iconColor.replace('text-', 'bg-').replace('600', '50').replace('dark:text-', 'dark:bg-').replace('400', '950/40'))}>
          <Icon className={clsx('w-4 h-4', iconColor)} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{value}</p>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {change !== undefined && (
        <div className={clsx('flex items-center gap-1 text-xs font-medium',
          change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
        )}>
          <span>{change >= 0 ? '▲' : '▼'}</span>
          <span>{Math.abs(change).toFixed(1)}% vs target</span>
        </div>
      )}
    </div>
  )
}

export function KPICardSkeleton() {
  return (
    <div className="kpi-card gap-3">
      <div className="flex items-center justify-between">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-8 w-8 rounded-lg" />
      </div>
      <div className="skeleton h-8 w-32 rounded" />
      <div className="skeleton h-3 w-20" />
    </div>
  )
}
