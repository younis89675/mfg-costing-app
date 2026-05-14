import { AppShell } from '@/components/layout/AppShell'
import { TopNav } from '@/components/layout/TopNav'
import { BOMContent } from './BOMContent'

export default function BOMPage() {
  return (
    <AppShell>
      <TopNav title="BOM Explorer" subtitle="Recursive Bill of Materials cost tree drill-down" />
      <main className="flex-1 p-6">
        <BOMContent />
      </main>
    </AppShell>
  )
}
