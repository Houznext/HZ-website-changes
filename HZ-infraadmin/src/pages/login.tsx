import { useState } from 'react';
import Head from 'next/head';
import { Eye, EyeOff } from 'lucide-react';
import { saveSession } from '@/lib/session';
import { useInfraPermissionStore } from '@/stores/useInfraPermissionStore';

const BACKEND = '/api/infra-backend';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const initFromSession = useInfraPermissionStore((s) => s.initFromSession);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 502) {
        setError(
          (data as { detail?: string; error?: string }).detail ||
            (data as { error?: string }).error ||
            'Backend unreachable. Check INFRA_BACKEND_URL on Vercel points to your Railway API URL (https://….up.railway.app).',
        );
        setLoading(false);
        return;
      }

      if (!res.ok || !data.access_token) {
        setError(
          Array.isArray(data.message) ? data.message.join(', ') : data.message || 'Invalid email or password',
        );
        setLoading(false);
        return;
      }

      const user = {
        id: data.user.id,
        username: data.user.username,
        email: data.user.email ?? '',
        name: data.user.firstName ? `${data.user.firstName} ${data.user.lastName ?? ''}`.trim() : data.user.username,
        role: data.user.role,
        kind: data.user.kind,
        branchMemberships: data.user.branchMemberships ?? [],
      };

      saveSession(data.access_token, user);
      initFromSession(user.branchMemberships, user.role, user.email, user.kind);
      window.location.href = '/listings';
    } catch {
      setError('Cannot connect to server. Make sure the backend is running.');
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Admin Login — Houznext Infra</title>
      </Head>
      <style jsx global>{`
        .admin-login-page {
          min-height: 100vh;
          background: #f5f7fa;
          display: flex;
          align-items: stretch;
          justify-content: center;
          padding: 0;
        }
        .admin-login-inner {
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .admin-login-card {
          width: 100%;
          overflow: hidden;
          background: #fff;
          border-radius: 0;
          box-shadow: none;
        }
        .admin-login-footer {
          margin-top: 20px;
          padding: 0 16px;
          text-align: center;
          font-size: 13px;
          color: #5a6a7e;
        }
        @media (min-width: 640px) {
          .admin-login-page {
            align-items: center;
            padding: 40px 16px;
          }
          .admin-login-card {
            border-radius: 20px;
            box-shadow: 0 20px 25px -5px rgba(15, 42, 68, 0.1), 0 8px 10px -6px rgba(15, 42, 68, 0.08);
          }
          .admin-login-footer {
            padding: 0;
          }
        }
      `}</style>

      <div className="admin-login-page">
        <div className="admin-login-inner">
          <div className="admin-login-card">
            <div
              style={{
                position: 'relative',
                padding: '26px 26px 22px',
                background: '#0f2a44',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: 'linear-gradient(90deg, #2f80ed, #f2994a, #2f80ed)',
                }}
              />
              <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 17, fontWeight: 800 }}>
                <span style={{ color: '#fff' }}>Houz</span>
                <span style={{ color: '#f2994a' }}>next</span>
                <span style={{ marginLeft: 4, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>Infra</span>
              </div>
              <h1
                style={{
                  marginTop: 8,
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: 15,
                  fontWeight: 700,
                  color: '#fff',
                }}
              >
                Admin login
              </h1>
              <p style={{ fontSize: 12, lineHeight: 1.5, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                Sign in with your Houznext Infra admin account.
              </p>
            </div>

            <div style={{ padding: '22px 26px 26px' }}>
              <div
                style={{
                  display: 'inline-block',
                  marginBottom: 18,
                  background: '#e8f1fd',
                  color: '#2f80ed',
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '3px 12px',
                  borderRadius: 20,
                  letterSpacing: '0.1em',
                  fontFamily: 'Montserrat, sans-serif',
                  textTransform: 'uppercase',
                }}
              >
                Admin portal
              </div>

              {error ? (
                <div
                  style={{
                    marginBottom: 12,
                    borderRadius: 8,
                    border: '1px solid #fca5a5',
                    background: '#fff1f2',
                    padding: '9px 12px',
                    fontSize: 12,
                    color: '#dc2626',
                  }}
                >
                  {error}
                </div>
              ) : null}

              <form onSubmit={handleSubmit}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 5,
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#5a6a7e',
                  }}
                >
                  Email address
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@infra.houznext.com"
                  style={{
                    width: '100%',
                    marginBottom: 12,
                    borderRadius: 9,
                    border: '1px solid #dde8f5',
                    padding: '10px 12px',
                    fontSize: 14,
                    color: '#1f2933',
                    outline: 'none',
                    fontFamily: 'Inter, sans-serif',
                  }}
                />

                <label
                  style={{
                    display: 'block',
                    marginBottom: 5,
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#5a6a7e',
                  }}
                >
                  Password
                </label>
                <div style={{ position: 'relative', marginBottom: 8 }}>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={{
                      width: '100%',
                      borderRadius: 9,
                      border: '1px solid #dde8f5',
                      padding: '10px 40px 10px 12px',
                      fontSize: 14,
                      color: '#1f2933',
                      outline: 'none',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94a3b8',
                      display: 'flex',
                      padding: 4,
                    }}
                  >
                    {showPwd ? <EyeOff size={16} strokeWidth={1.8} /> : <Eye size={16} strokeWidth={1.8} />}
                  </button>
                </div>
                <p style={{ marginBottom: 16, fontSize: 11, color: '#5a6a7e' }}>
                  Use the credentials issued by your Houznext Infra administrator.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    borderRadius: 10,
                    border: 'none',
                    padding: '12px 16px',
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#fff',
                    background: loading ? '#93c5fd' : '#2f80ed',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.85 : 1,
                  }}
                >
                  {loading ? 'Signing in…' : 'Sign in →'}
                </button>
              </form>
            </div>
          </div>

          <p className="admin-login-footer">
            <a
              href="https://infra.houznext.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontWeight: 600, color: '#2f80ed', textDecoration: 'none' }}
            >
              Back to Houznext Infra
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
