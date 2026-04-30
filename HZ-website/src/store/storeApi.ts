const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export interface FurnitureProduct {
  id: string
  name: string
  slug: string
  category: string
  subCategory?: string
  description?: string
  brand?: string
  tags?: string[]
  baseMrp: number
  baseSellingPrice: number
  baseDiscountPercent: number
  averageRating: number
  ratingCount: number
  isFeatured: boolean
  isCODAvailable: boolean
  deliveryTime?: string
  warranty?: string
  status: string
  images: { id: string; url: string; alt?: string; isPrimary: boolean; sortOrder: number }[]
  variants: {
    id: string
    sku: string
    colorName?: string
    colorHex?: string
    material?: string
    sizeLabel?: string
    mrp: number
    sellingPrice: number
    discountPercent: number
    stockQty: number
    isDefault: boolean
    isActive: boolean
  }[]
}

export interface FurnitureListResponse {
  data: FurnitureProduct[]
  total: number
  currentPage: number
  totalPages: number
}

export async function fetchProducts(params: {
  category?: string
  subCategory?: string
  q?: string
  page?: number
  limit?: number
  priceRange?: string
  sort?: string
  brand?: string
  material?: string
  status?: string
}): Promise<FurnitureListResponse> {
  const qp = new URLSearchParams()
  if (params.category) qp.set('category', params.category)
  if (params.q) qp.set('q', params.q)
  if (params.page) qp.set('page', String(params.page))
  if (params.limit) qp.set('limit', String(params.limit ?? 20))
  if (params.priceRange) qp.set('priceRange', params.priceRange)
  if (params.subCategory) qp.set('subCategory', params.subCategory)
  if (params.sort) qp.set('sort', params.sort)
  if (params.brand) qp.set('brand', params.brand)
  if (params.material) qp.set('material', params.material)
  if (params.status) qp.set('status', params.status)
  const res = await fetch(`${API}/furniture?${qp.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch products')
  return res.json()
}

export async function fetchProduct(id: string): Promise<FurnitureProduct> {
  const res = await fetch(`${API}/furniture/${id}`)
  if (!res.ok) throw new Error('Product not found')
  return res.json()
}

export async function fetchRecommended(mobile?: string): Promise<FurnitureProduct[]> {
  const url = mobile
    ? `${API}/furniture/recommended?mobile=${encodeURIComponent(mobile)}`
    : `${API}/furniture/recommended`
  const res = await fetch(url)
  if (!res.ok) return []
  return res.json()
}

export async function recordBrowse(mobile: string, furnitureId: string, category?: string) {
  try {
    await fetch(`${API}/furniture/browse-history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, furnitureId, category }),
    })
  } catch {
    // non-fatal
  }
}
