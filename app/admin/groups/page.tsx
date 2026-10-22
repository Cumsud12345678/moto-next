'use client'
import { useState } from 'react'
import Image from 'next/image'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { toast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import ConfirmDialog from '../components/ConfirmDialog'
import { errorMessage, imageSrc } from '../_lib/utils'
import GroupDialog, { Group } from './group-dialog'

const QUERY_KEY = ['admin', 'groups']

export default function GroupsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => (await api.get<{ data: Group[] }>('/api/groups')).data.data,
  })

  const [dialog, setDialog] = useState<Group | 'new' | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Group | null>(null)

  const refresh = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY })

  const deleteGroup = async () => {
    if (!deleteTarget) return
    try {
      const { data } = await api.delete(`/api/groups/${deleteTarget._id}`)
      toast.add({ type: 'success', description: data.message })
      refresh()
    } catch (err) {
      toast.add({ type: 'error', description: errorMessage(err, 'Silinmədi') })
      throw err
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Qruplar"
        description={data ? `Cəmi: ${data.length}. Saytın "Qruplar" səhifəsində göstərilir.` : undefined}
        actions={<Button onClick={() => setDialog('new')}>+ Yeni qrup</Button>}
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : isError ? (
        <EmptyState title="Yüklənmədi" description="Səhifəni yeniləyin" />
      ) : !data?.length ? (
        <div className="rounded-xl border bg-white">
          <EmptyState title="Hələ qrup yoxdur" description='"Yeni qrup" düyməsi ilə əlavə edin' />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((g) => (
            <div key={g._id} className="flex items-center gap-3 rounded-xl border bg-white p-3">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-full border bg-gray-50">
                <Image src={imageSrc(g.logo)} alt="" fill unoptimized className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{g.title}</div>
                <a href={g.link} target="_blank" rel="noreferrer" className="block truncate text-xs text-sky-700 hover:underline">
                  {g.link}
                </a>
              </div>
              <div className="flex flex-col gap-1.5">
                <Button size="sm" variant="outline" onClick={() => setDialog(g)}>Redaktə</Button>
                <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(g)}>Sil</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <GroupDialog group={dialog} onOpenChange={(open) => !open && setDialog(null)} onSaved={refresh} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Qrup silinsin?"
        description={deleteTarget ? <><b>{deleteTarget.title}</b> qrupu saytdan silinəcək.</> : undefined}
        confirmLabel="Sil"
        destructive
        onConfirm={deleteGroup}
      />
    </div>
  )
}
