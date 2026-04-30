import React, { ReactNode } from 'react'
import StoreNavbar from './StoreNavbar'
import StoreFooter from './StoreFooter'

interface StoreLayoutProps {
  children: ReactNode
}

export default function StoreLayout({ children }: StoreLayoutProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <StoreNavbar />
      <main style={{ flex: 1 }}>{children}</main>
      <StoreFooter />
    </div>
  )
}

export function withStoreLayout(Page: React.ComponentType<any>) {
  const Wrapped = (props: any) => (
    <StoreLayout>
      <Page {...props} />
    </StoreLayout>
  )
  Wrapped.displayName = `withStoreLayout(${Page.displayName ?? Page.name ?? 'Page'})`
  return Wrapped
}
