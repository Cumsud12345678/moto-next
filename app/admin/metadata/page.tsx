'use client'
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PageHeader from '../components/PageHeader'
import ConfirmDialog from '../components/ConfirmDialog'
import { useMetadataAdmin } from './use-metadata-admin'
import MakesTab from './makes-tab'
import BasicTab from './basic-tab'

interface PendingConfirm {
  title: string
  description: React.ReactNode
  action: () => Promise<void>
}

export default function MetadataPage() {
  const { metadata, usage, refresh } = useMetadataAdmin()
  const [confirm, setConfirm] = useState<PendingConfirm | null>(null)

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Marka, model və parametrlər"
        description="Elan əlavə edərkən seçilən bütün siyahılar. Elanlarda istifadə olunan dəyəri silmək olmaz, amma adını dəyişmək olar."
      />

      <Tabs defaultValue="makes">
        <TabsList>
          <TabsTrigger value="makes">Marka və modellər</TabsTrigger>
          <TabsTrigger value="basic">Digər parametrlər</TabsTrigger>
        </TabsList>
        <TabsContent value="makes" className="pt-3">
          <MakesTab
            metadata={metadata.data}
            loading={metadata.isLoading}
            usage={usage}
            onChanged={refresh}
            onConfirm={setConfirm}
          />
        </TabsContent>
        <TabsContent value="basic" className="pt-3">
          <BasicTab
            metadata={metadata.data}
            loading={metadata.isLoading}
            usage={usage}
            onChanged={refresh}
            onConfirm={setConfirm}
          />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm?.title ?? ''}
        description={confirm?.description}
        confirmLabel="Sil"
        destructive
        onConfirm={async () => {
          await confirm?.action()
        }}
      />
    </div>
  )
}
