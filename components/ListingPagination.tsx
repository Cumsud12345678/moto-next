'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

interface Props {
  currentPage: number
  totalPages: number
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | 'ellipsis')[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  if (start > 2) pages.push('ellipsis')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total - 1) pages.push('ellipsis')

  pages.push(total)
  return pages
}

const ListingPagination = ({ currentPage, totalPages }: Props) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  const createHref = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (page <= 1) params.delete('page')
    else params.set('page', String(page))
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  const disabledClass = 'pointer-events-none opacity-50'

  return (
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={createHref(currentPage - 1)}
            aria-disabled={currentPage <= 1}
            className={currentPage <= 1 ? disabledClass : ''}
          />
        </PaginationItem>

        {getPageNumbers(currentPage, totalPages).map((p, i) => (
          <PaginationItem key={`${p}-${i}`}>
            {p === 'ellipsis' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink href={createHref(p)} isActive={p === currentPage}>
                {p}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            href={createHref(currentPage + 1)}
            aria-disabled={currentPage >= totalPages}
            className={currentPage >= totalPages ? disabledClass : ''}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export default ListingPagination