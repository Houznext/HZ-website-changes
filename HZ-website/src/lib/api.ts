import axios from 'axios'
import { getSession } from 'next-auth/react'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
})

api.interceptors.request.use(async (config) => {
  const session = await getSession()
  const s = session as unknown as { accessToken?: string } | null
  if (s?.accessToken) {
    config.headers.Authorization = `Bearer ${s.accessToken}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err: { response?: { status: number } }) => {
    if (err.response?.status === 401) {
      import('next-auth/react').then(({ signOut }) => signOut())
    }
    return Promise.reject(err)
  }
)

export default api
