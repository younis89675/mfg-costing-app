import { AppShell } from '@/components/layout/AppShell'
import { TopNav } from '@/components/layout/TopNav'
import { SettingsContent } from './SettingsContent'

export default function SettingsPage() {
  return (
    <AppShell>
      <TopNav title="Settings" subtitle="Currency, theme & application preferences" />
      <main className="flex-1 p-6">
        <SettingsContent />
      </main>
    </AppShell>
  )
}
