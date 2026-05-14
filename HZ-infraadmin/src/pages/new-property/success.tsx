'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';

export default function NewPropertySuccess() {
  const router = useRouter();
  const code = String(router.query.code ?? 'HZI-P00001');

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: 60, textAlign: 'center' }}>
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: '#dcfce7',
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
        }}
      >
        ✓
      </div>
      <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 22 }}>Listing submitted</h1>
      <p style={{ color: '#64748b', marginTop: 10 }}>Property code</p>
      <p style={{ fontSize: 20, fontWeight: 800, fontFamily: 'Montserrat, sans-serif', marginTop: 4 }}>{code}</p>
      <div style={{ textAlign: 'left', marginTop: 24, fontSize: 13, color: '#475569' }}>
        <div>✓ Saved to database</div>
        <div>✓ Media linked</div>
        <div>✓ Approval workflow</div>
        <div>✓ CRM hooks (if any)</div>
        <div>✓ Search index queued</div>
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 28 }}>
        <Link href="/listings" className="btn btn-blue">
          View all listings
        </Link>
        <Link href="/new-property" className="btn btn-ghost">
          Add another
        </Link>
      </div>
    </div>
  );
}
