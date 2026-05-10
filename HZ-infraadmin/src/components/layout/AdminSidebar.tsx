import { useRouter } from 'next/router';
import Link from 'next/link';

const NAV_ITEMS = [
  {
    section: 'Overview',
    items: [
      { href: '/listings', label: 'All listings', icon: '🏠' },
      { href: '/pending', label: 'Pending approval', icon: '⏳', badge: '48' },
    ],
  },
  {
    section: 'Leads',
    items: [
      { href: '/crm', label: 'CRM leads', icon: '💬', badge: '24 new' },
      { href: '/site-visits', label: 'Site visits', icon: '📅', badge: '8 today' },
    ],
  },
  {
    section: 'Content',
    items: [
      { href: '/projects', label: 'Projects', icon: '🏗️' },
      { href: '/rera-docs', label: 'RERA & docs', icon: '📄' },
      { href: '/developer-submissions', label: 'Developer submissions', icon: '👷', badge: '3 new' },
      { href: '/hero-cms', label: 'Hero image CMS', icon: '🖼️' },
    ],
  },
  {
    section: 'System',
    items: [{ href: '/settings', label: 'Settings', icon: '⚙️' }],
  },
];

export default function AdminSidebar() {
  const router = useRouter();
  const currentPath = '/' + router.pathname.split('/')[1];

  return (
    <div
      style={{
        background: '#0f2a44',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid rgba(255,255,255,.07)',
          height: '54px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '16px',
            fontWeight: 800,
            color: '#fff',
          }}
        >
          Houznext <span style={{ color: '#f2994a' }}>Infra</span>
        </span>
        <span
          style={{
            fontSize: '8px',
            fontWeight: 700,
            padding: '2px 7px',
            borderRadius: '4px',
            background: '#2f80ed',
            color: '#fff',
            fontFamily: "'Montserrat', sans-serif",
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Admin
        </span>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {NAV_ITEMS.map((group) => (
          <div key={group.section}>
            <div
              style={{
                padding: '12px 13px 4px',
                fontSize: '9.5px',
                fontWeight: 700,
                color: 'rgba(255,255,255,.28)',
                textTransform: 'uppercase',
                letterSpacing: '0.09em',
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              {group.section}
            </div>
            {group.items.map((item) => {
              const isActive = currentPath === item.href || router.pathname === item.href;
              return (
                <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '9px',
                      padding: isActive ? '9px 11px 9px 11px' : '9px 13px',
                      borderRadius: '10px',
                      margin: '1px 7px',
                      cursor: 'pointer',
                      background: isActive ? 'rgba(47,128,237,.2)' : 'transparent',
                      borderLeft: isActive ? '2px solid #2f80ed' : '2px solid transparent',
                      color: isActive ? '#fff' : 'rgba(255,255,255,.58)',
                      fontSize: '12.5px',
                      fontWeight: 500,
                      fontFamily: "'Inter', sans-serif",
                      transition: 'all .14s',
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && (
                      <span
                        style={{
                          fontSize: '9.5px',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: '20px',
                          background: 'rgba(242,153,74,.18)',
                          color: '#f2994a',
                          fontFamily: "'Montserrat', sans-serif",
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </div>
  );
}
