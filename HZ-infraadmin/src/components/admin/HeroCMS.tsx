import { useEffect, useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import adminApi from '@/lib/axios';
import { HERO_UNSPLASH_PRESETS } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export function HeroCMS() {
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [heroOpacity, setHeroOpacity] = useState(18);

  useEffect(() => {
    void (async () => {
      try {
        const res = await adminApi.get('/site-config/hero');
        setHeroImageUrl(res.data.heroImageUrl || '');
        setHeroOpacity(res.data.heroOpacity ?? 18);
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const save = async () => {
    try {
      await adminApi.patch('/admin/site-config/hero', { heroImageUrl, heroOpacity });
      toast.success('Hero updated');
    } catch {
      toast.error('Save failed');
    }
  };

  return (
    <div className="max-w-xl space-y-4 rounded-xl border border-border bg-hzwhite p-5">
      <div className="font-montserrat text-lg font-bold text-charcoal">Hero image</div>
      <div className="grid grid-cols-5 gap-2">
        {HERO_UNSPLASH_PRESETS.map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => setHeroImageUrl(u)}
            className="aspect-square overflow-hidden rounded-lg border border-border ring-offset-2 hover:ring-2 hover:ring-hz-blue"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      <label className="block font-montserrat text-[10px] font-bold uppercase text-muted">Custom URL</label>
      <input
        className="w-full rounded-lg border border-border px-3 py-2 font-inter text-sm"
        value={heroImageUrl}
        onChange={(e) => setHeroImageUrl(e.target.value)}
      />
      <div>
        <div className="font-montserrat text-[10px] font-bold uppercase text-muted">
          Overlay opacity ({heroOpacity}%)
        </div>
        <Slider min={5} max={40} value={heroOpacity} onChange={(v) => setHeroOpacity(v as number)} />
      </div>
      <Button variant="primary" onClick={() => void save()}>
        Save hero
      </Button>
    </div>
  );
}
