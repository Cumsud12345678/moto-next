"use client"
import { createColumnHelper } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { type DataTableFeatures } from "../components/data-table-features"
import { Default } from "@/types/metadata"
import Link from "next/link"

export type Listing = {
  _id: string
  price: number
  make: Default
  model: Default
  year: number
  volume: number
  category: Default
  used: boolean
  color: Default
  fuelType: Default
  transmission: Default
  power: number
  mileage: number
  images: string[]
  equipment: Default[]
  region: Default
  phone: number
  barter: boolean
  document: boolean
  credit: boolean
  description: string
  video?: string
  seller: { _id: string, role: string, name: string, email: string }
  viewCount: number
  likedCount: number
  status: 'pending' | 'active' | 'sold' | 'expired' | 'rejected' | 'blocked'
  isUrgent: boolean,
  urgentActiveAt: string
  urgentExpiresAt: string
}

const columnHelper = createColumnHelper<DataTableFeatures, Listing>()

export const columns = columnHelper.columns([
  columnHelper.accessor("_id", { header: "ID" }),
  columnHelper.accessor("price", { header: "Price" }),
  columnHelper.accessor("make", { header: "Make", cell: ({ row }) => row.original.make?.label, }),
  columnHelper.accessor("model", { header: "Model", cell: ({ row }) => row.original.model?.label, }),
  columnHelper.accessor("year", { header: "Year" }),
  columnHelper.accessor("volume", { header: "Volume" }),
  columnHelper.accessor("category", { header: "Category", cell: ({ row }) => row.original.category?.label, }),
  columnHelper.accessor("used", { header: "Used" }),
  columnHelper.accessor("color", { header: "Color", cell: ({ row }) => row.original.color?.label, }),
  columnHelper.accessor("fuelType", { header: "Fuel type", cell: ({ row }) => row.original.fuelType?.label, }),
  columnHelper.accessor("transmission", { header: "Transmission", cell: ({ row }) => row.original.transmission?.label, }),
  columnHelper.accessor("power", { header: "Power" }),
  columnHelper.accessor("mileage", { header: "Mileage"}),
  columnHelper.accessor("images", { header: "Images", cell: ({ row }) => row.original.images?.length }),
  columnHelper.accessor("video", { header: "Video", cell: ({ row }) => row.original.video ? 'var' : 'yoxdur' }),
  columnHelper.accessor("equipment", { header: "Equipment", cell: ({ row }) => row.original.equipment?.map(eq => eq.label), }),
  columnHelper.accessor("region", { header: "Region", cell: ({ row }) => row.original.region?.label, }),
  columnHelper.accessor("phone", { header: "Phone" }),
  columnHelper.accessor("barter", { header: "Barter" }),
  columnHelper.accessor("document", { header: "Document" }),
  columnHelper.accessor("credit", { header: "Credit" }),
  columnHelper.accessor("description", { header: "Description" }),
  columnHelper.accessor(
    "seller", { 
      header: "Seller", 
      cell: ({ row }) => {
        const email = row.original.seller?.email

        return (
          <Link href={`/admin/users/filter?email=${email}`} className="text-blue-500">
            {email}
          </Link>
        )
      }
    }),
  columnHelper.accessor("viewCount", { header: "View count" }),
  columnHelper.accessor("likedCount", { header: "Liked count" }),
  columnHelper.accessor("status", { header: "Status" }),
  columnHelper.accessor("isUrgent", { header: "Urgent" }),
  columnHelper.accessor("urgentActiveAt", { header: "Urgent start" }),
  columnHelper.accessor("urgentExpiresAt", { header: "Urgent expires" }),

  // 👇 yeni sütun
  columnHelper.display({
    id: "actions",
    header: "Əməliyyatlar",
    cell: (context) => {
      const listing = context.row.original
      const meta = context.table.options.meta as {
        onEdit?: (listing: Listing) => void
        onDelete?: (listing: Listing) => void
        onGallery?: (listing: Listing) => void
        onUrgent?: (listing: Listing) => void
      } | undefined

      return (
        <div className="flex gap-2">
          <Button size="sm" className={'bg-blue-500'} onClick={() => meta?.onEdit?.(listing)}>
            Düzəlt
          </Button>
          <Button size="sm" className={'bg-red-500'} onClick={() => meta?.onDelete?.(listing)}>
            Sil
          </Button>
          <Button size="sm" className={'bg-yellow-500'} onClick={() => meta?.onGallery?.(listing)}>
            Gallery
          </Button>
          <Button disabled={listing.isUrgent} size="sm" className={'bg-green-500'} onClick={() => meta?.onUrgent?.(listing)}>
            Urgent et
          </Button>
        </div>
      )
    },
  }),
])