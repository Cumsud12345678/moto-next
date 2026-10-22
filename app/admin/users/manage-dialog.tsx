'use client'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { toast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RoleBadge, ROLE_OPTIONS, ToneBadge } from '../components/StatusBadge'
import { errorMessage, formatDateTime } from '../_lib/utils'
import { AdminUser, MAX_WARNINGS } from '../_lib/types'

// Hazır səbəblər — kliklə mətnə yazılır, sonra dəyişmək olar.
// Bu mətnlər istifadəçinin profilindəki bildirişlərdə görünür.
const WARNING_PRESETS = [
  'Elanın açıqlaması saytın qaydalarına uyğun deyil.',
  'Elanın parametrləri (marka, model, il və s.) səhv yazılıb.',
  'Elandakı şəkillər motosikletə aid deyil.',
]

const BLOCK_PRESETS = [
  'Hesabınızda dolandırıcılıq fəaliyyəti aşkar edildi.',
  'Saytın qaydalarına zidd məzmun paylaşdığınız üçün hesabınız bloklandı.',
  'Spam elanlar paylaşdığınız üçün hesabınız bloklandı.',
]

interface ManageUserDialogProps {
  user: AdminUser | null
  onOpenChange: (open: boolean) => void
}

function Section({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border p-3">
      <h4 className="mb-2 font-medium">{title}</h4>
      {children}
    </section>
  )
}

function Presets({ items, onPick }: { items: string[]; onPick: (text: string) => void }) {
  return (
    <div className="mb-2 flex flex-wrap gap-1.5">
      {items.map((text) => (
        <button
          key={text}
          type="button"
          onClick={() => onPick(text)}
          className="rounded-full border bg-gray-50 px-2.5 py-1 text-left text-xs hover:bg-gray-100"
        >
          {text}
        </button>
      ))}
    </div>
  )
}

export default function ManageUserDialog({ user: initialUser, onOpenChange }: ManageUserDialogProps) {
  const queryClient = useQueryClient()

  // Əməliyyatdan sonra pəncərədəki məlumat da yenilənsin deyə lokal surət
  const [user, setUser] = useState<AdminUser | null>(initialUser)
  const [role, setRole] = useState(initialUser?.role ?? 'user')
  const [warnText, setWarnText] = useState('')
  const [blockText, setBlockText] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  // Başqa istifadəçi seçiləndə formu sıfırla
  const [lastId, setLastId] = useState(initialUser?._id)
  if (initialUser?._id !== lastId) {
    setLastId(initialUser?._id)
    setUser(initialUser)
    setRole(initialUser?.role ?? 'user')
    setWarnText('')
    setBlockText('')
  }

  if (!user) return null

  const run = async (key: string, request: () => Promise<{ data: { message: string; data?: Partial<AdminUser> } }>) => {
    setBusy(key)
    try {
      const { data } = await request()
      toast.add({ type: 'success', description: data.message })
      if (data.data) setUser((u) => (u ? { ...u, ...data.data } : u))
      queryClient.invalidateQueries({ queryKey: ['admin', '/api/admin/users'] })
      return true
    } catch (err) {
      toast.add({ type: 'error', description: errorMessage(err) })
      return false
    } finally {
      setBusy(null)
    }
  }

  const saveRole = () => run('role', () => api.put(`/api/admin/users/edit/role/${user._id}`, { role }))

  const warn = async () => {
    if (!warnText.trim()) return toast.add({ type: 'warning', description: 'Səbəbi yazın və ya seçin' })
    if (await run('warn', () => api.put(`/api/admin/users/warn/${user._id}`, { message: warnText.trim() }))) setWarnText('')
  }

  const resetWarnings = () => run('reset', () => api.put(`/api/admin/users/warn/reset/${user._id}`))

  const block = async () => {
    if (!blockText.trim()) return toast.add({ type: 'warning', description: 'Səbəbi yazın və ya seçin' })
    if (await run('block', () => api.put(`/api/admin/users/block/${user._id}`, { message: blockText.trim() }))) setBlockText('')
  }

  const unblock = () => run('unblock', () => api.put(`/api/admin/users/unblock/${user._id}`))

  const textareaClass = 'w-full rounded-lg border bg-white p-2 text-sm focus:outline-sky-500'

  return (
    <Dialog open={!!initialUser} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="pr-6">{user.name || 'Adsız istifadəçi'}</DialogTitle>
          <DialogDescription className="break-all">{user.email}</DialogDescription>
          <div className="flex flex-wrap gap-1.5">
            <RoleBadge role={user.role} />
            {user.isLocked ? <ToneBadge tone="red">Bloklanıb</ToneBadge> : <ToneBadge tone="green">Aktiv</ToneBadge>}
            {user.isWarning > 0 && <ToneBadge tone="orange">{user.isWarning}/{MAX_WARNINGS} xəbərdarlıq</ToneBadge>}
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Section title="Rol">
            <div className="flex gap-2">
              <select
                aria-label="Rol"
                value={role}
                onChange={(e) => setRole(e.target.value as AdminUser['role'])}
                className="h-9 flex-1 rounded-lg border bg-white px-2 text-sm"
              >
                {ROLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <Button onClick={saveRole} disabled={role === user.role || busy !== null}>
                {busy === 'role' ? 'Gözləyin...' : 'Yadda saxla'}
              </Button>
            </div>
          </Section>

          <Section title={`Xəbərdarlıq (${user.isWarning}/${MAX_WARNINGS})`}>
            <p className="mb-2 text-xs text-muted-foreground">
              Mətn istifadəçinin profilində bildiriş kimi görünür. {MAX_WARNINGS}-ci xəbərdarlıqda hesab avtomatik bloklanır.
            </p>
            <Presets items={WARNING_PRESETS} onPick={setWarnText} />
            <textarea
              value={warnText}
              onChange={(e) => setWarnText(e.target.value)}
              placeholder="Xəbərdarlıq mətni"
              rows={2}
              maxLength={300}
              className={textareaClass}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-50"
                onClick={warn}
                disabled={busy !== null || user.isWarning >= MAX_WARNINGS || user.isLocked}
              >
                {busy === 'warn' ? 'Gözləyin...' : 'Xəbərdarlıq et'}
              </Button>
              {user.isWarning > 0 && (
                <Button variant="ghost" onClick={resetWarnings} disabled={busy !== null}>
                  {busy === 'reset' ? 'Gözləyin...' : 'Sıfırla'}
                </Button>
              )}
            </div>
          </Section>

          <Section title="Bloklama">
            {user.isLocked ? (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm">
                  {formatDateTime(user.lockedAt)} tarixindən bloklanıb. Elanları gizlədilib.
                </p>
                <Button onClick={unblock} disabled={busy !== null}>
                  {busy === 'unblock' ? 'Gözləyin...' : 'Blokdan çıxar'}
                </Button>
              </div>
            ) : (
              <>
                <p className="mb-2 text-xs text-muted-foreground">
                  Bloklananda istifadəçi daxil ola bilmir, aktiv elanları gizlədilir.
                </p>
                <Presets items={BLOCK_PRESETS} onPick={setBlockText} />
                <textarea
                  value={blockText}
                  onChange={(e) => setBlockText(e.target.value)}
                  placeholder="Bloklama səbəbi"
                  rows={2}
                  maxLength={300}
                  className={textareaClass}
                />
                <Button variant="destructive" className="mt-2" onClick={block} disabled={busy !== null}>
                  {busy === 'block' ? 'Gözləyin...' : 'Blokla'}
                </Button>
              </>
            )}
          </Section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
