import type { MetadataRoute } from 'next'

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listings = await getAllListings()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/elanlar`,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/motors`,
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ]

  const listingPages: MetadataRoute.Sitemap = listings.map((listing) => ({
    url: `${SITE_URL}/elanlar/${listing.make?.label}-${listing.model?.label}-${listing._id}`,
    lastModified: listing.updatedAt
      ? new Date(listing.updatedAt)
      : undefined,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [
    ...staticPages,
    ...listingPages,
  ]
}