'use client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { Metadata } from '@/types/metadata'

// Hər dəyərin neçə elanda istifadə olunduğu: usage.make[id], usage.region[id] ...
export type Usage = Record<string, Record<string, number>>

export function useMetadataAdmin() {
  const queryClient = useQueryClient()

  const metadata = useQuery({
    queryKey: ['metadata'], // saytın useMetadata hook-u ilə eyni açar — dəyişiklik hər yerdə görünür
    queryFn: async () => (await api.get<{ data: Metadata }>('/api/metadata')).data.data,
  })

  const usage = useQuery({
    queryKey: ['admin', 'metadata-usage'],
    queryFn: async () => (await api.get<{ data: Usage }>('/api/metadata/usage')).data.data,
  })

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['metadata'] }),
      queryClient.invalidateQueries({ queryKey: ['admin', 'metadata-usage'] }),
    ])

  return { metadata, usage: usage.data ?? {}, refresh }
}
