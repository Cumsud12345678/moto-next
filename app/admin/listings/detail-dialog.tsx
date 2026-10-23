'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { listingPath } from '@/lib/slug'
import { BoolBadge, ListingStatusBadge, ToneBadge } from '../components/StatusBadge'
import { formatDateTime, formatNumber, formatPrice, imageSrc, IMAGE_URL } from '../_lib/utils'
import type { AdminListing } from '../_lib/types'

function Spec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 border-b py-1.5 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{children ?? '—'}</span>
    </div>
  )
}

const formatPhone = (phone?: number) => {
  const s = String(phone ?? '').padStart(9, '0')
  return phone ? `0${s.slice(0, 2)} ${s.slice(2, 5)} ${s.slice(5, 7)} ${s.slice(7)}` : '—'
}

// Elanın bütün məlumatları + şəkillər + video bir pəncərədə
export default function ListingDetailDialog({
  listing,
  onOpenChange,
}: {
  listing: AdminListing | null
  onOpenChange: (open: boolean) => void
}) {
  const [active, setActive] = useState(0)
  const [lastId, setLastId] = useState(listing?._id)
  if (listing?._id !== lastId) {
    setLastId(listing?._id)
    setActive(0)
  }

  if (!listing) return null

  const title = `${listing.make?.label ?? ''} ${listing.model?.label ?? ''} ${listing.year ?? ''}`.trim()
  const images = listing.images ?? []

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="pr-6 text-lg">{title || 'Elan'}</DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-foreground">{formatPrice(listing.price)}</span>
            <ListingStatusBadge status={listing.status} />
            {listing.isUrgent && <ToneBadge tone="orange">Premium</ToneBadge>}
            <Link
              href={listingPath(listing.make?.label, listing.model?.label, listing._id)}
              target="_blank"
              className="text-sky-700 hover:underline"
            >
              Saytda aç ↗
            </Link>
          </DialogDescription>
        </DialogHeader>

        {(images.length > 0 || listing.video) && (
          <div className="flex flex-col gap-2">
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg bg-gray-100 sm:aspect-video">
              {active < images.length ? (
                <a href={imageSrc(images[active])} target="_blank" rel="noreferrer">
                  <Image src={imageSrc(images[active])} alt="" fill unoptimized className="object-contain" />
                </a>
              ) : (
                <video src={`${IMAGE_URL}/${listing.video}`} controls className="size-full object-contain" />
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`relative size-16 shrink-0 overflow-hidden rounded-md border-2 ${active === i ? 'border-sky-500' : 'border-transparent'}`}
                >
                  <Image src={imageSrc(img)} alt="" fill unoptimized className="object-cover" />
                </button>
              ))}
              {listing.video && (
                <button
                  type="button"
                  onClick={() => setActive(images.length)}
                  className={`flex size-16 shrink-0 items-center justify-center rounded-md border-2 bg-gray-900 text-xs text-white ${active === images.length ? 'border-sky-500' : 'border-transparent'}`}
                >
                  ▶ Video
                </button>
              )}
            </div>
          </div>
        )}

        <div className="grid gap-x-6 sm:grid-cols-2">
          <div>
            <Spec label="Marka">{listing.make?.label}</Spec>
            <Spec label="Model">{listing.model?.label}</Spec>
            <Spec label="İl">{listing.year}</Spec>
            <Spec label="Həcm">{listing.volume ? `${listing.volume} sm³` : '—'}</Spec>
            <Spec label="Güc">{listing.power ? `${listing.power} a.g.` : '—'}</Spec>
            {/* Saytda used=true "Yeni" deməkdir (elan formasında "Yeni" düyməsi true göndərir) */}
            <Spec label="Vəziyyət">{listing.used ? 'Yeni' : 'Sürülmüş'}</Spec>
            <Spec label="Yürüş">{`${formatNumber(listing.mileage ?? 0)} km`}</Spec>
            <Spec label="Ban növü">{listing.category?.label}</Spec>
            <Spec label="Rəng">{listing.color?.label}</Spec>
          </div>
          <div>
            <Spec label="Mühərrik">{listing.fuelType?.label}</Spec>
            <Spec label="Sürətlər qutusu">{listing.transmission?.label}</Spec>
            <Spec label="Şəhər">{listing.region?.label}</Spec>
            <Spec label="Telefon">{formatPhone(listing.phone)}</Spec>
            <Spec label="Kredit"><BoolBadge value={listing.credit} /></Spec>
            <Spec label="Barter"><BoolBadge value={listing.barter} /></Spec>
            <Spec label="Sənəd"><BoolBadge value={listing.document} /></Spec>
            <Spec label="Baxış / bəyənmə">{formatNumber(listing.viewCount ?? 0)} / {formatNumber(listing.likedCount ?? 0)}</Spec>
          </div>
        </div>

        {listing.equipment?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {listing.equipment.map((eq) => (
              <ToneBadge key={eq._id} tone="gray">{eq.label}</ToneBadge>
            ))}
          </div>
        )}

        {listing.description && (
          <div>
            <h4 className="mb-1 text-sm font-semibold">Açıqlama</h4>
            <p className="whitespace-pre-line text-sm">{listing.description}</p>
          </div>
        )}

        <div className="grid gap-x-6 rounded-lg bg-gray-50 p-3 sm:grid-cols-2">
          <div>
            <Spec label="Satıcı">
              {listing.seller ? (
                <Link href={`/admin/users?q=${encodeURIComponent(listing.seller.email)}`} className="text-sky-700 hover:underline">
                  {listing.seller.name || listing.seller.email}
                </Link>
              ) : '—'}
            </Spec>
            <Spec label="Email">{listing.seller?.email}</Spec>
          </div>
          <div>
            <Spec label="Yaradılıb">{formatDateTime(listing.createdAt)}</Spec>
            <Spec label="Yenilənib">{formatDateTime(listing.updatedAt)}</Spec>
            {listing.isUrgent && <Spec label="Premium bitir">{formatDateTime(listing.urgentExpiresAt)}</Spec>}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">ID: {listing._id}</p>
      </DialogContent>
    </Dialog>
  )
}
