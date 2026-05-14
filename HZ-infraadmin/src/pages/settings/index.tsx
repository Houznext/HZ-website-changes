'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AdminLayout } from '@/components/layout/AdminLayout';
import adminApi from '@/lib/axios';
import { getToken, getUser, saveSession } from '@/lib/session';
import { INFRA_WHATSAPP_DISPLAY, infraBusinessWhatsappE164, infraWhatsAppMeUrl } from '@/lib/infra-public-contact';

export default function SettingsPage() {
  const [tab, setTab] = useState<'profile' | 'security' | 'prefs'>('profile');
  const [me, setMe] = useState<{ firstName?: string; lastName?: string; email?: string; phone?: string; id: string } | null>(
    null,
  );
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '', phone: '' });

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.get('/auth/me');
        setMe(res.data);
        setProfile({
          firstName: res.data.firstName ?? '',
          lastName: res.data.lastName ?? '',
          email: res.data.email ?? '',
          phone: res.data.phone ?? '',
        });
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const saveProfile = async () => {
    if (!me?.id) return;
    try {
      await adminApi.patch(`/infra-users/${me.id}`, profile);
      toast.success('Profile saved');
      const t = getToken();
      const u = getUser();
      if (t && u) {
        const name =
          [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim() || u.username;
        saveSession(t, {
          ...u,
          email: profile.email || u.email,
          name,
        });
      }
    } catch {
      toast.error('Save failed');
    }
  };

  return (
    <AdminLayout title="Settings">
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['profile', 'security', 'prefs'] as const).map((t) => (
          <button key={t} type="button" className={`btn btn-sm ${tab === t ? 'btn-blue' : 'btn-ghost'}`} onClick={() => setTab(t)}>
            {t === 'profile' ? 'Profile' : t === 'security' ? 'Security' : 'Preferences'}
          </button>
        ))}
      </div>
      {tab === 'profile' && (
        <div className="acard" style={{ maxWidth: 480 }}>
          <label className="label">First name</label>
          <input className="fi" value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} />
          <label className="label" style={{ marginTop: 10 }}>
            Last name
          </label>
          <input className="fi" value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} />
          <label className="label" style={{ marginTop: 10 }}>
            Email
          </label>
          <input className="fi" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          <label className="label" style={{ marginTop: 10 }}>
            Phone
          </label>
          <input className="fi" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
          <button type="button" className="btn btn-blue" style={{ marginTop: 14 }} onClick={() => void saveProfile()}>
            Save profile
          </button>
        </div>
      )}
      {tab === 'security' && (
        <div className="acard" style={{ maxWidth: 480 }}>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>Password changes require backend support — placeholders below.</p>
          <label className="label">Current password</label>
          <input className="fi" type="password" value={pwd.current} onChange={(e) => setPwd({ ...pwd, current: e.target.value })} />
          <label className="label" style={{ marginTop: 10 }}>
            New password
          </label>
          <input className="fi" type="password" value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} />
          <label className="label" style={{ marginTop: 10 }}>
            Confirm
          </label>
          <input className="fi" type="password" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} />
          <button type="button" className="btn btn-blue" style={{ marginTop: 14 }} onClick={() => toast('Password API not wired')}>
            Update password
          </button>
        </div>
      )}
      {tab === 'prefs' && (
        <div className="acard" style={{ maxWidth: 480 }}>
          <div className="label">Business WhatsApp (listing enquiries)</div>
          <p style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>{INFRA_WHATSAPP_DISPLAY}</p>
          <p style={{ fontSize: 12, color: 'var(--mu)', marginTop: 6 }}>wa.me link uses E.164 {infraBusinessWhatsappE164()}.</p>
          <a
            href={infraWhatsAppMeUrl('Hi from Infra admin')}
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost btn-sm"
            style={{ marginTop: 12 }}
          >
            Open WhatsApp
          </a>
          <p style={{ fontSize: 11, color: 'var(--mu)', marginTop: 14 }}>
            Override with <code style={{ fontSize: 11 }}>NEXT_PUBLIC_INFRA_WHATSAPP_E164</code> in env (digits only, include country code).
          </p>
        </div>
      )}
    </AdminLayout>
  );
}
