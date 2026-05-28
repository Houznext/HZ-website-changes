import React from 'react'
import Link from 'next/link'

export default function StoreFooter() {
  return (
    <footer
      style={{
        background: '#0f2a44',
        padding: '40px 24px 20px',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        marginTop: 'auto',
      }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 32,
            marginBottom: 28,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'Montserrat, system-ui',
                fontSize: 18,
                fontWeight: 800,
                color: '#fff',
                marginBottom: 6,
              }}
            >
              Houz<span style={{ color: '#f2994a' }}>next</span>{' '}
              <span
                style={{
                  fontSize: 9,
                  background: '#2f80ed',
                  padding: '2px 6px',
                  borderRadius: 4,
                }}
              >
                STORE
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 240 }}>
              Premium furniture and home decor for Houznext homeowners. Designed in Hyderabad.
            </p>
          </div>
          {[
            {
              title: 'Shop',
              links: [
                { label: 'New Arrivals', href: '/store?category=New+Arrivals' },
                { label: 'Best sellers', href: '/store' },
                { label: 'Custom furniture', href: '/store?category=Custom+Furniture' },
                { label: 'Home decor', href: '/store?category=Home+Decor' },
              ],
            },
            {
              title: 'Help',
              links: [
                { label: 'My orders', href: '/my-account?tab=orders' },
                { label: 'Return policy', href: '/store/returns' },
                { label: 'Warranty claims', href: '/store/warranty' },
                { label: 'Contact us', href: '/contact-us' },
              ],
            },
            {
              title: 'Account',
              links: [
                { label: 'My account', href: '/my-account' },
                { label: 'Wishlist', href: '/store/wishlist' },
                { label: 'Cart', href: '/store/cart' },
                { label: 'LiveBuild', href: '/livebuild' },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                {col.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {col.links.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>© 2026 Houznext Store · All rights reserved</p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Secure payments via Razorpay · Free delivery in Hyderabad</p>
        </div>
      </div>
    </footer>
  )
}
