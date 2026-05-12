import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { STATIC_INFRA_ADMIN_EMAIL } from '@/lib/infra-admin-static-session';

type ApiHealth = { ok?: boolean; service?: string };

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'infra' | 'wrong' | 'down'>('checking');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const r = await fetch('/api/infra-backend/health', { method: 'GET' });
        const data = (await r.json()) as ApiHealth;
        if (cancelled) return;
        if (!r.ok) {
          setApiStatus('down');
          return;
        }
        if (data?.service === 'houznext-infra-backend') setApiStatus('infra');
        else setApiStatus('wrong');
      } catch {
        if (!cancelled) setApiStatus('down');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn('infra-admin-credentials', {
      redirect: false,
      email,
      password,
    });
    setLoading(false);
    if (res?.ok) {
      toast.success('Logged in');
      router.replace('/listings');
    } else {
      toast.error(
        res?.error === 'CredentialsSignin'
          ? 'Invalid email or password'
          : res?.error || 'Sign-in failed',
      );
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
              Sign in with the Infra admin account (no backend required for login).
            </p>
          </div>

          <div
            style={{
              marginBottom: '16px',
              padding: '12px',
              borderRadius: '10px',
              background: '#f0fdf4',
              border: '1px solid #86efac',
              fontSize: '12px',
              color: '#166534',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <strong style={{ fontFamily: "'Montserrat', sans-serif" }}>Seeded Super admin</strong>
            <br />
            <span style={{ fontSize: '11px' }}>
              {STATIC_INFRA_ADMIN_EMAIL} — password is stored hashed under <code style={{ fontSize: '11px' }}>data/infra-admin-org.json</code> on
              this machine. You can change it from Users after sign-in.
            </span>
          </div>

          {apiStatus === 'checking' ? (
            <p style={{ marginBottom: '14px', fontSize: '12px', color: '#5a6a7e', textAlign: 'center' }}>
              Checking infra API (optional, for listings and data APIs)…
            </p>
          ) : null}
          {apiStatus === 'down' ? (
            <div
              style={{
                marginBottom: '16px',
                padding: '12px',
                borderRadius: '10px',
                background: '#eff6ff',
                border: '1px solid #93c5fd',
                fontSize: '12px',
                color: '#1e3a8a',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <strong style={{ fontFamily: "'Montserrat', sans-serif" }}>Infra API not reachable.</strong>
              <br />
              You can still sign in below. Start <code style={{ fontSize: '11px' }}>HZ-infrabackend</code> on port{' '}
              <strong>4001</strong> when you need live listings and CRUD against the server.
            </div>
          ) : null}
          {apiStatus === 'wrong' ? (
            <div
              style={{
                marginBottom: '16px',
                padding: '12px',
                borderRadius: '10px',
                background: '#fef3c7',
                border: '1px solid #fcd34d',
                fontSize: '12px',
                color: '#92400e',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <strong style={{ fontFamily: "'Montserrat', sans-serif" }}>Port 4001 is not HZ-infrabackend.</strong>
              <br />
              Login still works. Fix the server on 4001 when you need API-backed pages.
            </div>
          ) : null}

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
                placeholder={STATIC_INFRA_ADMIN_EMAIL}
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
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 42px 10px 13px',
                    border: '1.5px solid #dde8f5',
                    borderRadius: '9px',
                    fontSize: '13px',
                    outline: 'none',
                    fontFamily: "'Inter', sans-serif",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '4px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    padding: '6px',
                    border: 'none',
                    background: 'transparent',
                    color: '#5a6a7e',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                </button>
              </div>
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
