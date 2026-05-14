'use client'
import { useMemo } from 'react'
import Link from 'next/link'
import {
  TrendingUp, TrendingDown, DollarSign, Package,
  ShoppingCart, BarChart2, AlertTriangle, Upload, Zap
} from 'lucide-react'
import { useAppStore, loadMockData } from '@/lib/store/appStore'
import { aggregateKPIs, aggregateByCategory } from '@/lib/costing/engine'
import { formatCurrency, formatPct } from '@/lib/utils/format'
import { KPICard, KPICardSkeleton } from '@/components/dashboard/KPICard'
import { ProfitabilityBarChart } from '@/components/charts/ProfitabilityBarChart'
import { CostBreakdownChart } from '@/components/charts/CostBreakdownChart'
import { CategoryChart } from '@/components/charts/CategoryChart'
import { CurrencySettings } from '@/components/modals/CurrencySettings'

export function DashboardContent() {
  const { computedProducts, settings, isComputing, files } = useAppStore()
  const hasData = computedProducts.length > 0

  const kpis = useMemo(() => hasData ? aggregateKPIs(computedProducts) : null, [computedProducts])
  const categories = useMemo(() => hasData ? aggregateByCategory(computedProducts) : [], [computedProducts])
  const fmt = (v: number) => formatCurrency(v, settings.currency, settings.usdToLydRate)
  const avgProfitability = kpis && kpis.totalRevenue > 0
    ? (kpis.netProfit / kpis.totalRevenue) * 100
    : 0

  const allLoaded = Object.values(files).every(Boolean)

  if (!allLoaded && !hasData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-950/40">
          <BarChart2 className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No data loaded yet</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Upload your Excel files or load sample data to start analyzing product profitability.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadMockData} className="btn-primary gap-2">
            <Zap className="w-4 h-4" />
            Load Sample Data
          </button>
          <Link href="/upload" className="btn-secondary gap-2">
            <Upload className="w-4 h-4" />
            Upload Files
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {isComputing ? (
          Array.from({ length: 6 }).map((_, i) => <KPICardSkeleton key={i} />)
        ) : kpis ? (
          <>
            <KPICard title="Total Revenue"   value={fmt(kpis.totalRevenue)} icon={DollarSign}  iconColor="text-blue-600 dark:text-blue-400"    subtitle={`${kpis.productCount} products`} />
            <KPICard title="Total Cost"      value={fmt(kpis.totalCost)}    icon={ShoppingCart} iconColor="text-orange-600 dark:text-orange-400"  subtitle="All materials + overhead" />
            <KPICard title="Gross Profit"    value={fmt(kpis.grossProfit)}  icon={TrendingUp}   iconColor="text-emerald-600 dark:text-emerald-400" />
            <KPICard title="Net Profit"      value={fmt(kpis.netProfit)}    icon={TrendingUp}   iconColor="text-emerald-600 dark:text-emerald-400" subtitle="After insurance 10%" />
            <KPICard title="Avg. Margin"     value={formatPct(avgProfitability)} icon={BarChart2} iconColor={avgProfitability >= 15 ? "text-emerald-600" : "text-amber-600"} />
            <KPICard title="Products"        value={String(kpis.productCount)} icon={Package} iconColor="text-purple-600 dark:text-purple-400" subtitle="Active SKUs analyzed" />
          </>
        ) : null}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Top 10 Products by Profitability</h2>
              <p className="text-xs text-slate-500 mt-0.5">Net margin after insurance (%)</p>
            </div>
          </div>
          <div className="p-4">
            {hasData ? <ProfitabilityBarChart products={computedProducts} top={10} mode="top" /> : <EmptyState />}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Bottom 10 Products</h2>
            <p className="text-xs text-slate-500 mt-0.5">Lowest performing products</p>
          </div>
          <div className="p-4">
            {hasData ? <ProfitabilityBarChart products={computedProducts} top={10} mode="bottom" /> : <EmptyState />}
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold">Cost Breakdown</h2>
            <p className="text-xs text-slate-500 mt-0.5">Material cost composition</p>
          </div>
          <div className="p-4">
            {hasData ? <CostBreakdownChart products={computedProducts} /> : <EmptyState />}
          </div>
        </div>

        <div className="card col-span-1 lg:col-span-2">
          <div className="card-header">
            <h2 className="text-sm font-semibold">Profitability by Category</h2>
            <p className="text-xs text-slate-500 mt-0.5">Average margin % per product category</p>
          </div>
          <div className="p-4">
            {hasData ? <CategoryChart data={categories} /> : <EmptyState />}
          </div>
        </div>
      </div>

      {/* Alert table: low profitability */}
      {hasData && (() => {
        const low = computedProducts.filter(p => p.profitabilityPct < 5).slice(0, 5)
        return low.length > 0 ? (
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                Low-Profitability Alert ({low.length} products below 5%)
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700">
                    {['Code','Product','Category','Net Sale','Total Cost','Net Profit','Margin %'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left font-medium text-slate-500 dark:text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {low.map(p => (
                    <tr key={p.finalProductCode} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-2.5 font-mono font-medium text-slate-600 dark:text-slate-400">{p.finalProductCode}</td>
                      <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-white">{p.productName}</td>
                      <td className="px-4 py-2.5 text-slate-500">{p.productCategory}</td>
                      <td className="px-4 py-2.5 font-mono">{fmt(p.netSalePrice)}</td>
                      <td className="px-4 py-2.5 font-mono">{fmt(p.totalCost)}</td>
                      <td className={`px-4 py-2.5 font-mono font-semibold ${p.profitAfterInsurance < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {fmt(p.profitAfterInsurance)}
                      </td>
                      <td className={`px-4 py-2.5 font-mono font-bold ${p.profitabilityPct < 0 ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`}>
                        {formatPct(p.profitabilityPct)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null
      })()}

      <CurrencySettings />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-40 text-slate-400 dark:text-slate-600 text-sm">
      No data available
    </div>
  )
}
