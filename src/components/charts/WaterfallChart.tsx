'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import type { ComputedProduct } from '@/types'
import { useAppStore } from '@/lib/store/appStore'
import { formatCurrency } from '@/lib/utils/format'

interface Props { product: ComputedProduct }

export function WaterfallChart({ product: p }: Props) {
  const { settings } = useAppStore()
  const fmt = (v: number) => formatCurrency(v, settings.currency, settings.usdToLydRate)

  // Waterfall: start at netSalePrice, subtract costs one by one
  const data = [
    { name: 'Net Sale\nPrice',  value: p.netSalePrice,           fill: '#3b82f6', base: 0 },
    { name: 'Raw Mat.',         value: -p.rawMaterialCost,        fill: '#ef4444', base: p.netSalePrice - p.rawMaterialCost },
    { name: 'Packaging',        value: -p.packagingCost,          fill: '#f97316', base: p.netSalePrice - p.rawMaterialCost - p.packagingCost },
    { name: 'Semi-Fin.',        value: -p.semiFinishedCost,       fill: '#f59e0b', base: p.netSalePrice - p.rawMaterialCost - p.packagingCost - p.semiFinishedCost },
    { name: 'Intermediates',    value: -p.intermediateCost,       fill: '#8b5cf6', base: p.netSalePrice - p.rawMaterialCost - p.packagingCost - p.semiFinishedCost - p.intermediateCost },
    { name: 'Wt. Expense',      value: -p.weightExpense,          fill: '#ec4899', base: p.netSalePrice - p.totalCost },
    { name: 'Insurance',        value: -p.insurance,              fill: '#64748b', base: p.netSalePrice - p.totalCost - p.insurance },
    { name: 'Net Profit',       value: p.profitAfterInsurance,    fill: p.profitAfterInsurance >= 0 ? '#10b981' : '#ef4444', base: 0 },
  ]

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={v => `$${v.toFixed(1)}`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={55} />
        <Tooltip
          formatter={(v: number, _: string, props: any) => [fmt(Math.abs(v)), props.payload.name]}
          contentStyle={{ fontSize: 11, borderRadius: 8 }}
        />
        <ReferenceLine y={0} stroke="#e2e8f0" />
        <Bar dataKey="value" radius={[3, 3, 0, 0]} maxBarSize={42}>
          {data.map((d, i) => <Cell key={i} fill={d.fill} fillOpacity={0.85} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
