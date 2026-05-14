import { AppShell } from '@/components/layout/AppShell'
import { TopNav } from '@/components/layout/TopNav'
import { DataContent } from './DataContent'

export default function DataPage() {
  return (
    <AppShell>
      <TopNav title="Data Tables" subtitle="AG Grid enterprise views with pivot, grouping & export" />
      <main className="flex-1 p-6">
        <DataContent />
      </main>
    </AppShell>
  )
}
