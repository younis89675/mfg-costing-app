'use client'
import { useEffect } from 'react'
import { useAppStore } from '@/lib/store/appStore'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppStore(s => s.settings.theme)

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [theme])

  return <>{children}</>
}
