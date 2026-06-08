import { useState } from 'react'
import { useRouter } from 'next/router'
import type { GetStaticProps } from 'next'
import SeoHead from '@/components/SeoHead'
import LoginModal from '@/components/LoginModal'
import { useQuoteModal } from '@/components/QuoteModal'
import {
  IconCamera,
  IconLayers,
  IconCreditCard,
  IconBug,
  IconMessageCircle,
} from '@/components/ui/Icons'
import type { IconProps } from '@/components/ui/Icons'
import { fetchPageSeo, type PageSeoPublic } from '@/lib/fetchPageSeo'

// ─── Feature items for the left panel ────────────────────────────────────────

interface FeatureDef {
  Icon: React.ComponentType<IconProps>
  label: string
  desc: string
  color: string
}

const FEATURES: FeatureDef[] = [
  {
    Icon: IconCamera,
    label: 'Daily site photo updates',
    desc: 'Every room, every day. Never miss a moment of progress.',
    color: '#2f80ed',
  },
  {
    Icon: IconLayers,
    label: 'Approve 3D designs online',
    desc: 'Review photorealistic designs and approve from your phone.',
    color: '#2f80ed',
  },
  {
    Icon: IconCreditCard,
    label: 'Milestone payment tracking',
    desc: 'Pay only when milestones are hit. Fully transparent.',
    color: '#f2994a',
  },
  {
    Icon: IconBug,
    label: 'Raise & track snags',
    desc: 'Log issues with photos, get them resolved and confirmed.',
    color: '#2f80ed',
  },
  {
    Icon: IconMessageCircle,
    label: 'Chat with your designer',
    desc: 'Direct line to your project manager and design team.',
    color: '#2f80ed',
  },
]

function FeatureItem({ item }: { item: FeatureDef }) {
  const [hovered, setHovered] = useState(false)
  return (
    <li
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-default transition-all duration-250"
      style={{
        background: hovered ? `${item.color}15` : 'transparent',
        border: `1px solid ${hovered ? `${item.color}35` : 'transparent'}`,
        transform: hovered ? 'translateX(4px)' : 'translateX(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Icon box */}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-250"
        style={{
          background: hovered ? item.color : `${item.color}20`,
          boxShadow: hovered ? `0 4px 14px ${item.color}50` : 'none',
          transform: hovered ? 'scale(1.1) rotate(-5deg)' : 'scale(1) rotate(0deg)',
        }}
      >
        <item.Icon
          size={17}
          stroke={hovered ? '#fff' : item.color}
          strokeWidth={1.7}
        />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className="text-[13px] font-[600] leading-tight transition-colors duration-200"
          style={{ color: hovered ? '#fff' : 'rgba(255,255,255,0.85)' }}
        >
          {item.label}
        </p>
        <p
          className="text-[11px] mt-0.5 leading-snug transition-all duration-200 overflow-hidden"
          style={{
            color: 'rgba(255,255,255,0.5)',
            maxHeight: hovered ? '2rem' : '0',
            opacity: hovered ? 1 : 0,
          }}
        >
          {item.desc}
        </p>
      </div>

      {/* Arrow indicator */}
      <span
        className="text-[14px] flex-shrink-0 transition-all duration-200"
        style={{
          color: item.color,
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateX(0)' : 'translateX(-6px)',
        }}
      >
        →
      </span>
    </li>
  )
}

export default function LoginPage({ pageSeo }: { pageSeo: PageSeoPublic | null }) {
  const router = useRouter()
  const { openModal } = useQuoteModal()

  return (
    <>
      <SeoHead
        title={pageSeo?.metaTitle ?? 'Login | LiveBuild | Houznext'}
        description={
          pageSeo?.metaDescription ??
          'Login to your Houznext portal. Track your interior project live, approve designs, view payments, and manage snags from your phone.'
        }
        canonical="/login"
        noIndex
        ogImage={pageSeo?.ogImageUrl ?? undefined}
      />
      <div className="min-h-screen flex" style={{ background: '#f5f7fa' }}>
        {/* Left brand panel */}
        <div
          className="hidden md:flex flex-col justify-between p-12 w-[420px] flex-shrink-0"
          style={{ background: '#0f2a44' }}
        >
          <div>
            <button onClick={() => router.push('/')} className="font-head font-extrabold text-[26px] leading-none mb-8">
              <span className="text-white">Houz</span>
              <span style={{ color: '#f2994a' }}>next</span>
            </button>
            <h2 className="font-head font-bold text-[24px] text-white leading-tight mb-3">
              Your home. Live.
            </h2>
            <p className="text-[14px] leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Log in to track your interior project, approve designs, and manage everything
              from your phone.
            </p>
            <ul className="space-y-1">
              {FEATURES.map((f) => (
                <FeatureItem key={f.label} item={f} />
              ))}
            </ul>
          </div>
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            © {new Date().getFullYear()} Houznext. All rights reserved.
          </p>
        </div>

        {/* Right login card */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-[420px]">
            {/* Mobile logo */}
            <button onClick={() => router.push('/')} className="md:hidden font-head font-extrabold text-[22px] leading-none mb-8 block">
              <span style={{ color: '#0f2a44' }}>Houz</span>
              <span style={{ color: '#f2994a' }}>next</span>
            </button>

            <LoginModal
              embedded
              isOpen
              onClose={() => {}}
            />
            <p className="text-center text-[12px] mt-5" style={{ color: '#5a6a7e' }}>
              New customer?{' '}
              <button type="button" onClick={() => openModal('Login page')} className="font-[600]" style={{ color: '#2f80ed' }}>
                Get a free consultation
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps<{ pageSeo: PageSeoPublic | null }> = async () => {
  let pageSeo: PageSeoPublic | null = null
  try {
    pageSeo = await fetchPageSeo('/login')
  } catch {
    pageSeo = null
  }
  return { props: { pageSeo }, revalidate: 300 }
}
