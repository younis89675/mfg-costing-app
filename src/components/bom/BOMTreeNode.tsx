'use client'
import { useState } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import type { BOMNode } from '@/types'
import { useAppStore } from '@/lib/store/appStore'
import { formatCurrency } from '@/lib/utils/format'
import clsx from 'clsx'

const TYPE_STYLES: Record<string, string> = {
  FG:  'badge-fg',
  SFG: 'badge-sfg',
  INT: 'badge-int',
  RM:  'badge-rm',
  PK:  'badge-pk',
}

const INDENT_COLORS = [
  'border-blue-300 dark:border-blue-700',
  'border-purple-300 dark:border-purple-700',
  'border-amber-300 dark:border-amber-700',
  'border-emerald-300 dark:border-emerald-700',
  'border-rose-300 dark:border-rose-700',
]

interface Props { node: BOMNode; depth?: number; parentQty?: number }

export function BOMTreeNode({ node, depth = 0, parentQty = 1 }: Props) {
  const [expanded, setExpanded] = useState(depth < 2)
  const { settings } = useAppStore()
  const hasChildren = node.children.length > 0
  const indent = depth * 24

  return (
    <div>
      <div
        className={clsx(
          'flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group text-sm',
          depth === 0 && 'bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/30'
        )}
        style={{ paddingLeft: indent + 12 }}
        onClick={() => hasChildren && setExpanded(e => !e)}
      >
        {/* Expand toggle */}
        <span className="w-4 shrink-0">
          {hasChildren
            ? expanded
              ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            : <span className="w-3.5 block" />
          }
        </span>

        {/* Type badge */}
        <span className={clsx('badge shrink-0', TYPE_STYLES[node.type] ?? 'badge-rm')}>
          {node.type}
        </span>

        {/* Name */}
        <span className="flex-1 truncate font-medium text-slate-800 dark:text-slate-200 text-xs">
          {node.code}
        </span>
        <span className="text-slate-500 dark:text-slate-400 text-xs truncate max-w-[180px]">
          {node.name}
        </span>

        {/* Qty */}
        <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400 tabular-nums w-14 text-right">
          ×{node.quantity.toFixed(3)}
        </span>

        {/* Unit cost */}
        <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400 tabular-nums w-20 text-right">
          {formatCurrency(node.unitCost, settings.currency, settings.usdToLydRate)}
        </span>

        {/* Total cost */}
        <span className={clsx(
          'shrink-0 text-xs tabular-nums font-semibold w-20 text-right',
          depth === 0 ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
        )}>
          {formatCurrency(node.totalCost, settings.currency, settings.usdToLydRate)}
        </span>
      </div>

      {expanded && hasChildren && (
        <div className={clsx('border-l ml-5 pl-1', INDENT_COLORS[depth % INDENT_COLORS.length])}>
          {node.children.map((child, i) => (
            <BOMTreeNode key={`${child.code}-${i}`} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}
