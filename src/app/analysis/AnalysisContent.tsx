'use client'
import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, ChevronDown, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useAppStore } from '@/lib/store/appStore'
import { formatCurrency, formatPct } from '@/lib/utils/format'
import { WaterfallChart } from '@/components/charts/WaterfallChart'
import { BOMTreeNode } from '@/components/bom/BOMTreeNode'
import type { ComputedProduct } from '@/types'
import { CurrencySettings } from '@/components/modals/CurrencySettings'
import clsx from 'clsx'

function ProfitBadge({ pct }: { pct: number }) {
  const cls = pct >= 20 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
    : pct >= 10 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
    : pct >= 0  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
    : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
  const Icon = pct >= 10 ? TrendingUp : pct >= 0 ? Minus : TrendingDown
  return (
    <span className={`badge text-xs font-bold ${cls}`}>
      <Icon className="w-3 h-3" />
      {formatPct(pct)}
    </span>
  )
}

function ProductRow({ p, selected, onClick }: { p: ComputedProduct; selected: boolean; onClick: () => void }) {
  const { settings } = useAppStore()
  const fmt = (v: number) => formatCurrency(v, settings.currency, settings.usdToLydRate)

  return (
    <tr
      className={clsx(
        'border-b border-slate-100 dark:border-slate-800 cursor-pointer transition-colors text-xs',
        selected
          ? 'bg-blue-50 dark:bg-blue-950/30'
          : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
      )}
      onClick={onClick}
    >
      <td className="px-4 py-3 font-mono text-slate-500 dark:text-slate-400">{p.finalProductCode}</td>
      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white max-w-[200px]">
        <div className="truncate">{p.productName}</div>
        <div className="text-[10px] text-slate-400">{p.productCategory}</div>
      </td>
      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 tabular-nums">{fmt(p.netSalePrice)}</td>
      <td className="px-4 py-3 text-slate-500 tabular-nums">{fmt(p.rawMaterialCost)}</td>
      <td className="px-4 py-3 text-slate-500 tabular-nums">{fmt(p.packagingCost)}</td>
      <td className="px-4 py-3 text-slate-500 tabular-nums">{fmt(p.semiFinishedCost)}</td>
      <td className="px-4 py-3 text-slate-500 tabular-nums">{fmt(p.intermediateCost)}</td>
      <td className="px-4 py-3 text-slate-500 tabular-nums">{fmt(p.weightExpense)}</td>
      <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200 tabular-nums">{fmt(p.totalCost)}</td>
      <td className="px-4 py-3 tabular-nums">{fmt(p.insurance)}</td>
      <td className={`px-4 py-3 font-bold tabular-nums ${p.profitAfterInsurance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
        {fmt(p.profitAfterInsurance)}
      </td>
      <td className="px-4 py-3"><ProfitBadge pct={p.profitabilityPct} /></td>
    </tr>
  )
}

export function AnalysisContent() {
  const { computedProducts, settings } = useAppStore()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [selected, setSelected] = useState<ComputedProduct | null>(null)
  const fmt = (v: number) => formatCurrency(v, settings.currency, settings.usdToLydRate)

  const categories = useMemo(() => ['All', ...Array.from(new Set(computedProducts.map(p => p.productCategory)))], [computedProducts])

  const filtered = useMemo(() => computedProducts
    .filter(p =>
      (category === 'All' || p.productCategory === category) &&
      (p.productName.toLowerCase().includes(search.toLowerCase()) ||
       p.finalProductCode.toLowerCase().includes(search.toLowerCase()))
    ), [computedProducts, search, category])

  if (!computedProducts.length) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-500 text-sm">
        No computed products. Upload data files first.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" className="input pl-9 py-2 text-xs" />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
              category === c
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-300'
            )}>
              {c}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400 ml-auto">{filtered.length} products</span>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                {['Code','Product','Net Sale','Raw Mat.','Packaging','Semi-Fin.','Intermediate','Wt. Expense','Total Cost','Insurance','Net Profit','Margin %'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <ProductRow
                  key={p.finalProductCode}
                  p={p}
                  selected={selected?.finalProductCode === p.finalProductCode}
                  onClick={() => setSelected(s => s?.finalProductCode === p.finalProductCode ? null : p)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drill-down panel */}
      {selected && (
        <div className="card overflow-hidden animate-fade-up">
          <div className="card-header flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {selected.finalProductCode} — {selected.productName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Full cost breakdown & BOM tree</p>
            </div>
            <ProfitBadge pct={selected.profitabilityPct} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-700">
            {/* Cost summary */}
            <div className="p-5 space-y-3">
              <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Profit & Loss Summary</h4>
              {[
                { label: 'Net Sale Price',          value: selected.netSalePrice,          color: 'text-blue-600 dark:text-blue-400' },
                { label: '− Raw Material Cost',     value: selected.rawMaterialCost,       color: 'text-slate-600' },
                { label: '− Packaging Cost',        value: selected.packagingCost,         color: 'text-slate-600' },
                { label: '− Semi-Finished Cost',    value: selected.semiFinishedCost,      color: 'text-slate-600' },
                { label: '− Intermediate Cost',     value: selected.intermediateCost,      color: 'text-slate-600' },
                { label: '− Weight Expense',        value: selected.weightExpense,         color: 'text-slate-600' },
                { label: '= Total Cost',            value: selected.totalCost,             color: 'text-slate-800 dark:text-slate-200 font-bold' },
                { label: '= Profit Before Ins.',    value: selected.profitBeforeInsurance, color: 'text-amber-600 dark:text-amber-400' },
                { label: '− Insurance (10%)',       value: selected.insurance,             color: 'text-slate-500' },
                { label: '= Net Profit',            value: selected.profitAfterInsurance,  color: selected.profitAfterInsurance >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-red-600 dark:text-red-400 font-bold' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                  <span className="text-xs text-slate-500">{label}</span>
                  <span className={`text-xs tabular-nums ${color}`}>{fmt(value)}</span>
                </div>
              ))}
            </div>

            {/* Waterfall chart */}
            <div className="p-5">
              <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">Waterfall Analysis</h4>
              <WaterfallChart product={selected} />
            </div>
          </div>

          {/* BOM tree */}
          {selected.bomTree && (
            <div className="border-t border-slate-100 dark:border-slate-700">
              <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20">
                <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">BOM Explosion Tree</h4>
                <div className="flex items-center gap-4 text-[10px] text-slate-500">
                  {['FG','SFG','INT','RM','PK'].map(t => (
                    <span key={t} className={`badge badge-${t.toLowerCase()}`}>{t}</span>
                  ))}
                  <span>click to expand/collapse</span>
                </div>
              </div>
              <div className="p-2">
                {/* Column headers */}
                <div className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-medium text-slate-400 uppercase tracking-wide border-b border-slate-100 dark:border-slate-700 mb-1">
                  <span className="w-4" />
                  <span className="w-10">Type</span>
                  <span className="flex-1">Code</span>
                  <span className="max-w-[180px] flex-shrink-0">Name</span>
                  <span className="w-14 text-right">Qty</span>
                  <span className="w-20 text-right">Unit Cost</span>
                  <span className="w-20 text-right">Total</span>
                </div>
                <BOMTreeNode node={selected.bomTree} depth={0} />
              </div>
            </div>
          )}
        </div>
      )}

      <CurrencySettings />
    </div>
  )
}
