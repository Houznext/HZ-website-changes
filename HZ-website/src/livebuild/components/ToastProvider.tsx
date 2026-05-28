import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Check } from 'lucide-react';
import { lbIconProps } from './icons';

type ToastItem = { id: number; message: string };

type ToastCtx = { toast: (message: string) => void };

const Ctx = createContext<ToastCtx | null>(null);

export function useLbToast(): ToastCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useLbToast must be used within LivebuildToastProvider');
  return v;
}

export function LivebuildToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, message }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="tw" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className="toast-item">
            <Check size={12} {...lbIconProps({ stroke: 'var(--blue)' })} />
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
