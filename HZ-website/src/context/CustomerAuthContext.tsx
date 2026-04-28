import React, {
  createContext, useCallback, useContext,
  useEffect, useMemo, useState,
} from 'react'

export interface CustomerUser {
  id: string
  name: string
  mobile: string
  token: string
}

interface CustomerAuthContextValue {
  customer: CustomerUser | null
  isLoggedIn: boolean
  isLoading: boolean
  loginSuccess: (user: CustomerUser) => void
  logout: () => void
}

const CustomerAuthContext = createContext<CustomerAuthContextValue>({
  customer: null,
  isLoggedIn: false,
  isLoading: true,
  loginSuccess: () => {},
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
      if (token && id && mobile) {
        setCustomer({ id, name: name ?? '', mobile, token })
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
      localStorage.setItem('hz_customer_mobile', user.mobile)
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
    } catch {
      // ignore
    }
    setCustomer(null)
  }, [])

  const value = useMemo(
    () => ({
      customer,
      isLoggedIn: !!customer,
      isLoading,
      loginSuccess,
      logout,
    }),
    [customer, isLoading, loginSuccess, logout],
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
