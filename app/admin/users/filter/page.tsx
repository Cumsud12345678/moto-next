import { redirect } from 'next/navigation'

// Köhnə link: /admin/users/filter?email=...&userId=...
// Filtrlər artıq əsas səhifədədir, ora yönləndiririk.
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const pick = (key: string) => (Array.isArray(params[key]) ? params[key]?.[0] : params[key]) ?? ''
  const q = pick('email') || pick('userId') || pick('name') || pick('ip')
  redirect(q ? `/admin/users?q=${encodeURIComponent(q)}` : '/admin/users')
}
