import { AppShell } from '@/components/layout/AppShell'
import { TopNav } from '@/components/layout/TopNav'
import { DashboardContent } from './DashboardContent'

export default function DashboardPage() {
  return (
    <AppShell>
      <TopNav title="Dashboard" subtitle="Manufacturing Profitability Overview" />
      <main className="flex-1 p-6">
        <DashboardContent />
      </main>
    </AppShell>
  )
}
