import { AppShell } from '@/components/layout/AppShell'
import { TopNav } from '@/components/layout/TopNav'
import { UploadContent } from './UploadContent'

export default function UploadPage() {
  return (
    <AppShell>
      <TopNav title="Data Upload" subtitle="Import your 4 Excel data files" />
      <main className="flex-1 p-6">
        <UploadContent />
      </main>
    </AppShell>
  )
}
