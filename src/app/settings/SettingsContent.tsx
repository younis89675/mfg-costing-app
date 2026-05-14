'use client'
import { useState } from 'react'
import { DollarSign, Moon, Sun, RefreshCw, Trash2, Save, Info } from 'lucide-react'
import { useAppStore, loadMockData } from '@/lib/store/appStore'

export function SettingsContent() {
  const { settings, setSettings, reset } = useAppStore()
  const [rate, setRate] = useState(String(settings.usdToLydRate))
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    const parsed = parseFloat(rate)
    if (!isNaN(parsed) && parsed > 0) {
      setSettings({ usdToLydRate: parsed })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Currency Settings */}
      <div className="card">
        <div className="card-header flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-blue-500" />
          <h2 className="text-sm font-semibold">Currency Settings</h2>
        </div>
        <div className="p-5 space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
              USD → Libyan Dinar (LYD) Exchange Rate
            </label>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500 whitespace-nowrap">1 USD =</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={rate}
                onChange={e => setRate(e.target.value)}
                className="input max-w-xs"
              />
              <span className="text-sm text-slate-500">LYD</span>
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              Current: <span className="font-mono font-semibold text-slate-600 dark:text-slate-300">{settings.usdToLydRate}</span> — updates all charts, tables and KPIs instantly.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
              Display Currency
            </label>
            <div className="flex gap-2">
              {(['USD', 'LYD'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setSettings({ currency: c })}
                  className={`px-6 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all ${
                    settings.currency === c
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            className={`btn-primary gap-2 ${saved ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
          >
            {saved ? <><RefreshCw className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Rate</>}
          </button>
        </div>
      </div>

      {/* Theme */}
      <div className="card">
        <div className="card-header flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-semibold">Appearance</h2>
        </div>
        <div className="p-5">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Theme</label>
          <div className="flex gap-2">
            {(['light', 'dark'] as const).map(t => (
              <button
                key={t}
                onClick={() => setSettings({ theme: t })}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium border-2 transition-all capitalize ${
                  settings.theme === t
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300'
                }`}
              >
                {t === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <div className="card-header flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-red-500" />
          <h2 className="text-sm font-semibold">Data Management</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-300">
              All data is processed entirely in your browser. No files are uploaded to any server.
              Settings are persisted in localStorage.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadMockData}
              className="btn-secondary gap-2 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Load Sample Data
            </button>
            <button
              onClick={() => { if (confirm('Clear all loaded data?')) reset() }}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All Data
            </button>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold mb-3">About ManufacturIQ</h2>
        <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
          <p><span className="font-medium text-slate-700 dark:text-slate-300">Version:</span> 1.0.0 Enterprise</p>
          <p><span className="font-medium text-slate-700 dark:text-slate-300">Stack:</span> Next.js 14, TypeScript, Tailwind CSS, Recharts, AG Grid, Zustand</p>
          <p><span className="font-medium text-slate-700 dark:text-slate-300">Engine:</span> Recursive BOM costing with circular-reference detection, memoized traversal</p>
          <p><span className="font-medium text-slate-700 dark:text-slate-300">Supports:</span> FG → SFG → INT → RM / PK multi-level explosion, weight-range expenses, USD↔LYD conversion</p>
        </div>
      </div>
    </div>
  )
}
