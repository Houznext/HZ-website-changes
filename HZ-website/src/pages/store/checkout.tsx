import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { withStoreLayout } from '@/components/Layouts/StoreLayout'
import { useCustomerAuth } from '@/context/CustomerAuthContext'
import SeoHead from '@/components/SeoHead'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

function CheckoutPage() {
  const router = useRouter()
  const { customer, isLoggedIn } = useCustomerAuth()
  const [cart, setCart] = useState<any>(null)
  const [paying, setPaying] = useState(false)
  const [address, setAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'EMI' | 'COD'>('RAZORPAY')

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  useEffect(() => {
    if (!isLoggedIn || !customer) {
      router.replace('/?login=1')
      return
    }
    fetch(`${API}/cart/${customer.id}`, { headers: { Authorization: `Bearer ${customer.token}` } })
      .then((r) => r.json())
      .then(setCart)
      .catch(() => setCart(null))
  }, [isLoggedIn, customer])

  const payNow = async () => {
    if (!customer || !cart) return
    setPaying(true)
    try {
      const placeOrderRes = await fetch(`${API}/orders/customer/place`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customer.token}` },
        body: JSON.stringify({
          type: 'FURNITURE',
          paymentProvider: paymentMethod === 'COD' ? 'WALLET' : 'RAZORPAY',
          shippingDetails: { addressLine: address || 'Not provided' },
        }),
      })
      const order = await placeOrderRes.json()
      if (!placeOrderRes.ok) throw new Error('Order placement failed')

      if (paymentMethod !== 'COD') {
        const sessionRes = await fetch(`${API}/payments/customer/create-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customer.token}` },
          body: JSON.stringify({
            orderId: order.id,
            provider: 'RAZORPAY',
          }),
        })
        const session = await sessionRes.json()
        if (!sessionRes.ok) throw new Error('Payment session failed')

        const RazorpayCtor = (window as any).Razorpay
        if (RazorpayCtor) {
          const rz = new RazorpayCtor({
            key: session.keyId || session.key,
            amount: session.amount,
            currency: session.currency || 'INR',
            order_id: session.order_id || session.razorpayOrderId,
            name: 'Houznext Store',
            handler: async (resp: any) => {
              await fetch(`${API}/payments/customer/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customer.token}` },
                body: JSON.stringify({
                  razorpay_order_id: resp.razorpay_order_id,
                  razorpay_payment_id: resp.razorpay_payment_id,
                  razorpay_signature: resp.razorpay_signature,
                }),
              })
              router.push('/my-account?tab=orders&success=1')
            },
          })
          rz.open()
          return
        }
      }
      router.push('/my-account?tab=orders&success=1')
    } finally {
      setPaying(false)
    }
  }

  return (
    <>
      <SeoHead
        title="Checkout | Houznext Store"
        description="Complete your Houznext Store purchase with secure payment and delivery details."
        canonical="/store/checkout"
        noIndex
      />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(10px, 3vw, 20px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
      <div style={{ background: '#fff', border: '1px solid #dde8f5', borderRadius: 12, padding: 14 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Checkout</h1>
        <div style={{ marginTop: 10 }}>Name: {customer?.name}</div>
        <div>Contact: {customer?.mobile?.trim() || customer?.email || '—'}</div>
        <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Delivery address" style={{ marginTop: 10, width: '100%', minHeight: 88, border: '1px solid #dde8f5', borderRadius: 10, padding: 10, fontSize: 13 }} />
        <div style={{ marginTop: 10, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {(['RAZORPAY', 'EMI', 'COD'] as const).map((m) => (
            <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <input type="radio" checked={paymentMethod === m} onChange={() => setPaymentMethod(m)} />
              {m === 'RAZORPAY' ? 'Razorpay' : m === 'EMI' ? 'No-cost EMI' : 'Cash on delivery'}
            </label>
          ))}
        </div>
      </div>
      <div style={{ background: '#fff', border: '1px solid #dde8f5', borderRadius: 12, padding: 14, height: 'fit-content' }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Order total</div>
        <div>₹{Number(cart?.grandTotal || 0).toLocaleString('en-IN')}</div>
        <button onClick={payNow} disabled={paying} style={{ marginTop: 10, width: '100%', border: 'none', borderRadius: 8, background: '#2f80ed', color: '#fff', padding: '10px 12px', cursor: 'pointer' }}>{paying ? 'Processing...' : 'Pay now'}</button>
      </div>
      </div>
    </>
  )
}

export default withStoreLayout(CheckoutPage)
