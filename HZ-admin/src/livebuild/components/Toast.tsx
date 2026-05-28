import toast from 'react-hot-toast';
import { Check, AlertCircle, Info } from 'lucide-react';

export type LbToastType = 'ok' | 'err' | 'info';

export function lbToast(message: string, type: LbToastType = 'info') {
  const Icon = type === 'ok' ? Check : type === 'err' ? AlertCircle : Info;
  const border =
    type === 'ok' ? 'var(--lb-tl)' : type === 'err' ? 'var(--lb-rd)' : 'var(--lb-blue)';

  toast.custom(
    (t) => (
      <div
        className={`${t.visible ? 'animate-enter' : 'animate-leave'} flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg`}
        style={{
          background: 'var(--lb-ch)',
          borderLeft: `3px solid ${border}`,
          fontFamily: 'var(--lb-i)',
        }}
      >
        <Icon size={12} strokeWidth={2.5} style={{ color: border, flexShrink: 0 }} />
        {message}
      </div>
    ),
    { duration: 2800 },
  );
}
