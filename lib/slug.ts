// Elan URL-i üçün təmiz slug: kiçik hərf, boşluqsuz, yalnız a-z 0-9 və "-".
// "Yamaha-FZ-S Fi Hybrid" -> "yamaha-fz-s-fi-hybrid"
const AZ_MAP: Record<string, string> = {
  ə: 'e', ı: 'i', ö: 'o', ü: 'u', ğ: 'g', ş: 's', ç: 'c',
  Ə: 'e', I: 'i', İ: 'i', Ö: 'o', Ü: 'u', Ğ: 'g', Ş: 's', Ç: 'c',
}

export function slugify(text: string | undefined | null): string {
  return String(text ?? '')
    .replace(/[əıöüğşçƏIİÖÜĞŞÇ]/g, (ch) => AZ_MAP[ch] ?? ch)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function listingSlug(make: string | undefined, model: string | undefined, id: string): string {
  const prefix = [slugify(make), slugify(model)].filter(Boolean).join('-')
  return prefix ? `${prefix}-${id}` : id
}

export function listingPath(make: string | undefined, model: string | undefined, id: string): string {
  return `/elanlar/${listingSlug(make, model, id)}`
}

export function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

// Slug-ın sonundakı Mongo id (24 hex simvol)
export function idFromSlug(slug: string): string | null {
  const last = safeDecode(slug).split('-').pop() ?? ''
  return /^[a-f0-9]{24}$/i.test(last) ? last : null
}