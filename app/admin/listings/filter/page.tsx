import { redirect } from 'next/navigation'

// Köhnə link: /admin/listings/filter?listingId=...&phone=...
// Filtrlər artıq əsas səhifədədir, ora yönləndiririk.
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const pick = (key: string) => (Array.isArray(params[key]) ? params[key]?.[0] : params[key]) ?? ''
  const q = pick('listingId') || pick('phone')
  redirect(q ? `/admin/listings?q=${encodeURIComponent(q)}` : '/admin/listings')
}
