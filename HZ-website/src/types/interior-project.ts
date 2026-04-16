export interface InteriorProject {
  id: number
  title: string
  location: string
  propertyType: string
  sqft: number
  package: string
  costInLakhs: number
  deliveryDays: number
  style: string
  rating: number
  description: string
  rooms: string[]
  images: string[]
  status: string
  featured: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface ProjectsResponse {
  data: InteriorProject[]
  total: number
  page: number
  limit: number
  totalPages: number
}
