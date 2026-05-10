import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });
    setLoading(false);
    if (res?.ok) {
      toast.success('Logged in');
      router.replace('/listings');
    } else {
      toast.error('Invalid email or password');
    }
  };

  return (
    <>
      <Head>
        <title>Admin Login — Houznext Infra</title>
      </Head>
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(145deg,#09192a,#0f2a44)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '40px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 24px 64px rgba(0,0,0,.2)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '22px',
                fontWeight: 800,
                color: '#0f2a44',
              }}
            >
              Houznext <span style={{ color: '#f2994a' }}>Infra</span>
            </div>
            <div
              style={{
                display: 'inline-block',
                marginTop: '6px',
                padding: '2px 10px',
                borderRadius: '20px',
                background: '#e8f1fd',
                color: '#2f80ed',
                fontSize: '11px',
                fontWeight: 700,
                fontFamily: "'Montserrat', sans-serif",
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Admin Portal
            </div>
            <p style={{ fontSize: '13px', color: '#5a6a7e', marginTop: '8px' }}>
              Sign in to manage Houznext Infra
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '14px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#5a6a7e',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  fontFamily: "'Montserrat', sans-serif",
                  marginBottom: '5px',
                }}
              >
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@infra.houznext.com"
                style={{
                  width: '100%',
                  padding: '10px 13px',
                  border: '1.5px solid #dde8f5',
                  borderRadius: '9px',
                  fontSize: '13px',
                  outline: 'none',
                  fontFamily: "'Inter', sans-serif",
                }}
              />
            </div>

            <div style={{ marginBottom: '22px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#5a6a7e',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  fontFamily: "'Montserrat', sans-serif",
                  marginBottom: '5px',
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '10px 13px',
                  border: '1.5px solid #dde8f5',
                  borderRadius: '9px',
                  fontSize: '13px',
                  outline: 'none',
                  fontFamily: "'Inter', sans-serif",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                background: loading ? '#93c5fd' : '#2f80ed',
                color: '#fff',
                border: 'none',
                borderRadius: '9px',
                fontSize: '14px',
                fontWeight: 700,
                fontFamily: "'Montserrat', sans-serif",
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background .18s',
              }}
            >
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
