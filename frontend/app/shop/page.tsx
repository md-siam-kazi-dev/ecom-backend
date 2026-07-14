"use client"

import { useEffect, useState } from "react"
import { ProductCard, type Product } from "@/components/ProductCard"

type SortOption = "name" | "price_asc" | "price_desc"

const SORT_LABELS: Record<SortOption, string> = {
  name: "Name (A–Z)",
  price_asc: "Price: Low to High",
  price_desc: "Price: High to Low",
}

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

function getUserEmail(): string {
  const token = getToken()
  if (!token) return ""
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.email ?? ""
  } catch {
    return ""
  }
}

export default function ShopPage() {
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortOption>("name")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    const apiBase = process.env.NEXT_PUBLIC_API

    async function load() {
      if (!apiBase) return
      setLoading(true)
      try {
        const params = new URLSearchParams({ sort })
        if (search.trim()) params.set("search", search.trim())

        const res = await fetch(`${apiBase}/api/product?${params.toString()}`, {
          signal: controller.signal,
        })
        const data = await res.json()
        const list: any[] = Array.isArray(data) ? data : []

        setProducts(
          list.map((p) => ({
            id: p._id?.toString?.() ?? p.id,
            name: p.name,
            price: p.price,
            email: getUserEmail(),
          })),
        )
      } catch (error) {
        if ((error as any)?.name !== "AbortError") {
          console.error("Failed to load products", error)
        }
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => controller.abort()
  }, [search, sort])

  const token = getToken()

  return (
    <main className="mx-auto max-w-5xl p-4">
      <h1 className="mb-4 text-2xl font-semibold">Shop</h1>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by keyword…"
          className="flex-1 rounded-md border px-3 py-2"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="rounded-md border px-3 py-2"
        >
          {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
            <option key={key} value={key}>
              {SORT_LABELS[key]}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              token={token}
            />
          ))}
        </div>
      )}
    </main>
  )
}
