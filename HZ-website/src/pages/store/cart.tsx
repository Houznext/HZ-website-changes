import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { withStoreLayout } from '@/components/Layouts/StoreLayout'
import { useCustomerAuth } from '@/context/CustomerAuthContext'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

function StoreCartPage() {
  const router = useRouter()
  const { customer, isLoggedIn } = useCustomerAuth()
  const [cart, setCart] = useState<any>(null)
  const [coupon, setCoupon] = useState('')

  const load = () => {
    if (!customer) return
    fetch(`${API}/cart/${customer.id}`, { headers: { Authorization: `Bearer ${customer.token}` } })
      .then((r) => r.json())
      .then(setCart)
      .catch(() => setCart(null))
  }

  useEffect(() => {
    if (!isLoggedIn || !customer) {
      router.replace('/?login=1')
      return
    }
    load()
  }, [isLoggedIn, customer])

  useEffect(() => {
    const onChange = () => load()
    window.addEventListener('cart-changed', onChange)
    return () => window.removeEventListener('cart-changed', onChange)
  }, [customer])

  const updateQty = async (item: any, delta: number) => {
    if (!customer) return
    const nextQty = Math.max(1, Number(item.quantity || 1) + delta)
    await fetch(`${API}/cart/${customer.id}/items/${item.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer.token}`,
      },
      body: JSON.stringify({ quantity: nextQty }),
    })
    load()
  }

  const removeItem = async (itemId: string) => {
    if (!customer) return
    await fetch(`${API}/cart/${customer.id}/items/${itemId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${customer.token}` },
    })
    load()
  }

  const applyCoupon = async () => {
    if (!customer) return
    await fetch(`${API}/cart/${customer.id}/meta`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customer.token}`,
      },
      body: JSON.stringify({ couponCode: coupon.trim() || undefined }),
    })
    load()
  }

  if (!cart) return <div style={{ padding: 24 }}>Loading cart...</div>

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 20, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
      <div style={{ background: '#fff', border: '1px solid #dde8f5', borderRadius: 12, padding: 14 }}>
        {(cart.items || []).map((item: any) => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eef4fb', padding: '10px 0' }}>
            <div>
              <div>{item.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <button onClick={() => void updateQty(item, -1)} style={{ width: 24, height: 24, border: '1px solid #dde8f5', borderRadius: 6, background: '#fff' }}>-</button>
                <span style={{ minWidth: 16, textAlign: 'center', fontSize: 12 }}>{item.quantity}</span>
                <button onClick={() => void updateQty(item, 1)} style={{ width: 24, height: 24, border: '1px solid #dde8f5', borderRadius: 6, background: '#fff' }}>+</button>
                <button onClick={() => void removeItem(item.id)} style={{ border: 'none', background: 'transparent', color: '#dc2626', fontSize: 12, cursor: 'pointer' }}>Remove</button>
              </div>
            </div>
            <div>₹{Number(item.itemTotal || 0).toLocaleString('en-IN')}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#fff', border: '1px solid #dde8f5', borderRadius: 12, padding: 14, height: 'fit-content' }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Order summary</div>
        <div>Total: ₹{Number(cart.grandTotal || 0).toLocaleString('en-IN')}</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
          <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon code" style={{ flex: 1, border: '1px solid #dde8f5', borderRadius: 8, padding: '8px 10px', fontSize: 12 }} />
          <button onClick={() => void applyCoupon()} style={{ border: '1px solid #c7daf3', borderRadius: 8, background: '#e8f1fd', color: '#0f2a44', padding: '8px 12px', fontSize: 12 }}>Apply</button>
        </div>
        <button onClick={() => router.push('/store/checkout')} style={{ marginTop: 10, width: '100%', border: 'none', borderRadius: 8, background: '#0f2a44', color: '#fff', padding: '10px 12px', cursor: 'pointer' }}>Proceed to checkout</button>
      </div>
    </div>
  )
}

export default withStoreLayout(StoreCartPage)
