import { useEffect, useState } from 'react';
import withLivebuildLayout from '@/src/common/LivebuildAdminLayout';
import livebuildApi from '@/src/livebuild/lib/api';
import type { LbTeamMember } from '@/src/livebuild/lib/types';
import { Btn, LiveBuildPageHeader, Toggle, lbToast } from '@/src/livebuild/components';
import { useLbStickyTop } from '@/src/livebuild/hooks/useLbStickyTop';
import Loader from '@/src/common/Loader';

type SettingsSection = 'team' | 'notifications' | 'branding';

const NOTIFICATION_TOGGLES = [
  { id: 'dpr', label: 'DPR submitted', desc: 'When site manager submits daily progress' },
  { id: 'query', label: 'New customer query', desc: 'Instant alert for open queries' },
  { id: 'payment', label: 'Payment milestone due', desc: '3 days before due date' },
  { id: 'hold', label: 'Room on hold', desc: 'When a room status changes to hold' },
  { id: 'doc', label: 'Document expiring', desc: 'Warranty slips & agreements' },
] as const;

function LiveBuildSettingsPage() {
  useLbStickyTop();
  const [section, setSection] = useState<SettingsSection>('team');
  const [team, setTeam] = useState<LbTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState<Record<string, boolean>>({
    dpr: true,
    query: true,
    payment: true,
    hold: false,
    doc: true,
  });

  useEffect(() => {
    livebuildApi
      .listTeam()
      .then(setTeam)
      .catch((e: any) => {
        lbToast(e?.body?.message || 'Failed to load team', 'err');
        setTeam([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const navItem = (id: SettingsSection, label: string) => (
    <button
      type="button"
      onClick={() => setSection(id)}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '9px 12px',
        borderRadius: 8,
        border: 'none',
        background: section === id ? 'var(--lb-bl)' : 'transparent',
        color: section === id ? 'var(--lb-blue)' : 'var(--lb-mu)',
        fontWeight: section === id ? 600 : 400,
        fontSize: 12.5,
        fontFamily: 'var(--lb-m)',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="lb-page">
      <LiveBuildPageHeader title="Settings" subtitle="Team, notifications & branding" />
      <div className="lb-content">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '220px 1fr',
            gap: 18,
            alignItems: 'start',
          }}
        >
          <div className="lb-card" style={{ padding: 8 }}>
            {navItem('team', 'Team members')}
            {navItem('notifications', 'Notifications')}
            {navItem('branding', 'Branding')}
          </div>

          {section === 'team' && (
            <div className="lb-card">
              <div
                style={{
                  fontFamily: 'var(--lb-m)',
                  fontSize: 14,
                  fontWeight: 700,
                  marginBottom: 16,
                }}
              >
                Team members
              </div>
              {loading ? (
                <div className="lb-loading">
                  <Loader />
                </div>
              ) : (
                team.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 0',
                      borderBottom: '0.5px solid #f1f5f9',
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: 'var(--lb-blue)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: 'var(--lb-m)',
                      }}
                    >
                      {t.initials ||
                        t.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--lb-mu)' }}>{t.role}</div>
                    </div>
                  </div>
                ))
              )}
              {!loading && team.length === 0 ? (
                <div className="lb-empty">No team members</div>
              ) : null}
              <Btn
                variant="ghost"
                size="sm"
                style={{ marginTop: 12 }}
                onClick={() => lbToast('Add team member — connect HR module', 'info')}
              >
                + Add member
              </Btn>
            </div>
          )}

          {section === 'notifications' && (
            <div className="lb-card">
              <div
                style={{
                  fontFamily: 'var(--lb-m)',
                  fontSize: 14,
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                Notification preferences
              </div>
              <div style={{ fontSize: 12, color: 'var(--lb-mu)', marginBottom: 16 }}>
                Email & in-app alerts for LiveBuild events (saved locally until API is wired).
              </div>
              {NOTIFICATION_TOGGLES.map((n) => (
                <div
                  key={n.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: '0.5px solid #f1f5f9',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{n.label}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--lb-mu)' }}>{n.desc}</div>
                  </div>
                  <Toggle
                    on={!!notif[n.id]}
                    onChange={() => {
                      setNotif((prev) => {
                        const next = { ...prev, [n.id]: !prev[n.id] };
                        lbToast(`${n.label} ${next[n.id] ? 'enabled' : 'disabled'}`, 'ok');
                        return next;
                      });
                    }}
                    aria-label={n.label}
                  />
                </div>
              ))}
            </div>
          )}

          {section === 'branding' && (
            <div className="lb-card">
              <div
                style={{
                  fontFamily: 'var(--lb-m)',
                  fontSize: 14,
                  fontWeight: 700,
                  marginBottom: 12,
                }}
              >
                Branding
              </div>
              <div className="lb-empty" style={{ textAlign: 'left' }}>
                Logo and customer portal colours — configure in Houznext site settings when
                available.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withLivebuildLayout(LiveBuildSettingsPage);
