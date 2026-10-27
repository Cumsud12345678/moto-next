import type { Metadata } from '@/types/metadata'

// Backend cavab verməyəndə istifadə olunan boş metadata.
// Səhifə marka siyahısı olmadan açılır, amma çökmür.
const EMPTY_METADATA: Metadata = {
  makes: [],
  models: [],
  cities: [],
  categories: [],
  fuelTypes: [],
  transmissions: [],
  colors: [],
  equipments: [],
  partCategories: [],
}

const ATTEMPTS = 3
const TIMEOUT_MS = 20_000

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// ƏVVƏL: backend bir dəfə cavab verməsəydi xəta atılırdı. Vercel build zamanı
// Render backend-i yuxuda və ya deploy prosesində olanda bütün build dayanırdı.
// İNDİ: 3 dəfə cəhd edir (Render-in oyanmasına vaxt verir), alınmasa boş metadata qaytarır.
export async function getMetadata(): Promise<Metadata> {
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const res = await fetch(`${process.env.API_URL}/api/metadata`, {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })

      if (res.ok) {
        const body = await res.json()
        if (body?.data) return body.data
      }

      console.error(`getMetadata: cəhd ${attempt}/${ATTEMPTS} uğursuz, status ${res.status}`)
    } catch (err) {
      console.error(`getMetadata: cəhd ${attempt}/${ATTEMPTS} uğursuz:`, (err as Error)?.message)
    }

    if (attempt < ATTEMPTS) await sleep(3000 * attempt)
  }

  return EMPTY_METADATA
}
