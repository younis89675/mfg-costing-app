'use client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList
} from 'recharts'
import type { ComputedProduct } from '@/types'
import { useAppStore } from '@/lib/store/appStore'
import { formatCurrency, formatPct } from '@/lib/utils/format'

interface Props {
  products: ComputedProduct[]
  top?: number
  mode?: 'top' | 'bottom'
}

const CustomTooltip = ({ active, payload, label }: any) => {
  const { settings } = useAppStore.getState()
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3 text-xs">
      <p className="font-semibold text-slate-900 dark:text-white mb-2 max-w-[180px] leading-tight">{d.productName}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">Revenue</span>
          <span className="font-mono font-medium">{formatCurrency(d.netSalePrice, settings.currency, settings.usdToLydRate)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">Total Cost</span>
          <span className="font-mono font-medium">{formatCurrency(d.totalCost, settings.currency, settings.usdToLydRate)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">Net Profit</span>
          <span className={`font-mono font-medium ${d.profitAfterInsurance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
            {formatCurrency(d.profitAfterInsurance, settings.currency, settings.usdToLydRate)}
          </span>
        </div>
        <div className="flex justify-between gap-4 pt-1 border-t border-slate-100 dark:border-slate-700">
          <span className="text-slate-500 font-semibold">Profitability</span>
          <span className={`font-mono font-bold ${d.profitabilityPct >= 10 ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-500'}`}>
            {formatPct(d.profitabilityPct)}
          </span>
        </div>
      </div>
    </div>
  )
}

function getBarColor(pct: number): string {
  if (pct >= 20) return '#10b981'
  if (pct >= 10) return '#3b82f6'
  if (pct >= 0)  return '#f59e0b'
  return '#ef4444'
}

export function ProfitabilityBarChart({ products, top = 10, mode = 'top' }: Props) {
  const sorted = [...products]
    .sort((a, b) => mode === 'top'
      ? b.profitabilityPct - a.profitabilityPct
      : a.profitabilityPct - b.profitabilityPct
    )
    .slice(0, top)

  const data = sorted.map(p => ({
    ...p,
    shortName: p.productName.length > 20 ? p.productName.slice(0, 18) + '…' : p.productName,
  }))

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 60, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148,163,184,0.2)" />
        <XAxis
          type="number"
          tickFormatter={v => `${v.toFixed(0)}%`}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="shortName"
          width={130}
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
        <Bar dataKey="profitabilityPct" radius={[0, 4, 4, 0]} maxBarSize={24}>
          {data.map((entry, i) => (
            <Cell key={i} fill={getBarColor(entry.profitabilityPct)} />
          ))}
          <LabelList dataKey="profitabilityPct" position="right" formatter={(v: number) => `${v.toFixed(1)}%`} style={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
