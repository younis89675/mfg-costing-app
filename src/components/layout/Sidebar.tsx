'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Upload, Grid3X3, TrendingUp, Settings, Factory, Database, ChevronRight, Layers } from 'lucide-react'
import { useAppStore } from '@/lib/store/appStore'
import clsx from 'clsx'

const NAV = [
  { href: '/dashboard',  label: 'Dashboard',    icon: BarChart3,   desc: 'KPIs & Overview'     },
  { href: '/upload',     label: 'Data Upload',  icon: Upload,      desc: 'Import Excel files'   },
  { href: '/analysis',   label: 'Profitability',icon: TrendingUp,  desc: 'Product analysis'     },
  { href: '/bom',        label: 'BOM Explorer', icon: Layers,      desc: 'Cost tree drill-down' },
  { href: '/data',       label: 'Data Tables',  icon: Grid3X3,     desc: 'AG Grid views'        },
  { href: '/settings',   label: 'Settings',     icon: Settings,    desc: 'Currency & preferences'},
]

export function Sidebar() {
  const pathname = usePathname()
  const { files, computedProducts } = useAppStore()
  const allLoaded = Object.values(files).every(Boolean)

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex flex-col w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
          <Factory className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">Future Cost</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-0.5">Costing & Profitability</p>
        </div>
      </div>

      {/* Status */}
      <div className="px-3 pt-3 pb-1">
        <div className={clsx(
          'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium',
          allLoaded
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
        )}>
          <div className={clsx('w-1.5 h-1.5 rounded-full', allLoaded ? 'bg-emerald-500' : 'bg-amber-500')} />
          {allLoaded ? `${computedProducts.length} products loaded` : 'Upload files to begin'}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={clsx('sidebar-item', pathname.startsWith(href) && href !== '/' && 'active')}>
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
            {pathname.startsWith(href) && href !== '/' && (
              <ChevronRight className="w-3 h-3 ml-auto opacity-60" />
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">v1.0.0 — Enterprise Edition</span>
        </div>
      </div>
    </aside>
  )
}
