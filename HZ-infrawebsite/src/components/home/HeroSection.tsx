import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchStore, type HeroTab } from '@/store/searchStore';
import { HeroSearch } from '@/components/search/HeroSearch';
import api from '@/lib/axios';

const tabs: HeroTab[] = ['Land', 'Villa', 'Apartment', 'Plot'];

export function HeroSection() {
  const { activeTab, setActiveTab } = useSearchStore();
  const [hero, setHero] = useState<{ heroImageUrl: string | null; heroOpacity: number }>({
    heroImageUrl: null,
    heroOpacity: 18,
  });

  useEffect(() => {
    void (async () => {
      try {
        const res = await api.get('/site-config/hero');
        setHero(res.data);
      } catch {
        /* defaults */
      }
    })();
  }, []);

  const bg = hero.heroImageUrl || 'https://images.unsplash.com/photo-1600596542815-ffad4b1533a9?w=1920&q=80';
  const op = Math.min(40, Math.max(5, hero.heroOpacity)) / 100;

  return (
    <section className="relative overflow-hidden bg-navy">
      <div
        id="hero-bg-img"
        className="pointer-events-none absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bg})`, opacity: op }}
      />
      <div className="relative mx-auto max-w-infra px-4 py-16 md:px-7 md:py-24">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <p className="font-montserrat text-xs font-bold uppercase tracking-[0.14em] text-hz-accent">
            Houznext Infra
          </p>
          <h1 className="mt-3 max-w-3xl font-montserrat text-3xl font-extrabold leading-tight text-white md:text-5xl">
            Verified inventory across India&apos;s growth corridors
          </h1>
          <p className="mt-4 max-w-xl font-inter text-sm leading-relaxed text-white/60 md:text-[15px]">
            Buy · Sell · Land · Villa · Apartment · Plot — diligence-backed listings with RERA, title & EC checks.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setActiveTab(t)}
                className={`rounded-full px-4 py-2 font-montserrat text-xs font-bold transition ${
                  activeTab === t
                    ? 'bg-hz-blue text-white'
                    : 'bg-white/10 text-white/75 hover:bg-white/15'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-6 max-w-xl">
            <HeroSearch />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
