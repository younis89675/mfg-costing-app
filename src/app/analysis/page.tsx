import { AppShell } from '@/components/layout/AppShell'
import { TopNav } from '@/components/layout/TopNav'
import { AnalysisContent } from './AnalysisContent'

export default function AnalysisPage() {
  return (
    <AppShell>
      <TopNav title="Profitability Analysis" subtitle="Full product costing & margin analysis" />
      <main className="flex-1 p-6">
        <AnalysisContent />
      </main>
    </AppShell>
  )
}
