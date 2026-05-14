'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import { Building2, Check, Clock, Plus } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';

export default function NewPropertySuccess() {
  const router = useRouter();
  const code = String(router.query.code ?? 'HZI-P00001');
  const title = router.isReady ? decodeURIComponent(String(router.query.title ?? 'Your listing')) : 'Your listing';

  return (
    <AdminLayout
      hideSearch
      header={
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 10 }}>
          <div style={{ flex: 1 }} />
          <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--ch)' }}>Listing submitted</div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Link href="/new-property" className="btn btn-blue btn-sm">
              <Plus size={14} strokeWidth={1.8} />
              Add another property
            </Link>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 500 }}>
        <div style={{ maxWidth: 460, textAlign: 'center', width: '100%' }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 0 0 8px rgba(22,163,74,0.1)',
            }}
          >
            <Check width={36} height={36} strokeWidth={2.5} color="#16a34a" />
          </div>
          <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 26, fontWeight: 800, color: 'var(--ch)', marginBottom: 8 }}>Listing submitted!</h1>
          <p style={{ fontSize: 14, color: 'var(--mu)', lineHeight: 1.7, marginBottom: 24 }}>
            <strong style={{ color: 'var(--ch)' }}>{title}</strong> has been submitted and is pending review. It will go live on infra.houznext.com once approved.
          </p>

          <div style={{ background: '#fff', border: '1px solid var(--brd)', borderRadius: 14, padding: '16px 20px', marginBottom: 20, textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--blue-l)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={18} strokeWidth={1.8} color="var(--blue)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--ch)' }}>{title}</div>
                <div style={{ fontSize: 12, color: 'var(--mu)' }}>#{code}</div>
              </div>
              <span className="bdg b-amber">Pending</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 12.5, color: 'var(--ch)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Check size={14} strokeWidth={1.8} color="var(--tl)" /> All photos uploaded
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Check size={14} strokeWidth={1.8} color="var(--tl)" /> EC certificate verified
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Check size={14} strokeWidth={1.8} color="var(--tl)" /> Owner details saved (admin only)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--blue)' }}>
                <Clock size={14} strokeWidth={1.8} color="var(--blue)" /> Under review — usually 2–4 hours
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/listings" className="btn btn-ghost">
              <Building2 size={15} strokeWidth={1.8} />
              View all listings
            </Link>
            <Link href="/new-property" className="btn btn-blue">
              <Plus size={15} strokeWidth={1.8} />
              Add another
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
