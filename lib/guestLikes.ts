const COOKIE_NAME = 'guest_likes'
const COOKIE_DAYS = 365

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : undefined
}

function setCookie(name: string, value: string, days: number) {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`
}

export function getGuestLikedIds(): string[] {
  const raw = getCookie(COOKIE_NAME)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function isGuestLiked(id: string): boolean {
  return getGuestLikedIds().includes(id)
}

export function toggleGuestLike(id: string): boolean {
  const ids = getGuestLikedIds()
  const idx = ids.indexOf(id)
  let liked: boolean
  if (idx >= 0) {
    ids.splice(idx, 1)
    liked = false
  } else {
    ids.push(id)
    liked = true
  }
  setCookie(COOKIE_NAME, JSON.stringify(ids), COOKIE_DAYS)
  return liked
}