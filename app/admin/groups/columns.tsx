"use client"
import { createColumnHelper } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { type DataTableFeatures } from "../components/data-table-features"

export type Group = {
  _id: string
  logo: string
  title: string
  link: string
}

const columnHelper = createColumnHelper<DataTableFeatures, Group>()

export const columns = columnHelper.columns([
  columnHelper.accessor("_id", { header: "id" }),
  columnHelper.accessor("logo", { header: "Logo" }),
  columnHelper.accessor("title", { header: "Title" }),
  columnHelper.accessor("link", { header: "Link" }),
  
  // 👇 yeni sütun
  columnHelper.display({
    id: "actions",
    header: "Əməliyyatlar",
    cell: (context) => {
      const group = context.row.original
      const meta = context.table.options.meta as {
        onEdit?: (group: Group) => void
        onDelete?: (group: Group) => void
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