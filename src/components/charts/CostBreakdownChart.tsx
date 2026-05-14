'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { ComputedProduct } from '@/types'
import { useAppStore } from '@/lib/store/appStore'
import { formatCurrency } from '@/lib/utils/format'

const COLORS = {
  'Raw Materials':  '#3b82f6',
  'Packaging':      '#8b5cf6',
  'Semi-Finished':  '#10b981',
  'Intermediates':  '#f59e0b',
  'Weight Expense': '#f97316',
}

const RCOLORS = Object.values(COLORS)

interface Props { products: ComputedProduct[] }

export function CostBreakdownChart({ products }: Props) {
  const { settings } = useAppStore()

  const totals = products.reduce((acc, p) => ({
    rawMaterial:   acc.rawMaterial   + p.rawMaterialCost,
    packaging:     acc.packaging     + p.packagingCost,
    semiFinished:  acc.semiFinished  + p.semiFinishedCost,
    intermediate:  acc.intermediate  + p.intermediateCost,
    weightExpense: acc.weightExpense + p.weightExpense,
  }), { rawMaterial: 0, packaging: 0, semiFinished: 0, intermediate: 0, weightExpense: 0 })

  const data = [
    { name: 'Raw Materials',  value: totals.rawMaterial   },
    { name: 'Packaging',      value: totals.packaging     },
    { name: 'Semi-Finished',  value: totals.semiFinished  },
    { name: 'Intermediates',  value: totals.intermediate  },
    { name: 'Weight Expense', value: totals.weightExpense },
  ].filter(d => d.value > 0)

  const total = data.reduce((s, d) => s + d.value, 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const d = payload[0]
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3 text-xs">
        <p className="font-semibold mb-1">{d.name}</p>
        <p className="font-mono">{formatCurrency(d.value, settings.currency, settings.usdToLydRate)}</p>
        <p className="text-slate-500">{total > 0 ? ((d.value / total) * 100).toFixed(1) : 0}% of total cost</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={95}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={RCOLORS[i % RCOLORS.length]} strokeWidth={0} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="square"
          iconSize={8}
          formatter={(v) => <span style={{ fontSize: 11, color: '#64748b' }}>{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
