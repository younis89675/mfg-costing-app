export function formatCurrency(
  value: number,
  currency: 'USD' | 'LYD',
  usdToLydRate: number,
): string {
  const converted = currency === 'LYD' ? value * usdToLydRate : value
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(converted)
  }
  return `LYD ${new Intl.NumberFormat('ar-LY', { maximumFractionDigits: 2 }).format(converted)}`
}

export function formatPct(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: decimals }).format(value)
}

export function getProfitabilityColor(pct: number): string {
  if (pct >= 20) return 'text-emerald-600 dark:text-emerald-400'
  if (pct >= 10) return 'text-yellow-600 dark:text-yellow-400'
  if (pct >= 0)  return 'text-orange-600 dark:text-orange-400'
  return 'text-red-600 dark:text-red-400'
}

export function getProfitabilityBg(pct: number): string {
  if (pct >= 20) return 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
  if (pct >= 10) return 'bg-yellow-50 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-800'
  if (pct >= 0)  return 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800'
  return 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800'
}
