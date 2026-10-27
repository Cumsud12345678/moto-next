import type { MetadataRoute } from 'next'
import { listingPath, partPath } from '@/lib/slug'

const SITE_URL = process.env.SITE_URL!
const API_URL = process.env.NEXT_PUBLIC_API_URL!

interface SitemapListing {
  _id: string
  updatedAt?: string
  make?: {
    label: string
  }
  model?: {
    label: string
  }
}

const LIMIT = 100
const MAX_PAGES = 400

async function getAllListings(): Promise<SitemapListing[]> {
  const listings: SitemapListing[] = []

  for (let page = 1; page <= MAX_PAGES; page++) {
    try {
      const res = await fetch(
        `${API_URL}/api/listings?page=${page}&limit=${LIMIT}`,
        {
          next: {
            revalidate: 3600,
          },
        }
      )

      if (!res.ok) break

      const json = await res.json()

      const items: SitemapListing[] = json.data ?? []

      listings.push(...items)

      if (items.length < LIMIT) break
    } catch {
      break
    }
  }

  return listings
}

interface SitemapPart {
  _id: string
  title: string
  createdAt?: string
}

// Ehtiyat hissəsi elanları (backend köhnədirsə boş siyahı)
async function getAllParts(): Promise<SitemapPart[]> {
  const parts: SitemapPart[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    try {
      const res = await fetch(`${API_URL}/api/parts?page=${page}&limit=${LIMIT}`, { next: { revalidate: 3600 } })
      if (!res.ok) break
      const json = await res.json()
      const items: SitemapPart[] = json.data ?? []
      parts.push(...items)
      if (items.length < LIMIT) break
    } catch {
      break
    }
  }
  return parts
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [listings, parts] = await Promise.all([getAllListings(), getAllParts()])

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/motors`,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/hisseler`,
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ]

  const partPages: MetadataRoute.Sitemap = parts.map((part) => ({
    url: `${SITE_URL}${partPath(part.title, part._id)}`,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  const listingPages: MetadataRoute.Sitemap = listings.map((listing) => ({
    url: `${SITE_URL}${listingPath(listing.make?.label, listing.model?.label, listing._id)}`,
    lastModified: listing.updatedAt
      ? new Date(listing.updatedAt)
      : undefined,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [
    ...staticPages,
    ...listingPages,
    ...partPages,
  ]
}