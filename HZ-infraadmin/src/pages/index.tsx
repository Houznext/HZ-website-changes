import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    void router.replace('/listings');
  }, [router]);
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#5a6a7e', fontSize: 13 }}>Redirecting…</span>
    </div>
  );
}
