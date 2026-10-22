import { Badge } from '@/components/ui/badge'
import { cn } from 'cn'

type Tone = 'green' | 'yellow' | 'red' | 'gray' | 'blue' | 'orange'

const TONE_CLASS: Record<Tone, string> = {
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
  gray: 'bg-gray-100 text-gray-700',
  blue: 'bg-blue-100 text-blue-800',
  orange: 'bg-orange-100 text-orange-800',
}

const LISTING_STATUS: Record<string, { label: string; tone: Tone }> = {
  pending: { label: 'Gözləmədə', tone: 'yellow' },
  active: { label: 'Aktiv', tone: 'green' },
  sold: { label: 'Satılıb', tone: 'blue' },
  expired: { label: 'Vaxtı bitib', tone: 'gray' },
  rejected: { label: 'Rədd edilib', tone: 'red' },
  blocked: { label: 'Bloklanıb', tone: 'red' },
}

const USER_ROLE: Record<string, { label: string; tone: Tone }> = {
  user: { label: 'İstifadəçi', tone: 'gray' },
  seller: { label: 'Satıcı', tone: 'blue' },
  service: { label: 'Servis', tone: 'orange' },
  admin: { label: 'Admin', tone: 'red' },
  system: { label: 'Sistem', tone: 'gray' },
}

export function ToneBadge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return <Badge className={cn('border-0 font-medium', TONE_CLASS[tone])}>{children}</Badge>
}

export function ListingStatusBadge({ status }: { status?: string | null }) {
  const s = LISTING_STATUS[status ?? ''] ?? { label: status || '—', tone: 'gray' as Tone }
  return <ToneBadge tone={s.tone}>{s.label}</ToneBadge>
}

export function RoleBadge({ role }: { role?: string | null }) {
  const r = USER_ROLE[role ?? ''] ?? { label: role || '—', tone: 'gray' as Tone }
  return <ToneBadge tone={r.tone}>{r.label}</ToneBadge>
}

export function BoolBadge({ value, yes = 'Bəli', no = 'Xeyr' }: { value?: boolean | null; yes?: string; no?: string }) {
  return value ? <ToneBadge tone="green">{yes}</ToneBadge> : <ToneBadge tone="gray">{no}</ToneBadge>
}

export const LISTING_STATUS_OPTIONS = Object.entries(LISTING_STATUS).map(([value, v]) => ({ value, label: v.label }))
