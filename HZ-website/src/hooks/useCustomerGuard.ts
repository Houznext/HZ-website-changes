import { useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { useCustomerAuth } from '@/context/CustomerAuthContext'

export function useCustomerGuard() {
  const { customer, isLoggedIn, isLoading } = useCustomerAuth()
  const router = useRouter()
  const redirected = useRef(false)

  useEffect(() => {
    if (!isLoading && !isLoggedIn && !redirected.current) {
      redirected.current = true
      try {
        sessionStorage.setItem('hz_login_redirect', router.asPath)
      } catch {
        // ignore
      }
      void router.replace('/?login=1')
    }
  }, [isLoading, isLoggedIn, router])

  return { customer, isLoading: isLoading || !isLoggedIn }
}
