import React, {
  createContext, useCallback, useContext,
  useEffect, useMemo, useState,
} from 'react'

export interface CustomerUser {
  id: string
  name: string
  token: string
  /** Linked HZ store cart user id (user table) — not the portal customer id. */
  storeUserId?: string
  /** Present after mobile OTP or linked phone; quotations/invoices use this. */
  mobile?: string | null
  email?: string | null
}

interface CustomerAuthContextValue {
  customer: CustomerUser | null
  isLoggedIn: boolean
  isLoading: boolean
  loginSuccess: (user: CustomerUser) => void
  updateCustomerName: (name: string) => void
  updateCustomerMobile: (mobile: string) => void
  logout: () => void
}

const CustomerAuthContext = createContext<CustomerAuthContextValue>({
  customer: null,
  isLoggedIn: false,
  isLoading: true,
  loginSuccess: () => {},
  updateCustomerName: () => {},
  updateCustomerMobile: () => {},
  logout: () => {},
})

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const token = localStorage.getItem('hz_customer_token')
      const id = localStorage.getItem('hz_customer_id')
      const name = localStorage.getItem('hz_customer_name')
      const mobile = localStorage.getItem('hz_customer_mobile')
      const email = localStorage.getItem('hz_customer_email')
      const storeUserId = localStorage.getItem('hz_customer_store_user_id')
      if (token && id) {
        setCustomer({
          id,
          name: name ?? '',
          token,
          storeUserId: storeUserId && storeUserId.length > 0 ? storeUserId : undefined,
          mobile: mobile && mobile.length > 0 ? mobile : null,
          email: email && email.length > 0 ? email : null,
        })
      }
    } catch {
      // ignore
    }
    setIsLoading(false)
  }, [])

  const loginSuccess = useCallback((user: CustomerUser) => {
    try {
      localStorage.setItem('hz_customer_token', user.token)
      localStorage.setItem('hz_customer_id', user.id)
      localStorage.setItem('hz_customer_name', user.name)
      if (user.storeUserId) {
        localStorage.setItem('hz_customer_store_user_id', user.storeUserId)
      } else {
        localStorage.removeItem('hz_customer_store_user_id')
      }
      if (user.mobile && String(user.mobile).trim()) {
        localStorage.setItem('hz_customer_mobile', String(user.mobile).trim())
      } else {
        localStorage.removeItem('hz_customer_mobile')
      }
      if (user.email && String(user.email).trim()) {
        localStorage.setItem('hz_customer_email', String(user.email).trim().toLowerCase())
      } else {
        localStorage.removeItem('hz_customer_email')
      }
    } catch {
      // ignore
    }
    setCustomer(user)
  }, [])

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('hz_customer_token')
      localStorage.removeItem('hz_customer_id')
      localStorage.removeItem('hz_customer_name')
      localStorage.removeItem('hz_customer_mobile')
      localStorage.removeItem('hz_customer_email')
      localStorage.removeItem('hz_customer_store_user_id')
    } catch {
      // ignore
    }
    setCustomer(null)
  }, [])

  const updateCustomerName = useCallback((name: string) => {
    const normalized = name.trim()
    setCustomer((prev) => {
      if (!prev) return prev
      const next = { ...prev, name: normalized }
      try {
        localStorage.setItem('hz_customer_name', normalized)
      } catch {
        // ignore
      }
      return next
    })
  }, [])

  const updateCustomerMobile = useCallback((mobile: string) => {
    const normalized = mobile.replace(/\D/g, '').slice(-10)
    setCustomer((prev) => {
      if (!prev) return prev
      const next = { ...prev, mobile: normalized || null }
      try {
        if (normalized) {
          localStorage.setItem('hz_customer_mobile', normalized)
        } else {
          localStorage.removeItem('hz_customer_mobile')
        }
      } catch {
        // ignore
      }
      return next
    })
  }, [])

  useEffect(() => {
    if (!customer?.token || customer.storeUserId) return
    const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
    void fetch(`${API}/interiors/auth/store-context`, {
      headers: { Authorization: `Bearer ${customer.token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { storeUserId?: string } | null) => {
        if (!data?.storeUserId) return
        setCustomer((prev) => (prev ? { ...prev, storeUserId: data.storeUserId } : prev))
        try {
          localStorage.setItem('hz_customer_store_user_id', data.storeUserId)
        } catch {
          // ignore
        }
      })
      .catch(() => {})
  }, [customer?.token, customer?.storeUserId])

  const value = useMemo(
    () => ({
      customer,
      isLoggedIn: !!(customer?.token && customer?.id),
      isLoading,
      loginSuccess,
      updateCustomerName,
      updateCustomerMobile,
      logout,
    }),
    [customer, isLoading, loginSuccess, updateCustomerName, updateCustomerMobile, logout],
  )

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  )
}

export function useCustomerAuth() {
  return useContext(CustomerAuthContext)
}
