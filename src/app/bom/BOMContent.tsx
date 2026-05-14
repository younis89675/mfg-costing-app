'use client'
import { useState } from 'react'
import { Search, Layers, Info } from 'lucide-react'
import { useAppStore } from '@/lib/store/appStore'
import { BOMTreeNode } from '@/components/bom/BOMTreeNode'
import { formatCurrency } from '@/lib/utils/format'
import type { ComputedProduct } from '@/types'
import clsx from 'clsx'

export function BOMContent() {
  const { computedProducts, settings } = useAppStore()
  const [selected, setSelected] = useState<ComputedProduct | null>(null)
  const [search, setSearch] = useState('')
  const fmt = (v: number) => formatCurrency(v, settings.currency, settings.usdToLydRate)

  const filtered = computedProducts.filter(p =>
    p.productName.toLowerCase().includes(search.toLowerCase()) ||
    p.finalProductCode.toLowerCase().includes(search.toLowerCase())
  )

  if (!computedProducts.length) return (
    <div className="flex items-center justify-center min-h-[50vh] text-slate-400 text-sm">
      No data. Upload files first.
    </div>
  )

  return (
    <div className="flex gap-5 h-[calc(100vh-7rem)]">
      {/* Product list */}
      <div className="w-72 shrink-0 flex flex-col card overflow-hidden">
        <div className="p-3 border-b border-slate-100 dark:border-slate-700">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="input pl-8 py-1.5 text-xs" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800">
          {filtered.map(p => (
            <button
              key={p.finalProductCode}
              onClick={() => setSelected(p)}
              className={clsx(
                'w-full flex items-start gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-left',
                selected?.finalProductCode === p.finalProductCode && 'bg-blue-50 dark:bg-blue-950/30'
              )}
            >
              <Layers className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{p.productName}</p>
                <p className="text-[10px] text-slate-500 font-mono">{p.finalProductCode}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {fmt(p.totalCost)} cost · <span className={p.profitabilityPct >= 10 ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-500'}>{p.profitabilityPct.toFixed(1)}%</span>
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* BOM tree */}
      <div className="flex-1 card overflow-hidden flex flex-col">
        {selected ? (
          <>
            <div className="card-header flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">{selected.productName}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selected.finalProductCode} · {selected.productCategory} ·
                  Total cost: <span className="font-semibold">{fmt(selected.totalCost)}</span>
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                {[
                  { l: 'RM Cost', v: selected.rawMaterialCost,  c: 'text-blue-600'    },
                  { l: 'PK Cost', v: selected.packagingCost,    c: 'text-purple-600'  },
                  { l: 'SFG',     v: selected.semiFinishedCost, c: 'text-emerald-600' },
                  { l: 'INT',     v: selected.intermediateCost, c: 'text-amber-600'   },
                ].map(({ l, v, c }) => v > 0 ? (
                  <div key={l} className={`px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400 font-medium`}>
                    {l}: <span className={c}>{fmt(v)}</span>
                  </div>
                ) : null)}
              </div>
            </div>

            {/* Tree header */}
            <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                <span className="w-4" />
                <span className="w-10">Type</span>
                <span className="flex-1">Code</span>
                <span className="flex-none max-w-[160px] w-[160px]">Name</span>
                <span className="w-14 text-right">Qty</span>
                <span className="w-20 text-right">Unit</span>
                <span className="w-20 text-right">Total</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {selected.bomTree
                ? <BOMTreeNode node={selected.bomTree} depth={0} />
                : <p className="text-xs text-slate-400 p-4">No BOM structure found for this product.</p>
              }
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Info className="w-8 h-8" />
            <p className="text-sm">Select a product to explore its BOM tree</p>
          </div>
        )}
      </div>
    </div>
  )
}
