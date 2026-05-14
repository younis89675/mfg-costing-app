'use client'
import { Moon, Sun, DollarSign, RefreshCw, Search } from 'lucide-react'
import { useAppStore } from '@/lib/store/appStore'
import { formatCurrency } from '@/lib/utils/format'
import { useState } from 'react'

interface TopNavProps { title: string; subtitle?: string }

export function TopNav({ title, subtitle }: TopNavProps) {
  const { settings, setSettings, compute, isComputing } = useAppStore()
  const [search, setSearch] = useState('')

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 h-14 px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-500 w-52">
          <Search className="w-3.5 h-3.5 shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products…"
            className="bg-transparent outline-none flex-1 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 text-xs"
          />
        </div>

        {/* Currency toggle */}
        <button
          onClick={() => setSettings({ currency: settings.currency === 'USD' ? 'LYD' : 'USD' })}
          className="btn-ghost text-xs gap-1.5"
          title="Toggle currency"
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span className="font-mono font-semibold">{settings.currency}</span>
        </button>

        {/* Recalculate */}
        <button onClick={compute} disabled={isComputing} className="btn-secondary text-xs" title="Recalculate">
          <RefreshCw className={`w-3.5 h-3.5 ${isComputing ? 'animate-spin' : ''}`} />
        </button>

        {/* Theme */}
        <button
          onClick={() => setSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' })}
          className="btn-ghost"
          title="Toggle theme"
        >
          {settings.theme === 'light'
            ? <Moon className="w-4 h-4" />
            : <Sun className="w-4 h-4" />
          }
        </button>

        {/* Exchange rate badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 rounded-lg">
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-medium">
            1 USD = {settings.usdToLydRate} LYD
          </span>
        </div>
      </div>
    </header>
  )
}
