"use client"

import React, { useEffect, useRef, useState } from "react"
import ProductCard from "./ProductCard"
import { ProductCard as CardType } from "@/types/product"

interface ProductListProps {
  data: CardType[]
}

const ProductList = ({ data }: ProductListProps) => {
  const [products, setProducts] = useState<CardType[]>(data)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const loadMoreRef = useRef<HTMLDivElement>(null)

  // `data` props dəyişəndə (filtr/URL dəyişəndə server yeni data göndərəndə)
  // daxili state-i yenilə və infinite-scroll-u sıfırla.
  useEffect(() => {
    setProducts(data)
    setPage(1)
    setHasMore(true)
  }, [data])

  const loadMore = async () => {
    if (loading || !hasMore) return

    setLoading(true)

    try {
      const nextPage = page + 1

      const res = await fetch(
        `${process.env.API_URL}/api/listings?page=${nextPage}&limit=20`,
        {
          credentials: "include",
        }
      )

      if (!res.ok) {
        throw new Error("Elanlar yüklənmədi")
      }

      const result = await res.json()

      setProducts(prev => [
        ...prev,
        ...result.data,
      ])

      setPage(nextPage)
      setHasMore(result.hasMore)

    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
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

    const element = loadMoreRef.current

    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [page, loading, hasMore])

  if(products.length === 0) {
    return (
      <div className="flex flex-col w-full items-center justify-center">
        <p className="w-full text-xl text-gray-500">Təəssüf ki, axtarışınız əsasında heç nə tapılmadı.</p>
        <img src="/empty.png" alt="" className="size-50" />
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 align-items-center">
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
        className="h-10"
      />
    </>
  )
}

export default ProductList