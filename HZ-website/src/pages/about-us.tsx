import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import type { GetStaticProps } from 'next'
import EyebrowLabel from '@/components/ui/EyebrowLabel'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import Reveal from '@/components/ui/Reveal'
import SeoHead from '@/components/SeoHead'
import { useQuoteModal } from '@/components/QuoteModal'

// ----- CMS types -----
interface CmsTeamMember {
  id: string
  name: string
  role: string
  city: string
  photoUrl: string
  visible: boolean
}
interface CmsStatItem {
  id: string
  value: string
  label: string
}
interface CmsTrustItem {
  id: string
  label: string
}
interface CmsStory {
  eyebrow: string
  heading: string
  paragraph1: string
  paragraph2: string
  bullets: string
  ctaLabel: string
  ctaLink: string
  imageUrl: string
}
interface CmsSeo {
  metaTitle: string
  metaDescription: string
  canonical: string
  ogImageUrl: string
  h1: string
}
interface CmsPageSettings {
  showHero: boolean
  showStory: boolean
  showValues: boolean
  showProcess: boolean
  showTeam: boolean
  showTrust: boolean
}
interface AboutUsCms {
  story?: Partial<CmsStory>
  team?: CmsTeamMember[]
  stats?: CmsStatItem[]
  trust?: CmsTrustItem[]
  pageSettings?: Partial<CmsPageSettings>
  seo?: Partial<CmsSeo>
}

const FALLBACK_STORY: CmsStory = {
  eyebrow: 'Why we exist',
  heading: 'We built Houznext because home interiors in India were broken.',
  paragraph1:
    "Most homeowners in Hyderabad had the same painful experience — contractors who vanished mid-project, costs that doubled by handover, no way to know what was happening on their site.",
  paragraph2:
    "We founded Houznext to fix that. Fixed pricing from day one. Photorealistic 3D designs before a single nail is hammered. And LiveBuild — our proprietary tracking system that sends you daily site photos so you always know exactly what's happening at your home.",
  bullets:
    "Founded in Hyderabad, built for Telangana homeowners\n500+ projects delivered across 3 cities with zero cost overruns\nRERA registered · ISO 9001:2015 · 10-year workmanship warranty",
  ctaLabel: 'Our process →',
  ctaLink: '/about-us#process',
  imageUrl: '',
}

const FALLBACK_TEAM: CmsTeamMember[] = [
  { id: 't1', name: 'Arjun Sharma', role: 'Lead Interior Designer', city: 'Hyderabad', photoUrl: '', visible: true },
  { id: 't2', name: 'Priya Reddy', role: 'Senior Designer', city: 'Hyderabad', photoUrl: '', visible: true },
  { id: 't3', name: 'Mohammed Ali', role: 'Project Manager', city: 'Warangal', photoUrl: '', visible: true },
  { id: 't4', name: 'Kavitha Nair', role: '3D Visualiser', city: 'Hyderabad', photoUrl: '', visible: true },
  { id: 't5', name: 'Ramesh Babu', role: 'Site Supervisor', city: 'Karimnagar', photoUrl: '', visible: true },
  { id: 't6', name: 'Sunita Verma', role: 'Customer Relations', city: 'Hyderabad', photoUrl: '', visible: true },
]

const FALLBACK_STATS: CmsStatItem[] = [
  { id: 's1', value: '500+', label: 'Homes delivered' },
  { id: 's2', value: '4.8★', label: 'Customer rating' },
  { id: 's3', value: '45d', label: 'Avg. delivery' },
  { id: 's4', value: '3+', label: 'Cities active' },
  { id: 's5', value: '10yr', label: 'Workmanship warranty' },
]

const FALLBACK_TRUST: CmsTrustItem[] = [
  { id: 'tr1', label: 'RERA Registered' },
  { id: 'tr2', label: 'ISO 9001:2015' },
  { id: 'tr3', label: '4.8★ Average rating' },
  { id: 'tr4', label: '45-day avg. delivery' },
  { id: 'tr5', label: 'Zero-cost EMI' },
]

const FALLBACK_SETTINGS: CmsPageSettings = {
  showHero: true,
  showStory: true,
  showValues: true,
  showProcess: true,
  showTeam: true,
  showTrust: true,
}

const FALLBACK_SEO: CmsSeo = {
  metaTitle: 'About Houznext | Interior Design Company in Hyderabad & Telangana',
  metaDescription:
    "Houznext is Telangana's leading fixed-price home interior design company. 500+ homes delivered with 45-day delivery guarantee, real-time LiveBuild tracking and 10-year warranty. Meet our team.",
  canonical: '/about-us',
  ogImageUrl: '',
  h1: 'Building homes. Building trust.',
}

function trustIconFor(label: string) {
  const l = label.toLowerCase()
  if (l.includes('rera')) {
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2f80ed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    )
  }
  if (l.includes('iso')) {
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2f80ed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    )
  }
  if (l.includes('rating') || l.includes('★') || l.includes('4.8')) {
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2f80ed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    )
  }
  if (l.includes('delivery') || l.includes('45') || l.includes('day')) {
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2f80ed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    )
  }
  if (l.includes('emi') || l.includes('cost')) {
    return (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2f80ed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    )
  }
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2f80ed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function HeroSection({
  stats,
  seo,
  openModal,
  router,
}: {
  stats: CmsStatItem[]
  seo: CmsSeo
  openModal: () => void
  router: ReturnType<typeof useRouter>
}) {
  return (
    <section
      style={{
        background: '#0f2a44',
        padding: '72px 24px 80px',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
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
      <Reveal variant="fade">
        <div className="mb-3 flex justify-center [&>span:first-child]:bg-[#f2994a] [&>span:nth-child(2)]:!text-[#f2994a]">
          <EyebrowLabel>Our story</EyebrowLabel>
        </div>
        <h1
          className="font-head font-black text-white mx-auto"
          style={{ fontSize: 'clamp(28px,4vw,48px)', lineHeight: 1.08, marginBottom: 14, maxWidth: 680 }}
        >
          {seo.h1}
        </h1>
        <p
          style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.65)',
            maxWidth: 560,
            margin: '0 auto 36px',
            lineHeight: 1.7,
          }}
        >
          Houznext is Telangana&apos;s end-to-end home interior company. Fixed prices. Photorealistic 3D designs. Real-time
          site tracking through LiveBuild. Everything under one roof — built around you.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={openModal}
            className="font-head font-bold"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '12px 26px',
              borderRadius: 10,
              background: '#2f80ed',
              color: '#fff',
              fontSize: 14,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#1a6dd6'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#2f80ed'
            }}
          >
            Get free consultation →
          </button>
          <button
            type="button"
            onClick={() => void router.push('/projects')}
            className="font-head font-bold"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '11px 24px',
              borderRadius: 10,
              background: 'transparent',
              color: '#fff',
              fontSize: 14,
              border: '1.5px solid rgba(255,255,255,0.3)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#fff'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.3)'
            }}
          >
            View our projects
          </button>
        </div>
      </Reveal>
      <Reveal variant="up" delay={150}>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', marginTop: 40 }}>
          {stats.map((s, i) => (
            <div
              key={s.id}
              style={{
                padding: '0 28px',
                textAlign: 'center',
                borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.15)' : 'none',
              }}
            >
              <div className="font-head font-black text-white" style={{ fontSize: 30, lineHeight: 1 }}>
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.55)',
                  marginTop: 4,
                  fontWeight: 500,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}

function StorySection({ story, router }: { story: CmsStory; router: ReturnType<typeof useRouter> }) {
  const goCta = () => {
    if (story.ctaLink.startsWith('http')) {
      if (typeof window !== 'undefined') window.open(story.ctaLink, '_blank', 'noopener,noreferrer')
    } else {
      void router.push(story.ctaLink)
    }
  }
  return (
    <section style={{ background: '#fff', padding: '72px 24px' }}>
      <Reveal variant="up" delay={100}>
      <div className="mx-auto grid max-w-[1100px] grid-cols-1 items-center gap-[52px] md:grid-cols-2">
        <div>
          {story.imageUrl ? (
            <div style={{ borderRadius: 16, overflow: 'hidden', height: 380 }}>
              <img src={story.imageUrl} alt="Houznext story" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ) : (
            <div
              style={{
                borderRadius: 16,
                height: 380,
                background: 'linear-gradient(135deg,#1a3a5c,#0f2a44)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 12,
                border: '2px dashed rgba(255,255,255,0.15)',
              }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>Founder / office photo</span>
            </div>
          )}
        </div>
        <div>
          <EyebrowLabel className="mb-3">{story.eyebrow}</EyebrowLabel>
          <h2
            className="font-head"
            style={{ fontSize: 28, fontWeight: 800, color: '#1f2933', marginBottom: 16, lineHeight: 1.2 }}
          >
            {story.heading}
          </h2>
          <p style={{ fontSize: 15, color: '#5a6a7e', lineHeight: 1.75, marginBottom: 14 }}>{story.paragraph1}</p>
          <p style={{ fontSize: 15, color: '#5a6a7e', lineHeight: 1.75, marginBottom: 18 }}>{story.paragraph2}</p>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {story.bullets
              .split('\n')
              .filter(Boolean)
              .map((line, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: '#1f2933', marginBottom: 10 }}>
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: '#e8f1fd',
                      border: '2px solid #2f80ed',
                      flexShrink: 0,
                      marginTop: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2f80ed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                  <span>{line}</span>
                </li>
              ))}
          </ul>
          <button
            type="button"
            onClick={goCta}
            className="font-head font-bold"
            style={{
              marginTop: 4,
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: 12,
              padding: '10px 18px',
              borderRadius: 8,
              background: '#2f80ed',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#1a6dd6'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#2f80ed'
            }}
          >
            {story.ctaLabel}
          </button>
        </div>
      </div>
      </Reveal>
    </section>
  )
}

const VALUE_CARDS: {
  icon: React.ReactNode
  title: string
  body: string
}[] = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Complete transparency',
    body: 'Your quote is your final invoice. Every material brand, quantity and cost is documented in your BOQ and visible in your LiveBuild portal.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11H5a2 2 0 00-2 2v6a2 2 0 002 2h2" />
        <path d="M15 7h4a2 2 0 012 2v6a2 2 0 01-2 2h-2" />
        <rect x="3" y="3" width="6" height="6" rx="1" />
        <rect x="15" y="3" width="6" height="6" rx="1" />
      </svg>
    ),
    title: '40-point quality process',
    body: 'Every interior project goes through 40+ documented quality checks — from plywood ISI mark verification to shutter alignment to final punch list.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    title: 'On-time delivery',
    body: 'We commit to delivery timelines in writing. Average project completes in 45 days. Delays are tracked, explained and accounted for — never hidden.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    title: 'Milestone-based payments',
    body: '4-stage payments linked to actual site progress. Pay as work gets done — not upfront. Zero-cost EMI available through partner banks and NBFCs.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.07-8.67A2 2 0 004.11 2h3a2 2 0 012 1.72 12.8 12.8 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.8 12.8 0 002.81.7A2 2 0 0022 16.92z" />
      </svg>
    ),
    title: 'Always reachable',
    body: 'Your assigned designer responds in under 2 hours. Your site supervisor updates you daily on LiveBuild. We are always one WhatsApp away.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    title: '10-year warranty',
    body: 'All workmanship is covered for 10 years. Material warranties from Greenply, Hettich, Jaquar, Saint-Gobain — all documented and stored in your portal forever.',
  },
]

function ValuesSection() {
  return (
    <section style={{ background: '#f5f7fa', padding: '72px 24px' }}>
      <Reveal variant="up" delay={150}>
      <div className="mb-[52px] text-center">
        <EyebrowLabel className="mb-3 justify-center">How we operate</EyebrowLabel>
        <h2 className="font-head" style={{ fontSize: 28, fontWeight: 800, color: '#1f2933' }}>
          Built on trust &mdash; in writing.
        </h2>
        <p className="mx-auto mt-3 max-w-[640px] text-[15px]" style={{ color: '#5a6a7e' }}>
          Every promise is documented, every milestone is visible, and you stay in control from day one.
        </p>
      </div>
      <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
        {VALUE_CARDS.map((c) => (
          <div
            key={c.title}
            className="group cursor-default transition-all duration-300"
            style={{
              background: '#fff',
              border: '1.5px solid #dde8f5',
              borderRadius: 16,
              padding: 24,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#93c5fd'
              e.currentTarget.style.transform = 'translateY(-5px)'
              e.currentTarget.style.boxShadow = '0 12px 36px rgba(15,42,68,0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#dde8f5'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div
              className="mb-3.5 flex h-12 w-12 items-center justify-center text-[#2f80ed] transition-colors duration-250 group-hover:bg-[#2f80ed] group-hover:text-white"
              style={{ borderRadius: 12, background: '#e8f1fd' }}
            >
              <span className="[&>svg]:stroke-current">{c.icon}</span>
            </div>
            <h3 className="font-head" style={{ fontSize: 15, fontWeight: 700, color: '#1f2933', marginBottom: 7 }}>
              {c.title}
            </h3>
            <p style={{ fontSize: 13, color: '#5a6a7e', lineHeight: 1.65 }}>{c.body}</p>
          </div>
        ))}
      </div>
      </Reveal>
    </section>
  )
}

const STEPS: { t: string; d: string }[] = [
  { t: 'Consultation', d: 'Free call · budget discussion · site visit' },
  { t: '3D Design', d: 'Photorealistic renders · free revisions' },
  { t: 'Approval', d: 'Approve online · BOQ finalised' },
  { t: 'Execution', d: 'Daily LiveBuild site updates' },
  { t: 'Handover', d: 'Keys + 10-year warranty certificate' },
]

function ProcessSection() {
  return (
    <section style={{ background: '#0f2a44', padding: '60px 24px' }}>
      <Reveal variant="fade" delay={100}>
      <div className="mb-0 text-center">
        <p
          className="font-head font-bold"
          style={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 2, fontSize: 11, marginBottom: 8 }}
        >
          The process
        </p>
        <h2 className="font-head font-black" style={{ color: '#fff', fontSize: 'clamp(22px,3vw,32px)' }}>
          From first call to dream home in 5 steps.
        </h2>
      </div>
      <div
        className="mx-auto mt-8 flex max-w-[900px] flex-wrap justify-center"
        style={{ marginTop: 32, gap: 8, rowGap: 24 }}
      >
        {STEPS.map((step, i) => (
          <div
            key={step.t}
            className="group relative"
            style={{ flex: '1 1 100px', minWidth: 100, textAlign: 'center', maxWidth: 200, cursor: 'default' }}
          >
            {i < STEPS.length - 1 ? (
              <div
                className="pointer-events-none hidden md:block"
                style={{
                  position: 'absolute',
                  top: 19,
                  left: '50%',
                  right: '-50%',
                  height: 2,
                  background: 'rgba(255,255,255,0.15)',
                  zIndex: 0,
                }}
              />
            ) : null}
            <div
              className="group mx-auto mb-2.5 flex h-[38px] w-[38px] items-center justify-center rounded-full font-head text-sm font-extrabold text-white transition-all duration-300"
              style={{
                position: 'relative',
                zIndex: 1,
                background: 'rgba(47,128,237,0.25)',
                border: '2px solid rgba(47,128,237,0.5)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2f80ed'
                e.currentTarget.style.borderColor = '#2f80ed'
                e.currentTarget.style.boxShadow = '0 0 0 6px rgba(47,128,237,0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(47,128,237,0.25)'
                e.currentTarget.style.borderColor = 'rgba(47,128,237,0.5)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {i + 1}
            </div>
            <p className="font-head" style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
              {step.t}
            </p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.55, padding: '0 6px' }}>{step.d}</p>
          </div>
        ))}
      </div>
      </Reveal>
    </section>
  )
}

function TeamSection({
  currentTeam,
  teamPage,
  setTeamPage,
  totalPages,
  router,
}: {
  currentTeam: CmsTeamMember[]
  teamPage: number
  setTeamPage: React.Dispatch<React.SetStateAction<number>>
  totalPages: number
  router: ReturnType<typeof useRouter>
}) {
  return (
    <section style={{ background: '#f5f7fa', padding: '80px 24px' }}>
      <Reveal variant="up" delay={120}>
      <div className="mb-12 text-center">
        <EyebrowLabel className="mb-3 justify-center">The people</EyebrowLabel>
        <h2 className="font-head" style={{ color: '#1f2933', fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
          Meet the team behind your home.
        </h2>
        <p className="mx-auto max-w-[640px] text-[15px]" style={{ color: '#5a6a7e' }}>
          Designers, project managers, and site teams — all in-house, all accountable.
        </p>
      </div>
      <div className="relative mx-auto max-w-[1100px]">
        {totalPages > 1 ? (
          <button
            type="button"
            aria-label="Previous team page"
            onClick={() => setTeamPage((p) => Math.max(0, p - 1))}
            className="absolute z-10 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white transition-all duration-200"
            style={{ top: '50%', left: -8, border: '1.5px solid #dde8f5', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#2f80ed'
              e.currentTarget.style.background = '#e8f1fd'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#dde8f5'
              e.currentTarget.style.background = '#fff'
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0f2a44" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        ) : null}
        {totalPages > 1 ? (
          <button
            type="button"
            aria-label="Next team page"
            onClick={() => setTeamPage((p) => Math.min(totalPages - 1, p + 1))}
            className="absolute z-10 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white transition-all duration-200"
            style={{ top: '50%', right: -8, border: '1.5px solid #dde8f5', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#2f80ed'
              e.currentTarget.style.background = '#e8f1fd'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#dde8f5'
              e.currentTarget.style.background = '#fff'
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0f2a44" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        ) : null}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {currentTeam.map((member) => (
            <div
              key={member.id}
              className="text-center transition-all duration-300"
              style={{ background: '#fff', border: '1.5px solid #dde8f5', borderRadius: 16, overflow: 'hidden', cursor: 'pointer' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#93c5fd'
                e.currentTarget.style.transform = 'translateY(-6px)'
                e.currentTarget.style.boxShadow = '0 14px 40px rgba(15,42,68,0.12)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#dde8f5'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div
                className="group relative m-2.5 flex flex-col items-center justify-center transition-all duration-300"
                style={{
                  height: 160,
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: '2px dashed #bfdbfe',
                  background: 'linear-gradient(135deg,#e8f1fd,#dde8f5)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg,#dbeafe,#e8f1fd)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg,#e8f1fd,#dde8f5)'
                }}
              >
                {member.photoUrl ? (
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }}
                  />
                ) : (
                  <>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2f80ed" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span style={{ fontSize: 9, color: '#5a6a7e', fontWeight: 500 }}>Photo</span>
                  </>
                )}
              </div>
              <div style={{ padding: '10px 10px 14px' }}>
                <p className="font-head" style={{ fontSize: 13, fontWeight: 700, color: '#1f2933', marginBottom: 3 }}>
                  {member.name}
                </p>
                <p style={{ fontSize: 11, color: '#5a6a7e', marginBottom: 6, fontWeight: 500 }}>{member.role}</p>
                <span
                  className="font-head"
                  style={{
                    display: 'inline-flex',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 20,
                    background: '#e8f1fd',
                    color: '#2f80ed',
                  }}
                >
                  {member.city}
                </span>
              </div>
            </div>
          ))}
        </div>
        {totalPages > 1 ? (
          <div className="mt-5 flex justify-center" style={{ gap: 6 }}>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                type="button"
                key={i}
                aria-label={`Page ${i + 1}`}
                onClick={() => setTeamPage(i)}
                className="cursor-pointer border-0 p-0 transition-all duration-200"
                style={{
                  height: 8,
                  width: i === teamPage ? 24 : 8,
                  borderRadius: 4,
                  background: i === teamPage ? '#2f80ed' : '#d1e0f2',
                }}
              />
            ))}
          </div>
        ) : null}
        <div className="mt-7 text-center">
          <button
            type="button"
            onClick={() => void router.push('/careers')}
            className="font-head"
            style={{
              display: 'inline-block',
              marginTop: 8,
              fontSize: 14,
              fontWeight: 700,
              color: '#2f80ed',
              background: 'transparent',
              border: '2px solid #2f80ed',
              borderRadius: 8,
              padding: '10px 22px',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#2f80ed'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#fff'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#2f80ed'
            }}
          >
            Join our team →
          </button>
        </div>
      </div>
      </Reveal>
    </section>
  )
}

function TrustSection({ trust }: { trust: CmsTrustItem[] }) {
  return (
    <div
      style={{
        background: '#fff',
        padding: '36px 24px',
        borderTop: '1px solid #dde8f5',
        borderBottom: '1px solid #dde8f5',
      }}
    >
      <Reveal variant="fade" delay={80}>
      <div
        className="mx-auto flex max-w-[800px] flex-wrap items-center justify-center"
        style={{ gap: 36, rowGap: 20 }}
      >
        {trust.map((t) => (
          <div key={t.id} className="flex items-center" style={{ gap: 10, fontSize: 13, fontWeight: 600, color: '#1f2933' }}>
            <div
              className="flex flex-shrink-0 items-center justify-center"
              style={{ width: 36, height: 36, borderRadius: 8, background: '#e8f1fd' }}
            >
              {trustIconFor(t.label)}
            </div>
            <span>{t.label}</span>
          </div>
        ))}
      </div>
      </Reveal>
    </div>
  )
}

function CtaSection({ openModal }: { openModal: () => void }) {
  return (
    <section style={{ background: '#0f2a44', padding: '72px 24px', textAlign: 'center' }}>
      <Reveal variant="up" delay={100}>
      <div className="mb-4 flex justify-center [&>span:first-child]:bg-white/30 [&>span:nth-child(2)]:!text-white/60">
        <EyebrowLabel className="justify-center">Start your journey</EyebrowLabel>
      </div>
      <h2 className="font-head font-extrabold" style={{ color: '#fff', fontSize: 'clamp(22px,3vw,34px)' }}>
        Your dream home is closer than you think.
      </h2>
      <p
        className="mx-auto mb-8"
        style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', maxWidth: 480, marginTop: 16, marginBottom: 32, lineHeight: 1.65 }}
      >
        Free consultation. Free 3D design. Fixed price from day one. No surprises &mdash; ever.
      </p>
      <div className="flex flex-wrap items-center justify-center" style={{ gap: 12 }}>
        <button
          type="button"
          onClick={openModal}
          className="font-head font-bold"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '12px 26px',
            borderRadius: 10,
            background: '#2f80ed',
            color: '#fff',
            fontSize: 14,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#1a6dd6'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = '#2f80ed'
          }}
        >
          Get free consultation →
        </button>
        <a
          href="https://wa.me/919759750770"
          target="_blank"
          rel="noreferrer"
          className="font-head font-bold"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '11px 24px',
            borderRadius: 10,
            background: 'transparent',
            color: '#fff',
            fontSize: 14,
            border: '1.5px solid rgba(255,255,255,0.3)',
            textDecoration: 'none',
            transition: 'all 0.2s',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.123 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Chat on WhatsApp
        </a>
      </div>
      </Reveal>
    </section>
  )
}

export const getStaticProps: GetStaticProps<{ cms: AboutUsCms }> = async () => {
  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
  try {
    const base = String(API).replace(/\/$/, '')
    const res = await fetch(`${base}/site-cms/about_us`)
    if (!res.ok) throw new Error('CMS fetch failed')
    const json = (await res.json()) as { data?: unknown }
    return { props: { cms: (json?.data as AboutUsCms) ?? {} }, revalidate: 60 }
  } catch {
    return { props: { cms: {} }, revalidate: 60 }
  }
}

export default function AboutUsPage({ cms }: { cms: AboutUsCms }) {
  const router = useRouter()
  const { openModal } = useQuoteModal()
  const [teamPage, setTeamPage] = useState(0)

  const story: CmsStory = { ...FALLBACK_STORY, ...(cms?.story ?? {}) }
  const stats: CmsStatItem[] = cms?.stats?.length ? cms.stats : FALLBACK_STATS
  const trust: CmsTrustItem[] = cms?.trust?.length ? cms.trust : FALLBACK_TRUST
  const team: CmsTeamMember[] = cms?.team?.length ? cms.team : FALLBACK_TEAM
  const settings: CmsPageSettings = { ...FALLBACK_SETTINGS, ...(cms?.pageSettings ?? {}) }
  const seo: CmsSeo = { ...FALLBACK_SEO, ...(cms?.seo ?? {}) }

  const visibleMembers = team.filter((m) => m.visible)
  const totalPages = Math.max(1, Math.ceil(visibleMembers.length / 6))
  const safePage = Math.min(teamPage, totalPages - 1)
  const currentTeam = visibleMembers.slice(safePage * 6, (safePage + 1) * 6)

  useEffect(() => {
    setTeamPage((p) => Math.min(p, totalPages - 1))
  }, [totalPages, visibleMembers.length])

  return (
    <>
      <SeoHead
        title={seo.metaTitle}
        description={seo.metaDescription}
        canonical={seo.canonical}
        ogImage={seo.ogImageUrl || undefined}
      />
      <Navbar />
      <main style={{ background: '#f5f7fa' }}>
        {settings.showHero && <HeroSection stats={stats} seo={seo} openModal={openModal} router={router} />}
        {settings.showStory && <StorySection story={story} router={router} />}
        {settings.showValues && <ValuesSection />}
        {settings.showProcess && <ProcessSection />}
        {settings.showTeam && (
          <TeamSection
            currentTeam={currentTeam}
            teamPage={safePage}
            setTeamPage={setTeamPage}
            totalPages={totalPages}
            router={router}
          />
        )}
        {settings.showTrust && <TrustSection trust={trust} />}
        <CtaSection openModal={openModal} />
      </main>
      <Footer />
    </>
  )
}
