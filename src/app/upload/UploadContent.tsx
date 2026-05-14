'use client'
import { useCallback } from 'react'
import { CheckCircle2, ArrowRight, Zap } from 'lucide-react'
import { useAppStore, loadMockData } from '@/lib/store/appStore'
import { UploadZone } from '@/components/upload/UploadZone'
import {
  parseProfitabilityFile, parseBOMFile, parsePriceFile, parseWeightExpenseFile
} from '@/lib/utils/parsers'
import Link from 'next/link'

export function UploadContent() {
  const { files, setFile } = useAppStore()
  const allLoaded = Object.values(files).every(Boolean)

  const ZONES = [
    {
      key: 'profitability' as const,
      label: 'Profitability File',
      description: 'Product category, codes, prices, discounts, net weights',
      columns: ['Product Category', 'Final Product Code', 'Product Name', 'Unit', 'Net Weight', 'Company Price', 'Discount %'],
      parse: parseProfitabilityFile,
      loaded: !!files.profitability,
      count: files.profitability?.length,
    },
    {
      key: 'bom' as const,
      label: 'BOM Structure File',
      description: 'Multi-level Bill of Materials with component relationships',
      columns: ['Internal Reference', 'Type Internal Reference', 'BOM Line', 'BOM Line Name', 'Type BOM Line', 'Quantity'],
      parse: parseBOMFile,
      loaded: !!files.bom,
      count: files.bom?.length,
    },
    {
      key: 'prices' as const,
      label: 'Price File',
      description: 'Item costs in USD — raw materials, packaging, semi-finished',
      columns: ['Item Code', 'Item Name', 'Item Type', 'Unit Cost USD'],
      parse: parsePriceFile,
      loaded: !!files.prices,
      count: files.prices?.length,
    },
    {
      key: 'weightExpenses' as const,
      label: 'Weight Expense File',
      description: 'Weight-based expense brackets applied to final products',
      columns: ['From Weight', 'To Weight', 'Expense USD'],
      parse: parseWeightExpenseFile,
      loaded: !!files.weightExpenses,
      count: files.weightExpenses?.length,
    },
  ]

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="card p-5 bg-gradient-to-r from-blue-600 to-blue-700 border-0 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold">Excel Data Import Center</h2>
            <p className="text-blue-100 text-sm mt-1">
              Upload 4 Excel files to power the recursive BOM costing engine.
              Files are processed client-side — no data leaves your browser.
            </p>
          </div>
          <button onClick={loadMockData} className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
            <Zap className="w-4 h-4" />
            Load Sample Data
          </button>
        </div>
        <div className="flex items-center gap-3 mt-4">
          {ZONES.map((z, i) => (
            <div key={z.key} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${z.loaded ? 'bg-emerald-400 text-white' : 'bg-white/20 text-white'}`}>
                {z.loaded ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className="text-xs text-blue-100">{z.label.split(' ')[0]}</span>
              {i < ZONES.length - 1 && <ArrowRight className="w-3 h-3 text-blue-300 ml-1" />}
            </div>
          ))}
        </div>
      </div>

      {/* Upload zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ZONES.map(zone => (
          <div key={zone.key} className="space-y-2">
            <UploadZone
              label={zone.label}
              description={zone.description}
              loaded={zone.loaded}
              rowCount={zone.count}
              onFile={async file => {
                const data = await zone.parse(file)
                setFile(zone.key, data as any)
              }}
              onClear={() => setFile(zone.key, null)}
            />
            {/* Column hints */}
            <div className="flex flex-wrap gap-1 px-1">
              {zone.columns.map(col => (
                <span key={col} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] rounded font-mono">
                  {col}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {allLoaded && (
        <div className="card p-5 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="font-semibold text-emerald-800 dark:text-emerald-300">All files loaded successfully!</p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">BOM costing engine has been computed.</p>
              </div>
            </div>
            <Link href="/dashboard" className="btn-primary bg-emerald-600 hover:bg-emerald-700">
              View Dashboard →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
