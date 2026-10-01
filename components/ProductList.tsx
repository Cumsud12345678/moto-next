"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import ProductCard from "./ProductCard"
import { ProductCard as CardType } from "@/types/product"

interface ProductListProps {
  data: CardType[]
}

const PAGE_SIZE = 20

const ProductList = ({ data }: ProductListProps) => {
  const [products, setProducts] = useState<CardType[]>(data)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Filter / URL dəyişəndə siyahını sıfırla
  useEffect(() => {
    setProducts(data)
    setPage(1)
    setHasMore(data.length >= PAGE_SIZE)
  }, [data])

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)

    try {
      const nextPage = page + 1

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/listings?page=${nextPage}&limit=${PAGE_SIZE}`,
        {
          credentials: "include",
          cache: "no-store",
        }
      )

      if (!res.ok) {
        throw new Error("Elanlar yüklənmədi")
      }

      const result = await res.json()

      const newProducts: CardType[] = result.data ?? []

      setProducts(prev => {
        // Eyni elan ikinci dəfə gəlməsin
        const existingIds = new Set(prev.map(item => item._id))

        const uniqueProducts = newProducts.filter(
          item => !existingIds.has(item._id)
        )

        return [...prev, ...uniqueProducts]
      })

      setPage(nextPage)

      // Backend hasMore göndərirsə onu istifadə et
      // yoxdursa data uzunluğuna bax
      setHasMore(
        typeof result.hasMore === "boolean"
          ? result.hasMore
          : newProducts.length === PAGE_SIZE
      )
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [page, loading, hasMore])

  useEffect(() => {
    const element = loadMoreRef.current

    if (!element) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      {
        rootMargin: "500px",
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [loadMore])

  if (products.length === 0) {
    return (
      <div className="flex flex-col w-full items-center justify-center">
        <p className="w-full text-xl text-gray-500">
          Təəssüf ki, axtarışınız əsasında heç nə tapılmadı.
        </p>

        <img
          src="/empty.png"
          alt=""
          className="size-50"
        />
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 items-center">
        {products.map(product => (
          <ProductCard
            key={product._id}
            product={product}
          />
        ))}
      </div>

      {/* Infinite scroll trigger */}
      <div
        ref={loadMoreRef}
        className="h-20 flex items-center justify-center"
      >
        {loading && (
          <p className="text-sm text-gray-500">
            Yüklənir...
          </p>
        )}

        {!loading && !hasMore && products.length > 0 && (
          <p className="text-sm text-gray-400">
            Bütün elanlar göstərildi
          </p>
        )}
      </div>
    </>
  )
}

export default ProductList