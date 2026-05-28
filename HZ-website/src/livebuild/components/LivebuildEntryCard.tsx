import { useRouter } from 'next/router';
import { ChevronRight, Home, Monitor } from 'lucide-react';
import LiveDot from './LiveDot';
import { lbIconProps } from './icons';
import type { LbAccountStats } from '../lib/types';

type Props = {
  stats?: LbAccountStats | null;
  loading?: boolean;
  hasMobile?: boolean;
  isLoggedIn?: boolean;
  onEnter?: () => void;
};

export default function LivebuildEntryCard({
  stats,
  loading,
  hasMobile = true,
  isLoggedIn = true,
  onEnter,
}: Props) {
  const router = useRouter();
  const active = stats?.activeProjects ?? 0;
  const noProject = !loading && (stats?.activeProjects ?? 0) === 0 && (stats?.totalProjects ?? 0) === 0;

  const enter = () => {
    if (onEnter) {
      onEnter();
      return;
    }
    if (!isLoggedIn) {
      void router.push('/login?callbackUrl=/livebuild/dashboard');
      return;
    }
    if (!hasMobile) {
      void router.push('/my-account');
      return;
    }
    void router.push('/livebuild/dashboard');
  };

  return (
    <div style={{ marginBottom: 22 }}>
      <div
        style={{
          fontFamily: 'var(--m)',
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--ch)',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Monitor size={16} {...lbIconProps({ color: 'var(--blue)' })} />
        My Services
      </div>
      <button type="button" className="lb-entry" onClick={() => enter()}>
        <div
          style={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: 'rgba(47,128,237,.08)',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(255,255,255,.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Home size={22} {...lbIconProps({ color: '#fff' })} />
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontFamily: 'var(--m)', fontSize: 16, fontWeight: 800, color: '#fff' }}>
                LiveBuild
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>
                Real-time construction tracker
              </div>
            </div>
            <ChevronRight size={20} {...lbIconProps({ color: 'rgba(255,255,255,.5)' })} />
          </div>

          {noProject ? (
            <p
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,.75)',
                margin: '0 0 12px',
                lineHeight: 1.5,
              }}
            >
              No active project linked to your account. Contact your Houznext project manager to
              link your mobile number.
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              <div style={{ background: 'rgba(255,255,255,.1)', borderRadius: 10, padding: 12 }}>
                <div
                  style={{
                    fontSize: 10,
                    color: 'rgba(255,255,255,.5)',
                    fontFamily: 'var(--m)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '.07em',
                    marginBottom: 4,
                  }}
                >
                  Active
                </div>
                <div style={{ fontFamily: 'var(--m)', fontSize: 18, fontWeight: 800, color: '#fff' }}>
                  {loading ? '—' : active}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
                  <LiveDot color="var(--accent)" />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,.6)' }}>
                    Projects in progress
                  </span>
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,.1)', borderRadius: 10, padding: 12 }}>
                <div
                  style={{
                    fontSize: 10,
                    color: 'rgba(255,255,255,.5)',
                    fontFamily: 'var(--m)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '.07em',
                    marginBottom: 4,
                  }}
                >
                  Latest update
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.8)', fontWeight: 600, lineHeight: 1.4 }}>
                  {stats?.latestUpdate?.text ?? 'No updates yet'}
                </div>
                {stats?.latestUpdate?.at && (
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 4 }}>
                    {new Date(stats.latestUpdate.at).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {isLoggedIn && hasMobile && !noProject && (
            <span className="btn btn-blue btn-sm" style={{ display: 'inline-flex' }}>
              Open LiveBuild
            </span>
          )}
        </div>
      </button>
    </div>
  );
}
