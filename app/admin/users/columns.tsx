"use client"
import { createColumnHelper } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { type DataTableFeatures } from "../components/data-table-features"

export type User = {
  _id: string
  name: string
  email: string,
  ip: string,
  role: 'user' | 'seller' | 'service' | 'admin'
  isWarning: number,
  isLocked: boolean,
  lockedAt: string,
  listingCount: number
}

const columnHelper = createColumnHelper<DataTableFeatures, User>()

export const columns = columnHelper.columns([
  columnHelper.accessor("_id", { header: "id" }),
  columnHelper.accessor("role", { header: "Role" }),
  columnHelper.accessor("email", { header: "Email" }),
  columnHelper.accessor("name", { header: "Name" }),
  columnHelper.accessor("ip", { header: "IP adres" }),
  columnHelper.accessor("isWarning", { header: "Warning count" }),
  columnHelper.accessor("isLocked", { header: "User blocked" }),
  columnHelper.accessor("lockedAt", { header: "Blocked start" }),
  columnHelper.accessor("listingCount", { header: "Listing count" }),

  // 👇 yeni sütun
  columnHelper.display({
    id: "actions",
    header: "Əməliyyatlar",
    cell: (context) => {
      const user = context.row.original
      const meta = context.table.options.meta as {
        onEdit?: (user: User) => void
        onDelete?: (user: User) => void
      } | undefined

      return (
        <div className="flex gap-2">
          <Button size="sm" className={'bg-blue-500'} onClick={() => meta?.onEdit?.(user)}>
            Düzəlt
          </Button>
          <Button size="sm" className={'bg-red-500'} onClick={() => meta?.onDelete?.(user)}>
            Sil
          </Button>
        </div>
      )
    },
  }),
])