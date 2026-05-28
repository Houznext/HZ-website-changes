import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Btn } from './Btn';

type Props = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: number;
};

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  maxWidth = 640,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="lb-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="presentation"
    >
      <div className="lb-modal" style={{ maxWidth }} role="dialog" aria-modal="true" aria-labelledby="lb-modal-title">
        <div className="lb-modal-hd">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {icon}
            <div>
              <div id="lb-modal-title" style={{ fontFamily: 'var(--lb-m)', fontSize: 15, fontWeight: 700 }}>
                {title}
              </div>
              {subtitle ? (
                <div style={{ fontSize: 12, color: 'var(--lb-mu)' }}>{subtitle}</div>
              ) : null}
            </div>
          </div>
          <Btn variant="icon" onClick={onClose} aria-label="Close">
            <X size={14} strokeWidth={1.8} />
          </Btn>
        </div>
        <div className="lb-modal-bd">{children}</div>
        {footer ? <div className="lb-modal-ft">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}
