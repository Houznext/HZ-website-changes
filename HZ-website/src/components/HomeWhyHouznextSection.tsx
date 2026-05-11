import { useState, type ComponentType } from 'react'
import EyebrowLabel from '@/components/ui/EyebrowLabel'
import Reveal from '@/components/ui/Reveal'
import {
  AnimatedIconBox,
  IconCheckCircle,
  IconTool,
  IconClock,
  IconCreditCard,
  IconSmartphone,
  IconShield,
} from '@/components/ui/Icons'

interface WhyDef {
  title: string
  desc: string
  Icon: ComponentType<{ size?: number; stroke?: string; strokeWidth?: number }>
  color: string
}

/** Same six points as About us → Built on trust — in writing; used on homepage & interiors. */
const WHY: WhyDef[] = [
  {
    Icon: IconCheckCircle,
    color: '#2f80ed',
    title: 'Complete transparency',
    desc: 'Your quote is your final invoice. Every material brand, quantity and cost is documented in your BOQ and visible in your LiveBuild portal.',
  },
  {
    Icon: IconTool,
    color: '#2f80ed',
    title: '40-point quality process',
    desc: 'Every interior project goes through 40+ documented quality checks — from plywood ISI mark verification to shutter alignment to final punch list.',
  },
  {
    Icon: IconClock,
    color: '#f2994a',
    title: 'On-time delivery',
    desc: 'We commit to delivery timelines in writing. Average project completes in 45 days. Delays are tracked, explained and accounted for — never hidden.',
  },
  {
    Icon: IconCreditCard,
    color: '#f2994a',
    title: 'Milestone-based payments',
    desc: '4-stage payments linked to actual site progress. Pay as work gets done — not upfront. Zero-cost EMI available through partner banks and NBFCs.',
  },
  {
    Icon: IconSmartphone,
    color: '#2f80ed',
    title: 'Always reachable',
    desc: 'Your assigned designer responds in under 2 hours. Your site supervisor updates you daily on LiveBuild. We are always one WhatsApp away.',
  },
  {
    Icon: IconShield,
    color: '#2f80ed',
    title: '10-year warranty',
    desc: 'All workmanship is covered for 10 years. Material warranties from Greenply, Hettich, Jaquar, Saint-Gobain — all documented and stored in your portal forever.',
  },
]

function WhyCard({ item }: { item: WhyDef }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className="p-6 rounded-2xl border cursor-default transition-all duration-300"
      style={{
        borderColor: hovered ? item.color : '#dde8f5',
        background: '#fff',
        boxShadow: hovered ? `0 8px 30px ${item.color}18` : 'none',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AnimatedIconBox color={item.color} size="md" hovered={hovered} className="mb-4">
        <item.Icon size={20} strokeWidth={1.7} />
      </AnimatedIconBox>
      <h3 className="font-head font-bold text-[15px] text-charcoal mb-2">{item.title}</h3>
      <p className="text-[13px] leading-relaxed" style={{ color: '#5a6a7e' }}>{item.desc}</p>
    </div>
  )
}

export default function HomeWhyHouznextSection({
  eyebrow,
  heading,
}: {
  eyebrow: string
  heading: string
}) {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <Reveal variant="fade" className="text-center mb-12">
          <EyebrowLabel className="justify-center mb-3">{eyebrow}</EyebrowLabel>
          <h2 className="font-head font-bold text-[28px] md:text-[36px] text-charcoal">{heading}</h2>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {WHY.map((w, i) => (
            <Reveal key={w.title} delay={i * 90}>
              <WhyCard item={w} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
