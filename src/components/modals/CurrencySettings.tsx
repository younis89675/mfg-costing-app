'use client'
import { useState } from 'react'
import { Settings, X, DollarSign, RefreshCw } from 'lucide-react'
import { useAppStore } from '@/lib/store/appStore'

export function CurrencySettings() {
  const [open, setOpen] = useState(false)
  const { settings, setSettings } = useAppStore()
  const [rate, setRate] = useState(String(settings.usdToLydRate))

  const apply = () => {
    const parsed = parseFloat(rate)
    if (!isNaN(parsed) && parsed > 0) {
      setSettings({ usdToLydRate: parsed })
      setOpen(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
      >
        <Settings className="w-4 h-4" />
        Exchange Rate
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="fixed bottom-20 right-6 z-50 w-80 card p-5 shadow-2xl animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-semibold text-sm">Exchange Rate Settings</span>
              </div>
              <button onClick={() => setOpen(false)} className="btn-ghost p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  USD → Libyan Dinar (LYD) Rate
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">1 USD =</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={rate}
                    onChange={e => setRate(e.target.value)}
                    className="input flex-1"
                    placeholder="4.85"
                  />
                  <span className="text-sm text-slate-500">LYD</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Display Currency
                </label>
                <div className="flex gap-2">
                  {(['USD', 'LYD'] as const).map(c => (
                    <button
                      key={c}
                      onClick={() => setSettings({ currency: c })}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        settings.currency === c
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-300'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={apply} className="btn-primary w-full justify-center">
                <RefreshCw className="w-4 h-4" />
                Apply & Recalculate
              </button>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Current rate: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                  1 USD = {settings.usdToLydRate} LYD
                </span>
              </p>
            </div>
          </div>
        </>
      )}
    </>
  )
}
