import { useState } from 'react';
import Head from 'next/head';
import { saveSession } from '@/lib/session';
import { useInfraPermissionStore } from '@/stores/useInfraPermissionStore';

const BACKEND = process.env.NEXT_PUBLIC_INFRA_API_URL || 'http://localhost:4001';

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

      const data = await res.json();

      if (!res.ok || !data.access_token) {
        setError(data.message || 'Invalid email or password');
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
      <div
        style={{
          minHeight: '100vh',
          background: '#0f2a44',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: 20,
            padding: '40px 36px',
            width: '100%',
            maxWidth: 440,
            boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 26,
                fontWeight: 800,
                color: '#1f2933',
                margin: 0,
              }}
            >
              Houznext <span style={{ color: '#f2994a' }}>Infra</span>
            </h1>
            <div
              style={{
                display: 'inline-block',
                background: '#e8f1fd',
                color: '#2f80ed',
                fontSize: 10,
                fontWeight: 700,
                padding: '3px 12px',
                borderRadius: 20,
                letterSpacing: '0.1em',
                marginTop: 8,
                fontFamily: 'Montserrat, sans-serif',
                textTransform: 'uppercase',
              }}
            >
              Admin Portal
            </div>
            <p style={{ fontSize: 13, color: '#5a6a7e', marginTop: 10, lineHeight: 1.5 }}>
              Sign in with your Infra admin account
            </p>
          </div>

          {error && (
            <div
              style={{
                background: '#fee2e2',
                border: '1px solid #fca5a5',
                borderRadius: 10,
                padding: '10px 14px',
                marginBottom: 16,
                fontSize: 13,
                color: '#dc2626',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#5a6a7e',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  marginBottom: 5,
                  fontFamily: 'Montserrat, sans-serif',
                }}
              >
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@infra.houznext.com"
                style={{
                  width: '100%',
                  padding: '10px 13px',
                  border: '1.5px solid #dde8f5',
                  borderRadius: 9,
                  fontSize: 13,
                  outline: 'none',
                  fontFamily: 'Inter, sans-serif',
                  color: '#1f2933',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2f80ed';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#dde8f5';
                }}
              />
            </div>

            <div style={{ marginBottom: 22, position: 'relative' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#5a6a7e',
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  marginBottom: 5,
                  fontFamily: 'Montserrat, sans-serif',
                }}
              >
                Password
              </label>
              <input
                type={showPwd ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 13px',
                  border: '1.5px solid #dde8f5',
                  borderRadius: 9,
                  fontSize: 13,
                  outline: 'none',
                  fontFamily: 'Inter, sans-serif',
                  color: '#1f2933',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2f80ed';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#dde8f5';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: 34,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: 2,
                }}
              >
                {showPwd ? '🙈' : '👁'}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: 12,
                background: loading ? '#93c5fd' : '#2f80ed',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Montserrat, sans-serif',
                transition: 'background 150ms',
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
