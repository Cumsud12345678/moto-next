"use client"
import { createColumnHelper } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { type DataTableFeatures } from "../components/data-table-features"

export type Adsense = {
  _id: string
  logo: string
  link: string
  position: 'mobile' | 'deskop_left' | 'deskop_right'
  isHome: boolean
  isDetails: boolean
  clickCount: number
  adsenseExpiresAt: string
  ownerName: string
  ownerPhone: string
}

const columnHelper = createColumnHelper<DataTableFeatures, Adsense>()

export const columns = columnHelper.columns([
  columnHelper.accessor("_id", { header: "id" }),
  columnHelper.accessor("logo", { header: "Logo" }),
  columnHelper.accessor("link", { header: "Link" }),
  columnHelper.accessor("position", { header: "Position" }),
  columnHelper.accessor("isHome", { header: "Home seyfesi?" }),
  columnHelper.accessor("isDetails", { header: "Detay seyfesi?" }),
  columnHelper.accessor("clickCount", { header: "Click count" }),
  columnHelper.accessor("adsenseExpiresAt", { header: "Bitis tarixi" }),
  columnHelper.accessor("ownerName", { header: "Owner name" }),
  columnHelper.accessor("ownerPhone", { header: "Owner phone" }),
  
  // 👇 yeni sütun
  columnHelper.display({
    id: "actions",
    header: "Əməliyyatlar",
    cell: (context) => {
      const group = context.row.original
      const meta = context.table.options.meta as {
        onEdit?: (group: Adsense) => void
        onDelete?: (group: Adsense) => void
      } | undefined

      return (
        <div className="flex gap-2">
          <Button size="sm" className={'bg-blue-500'} onClick={() => meta?.onEdit?.(group)}>
            Düzəlt
          </Button>
          <Button size="sm" className={'bg-red-500'} onClick={() => meta?.onDelete?.(group)}>
            Sil
          </Button>
        </div>
      )
    },
  }),
])