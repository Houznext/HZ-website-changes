'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

type Props = {
  open: boolean;
  onClose: () => void;
};

const R = 38;
const C = 2 * Math.PI * R;

export function EnquirySuccessModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open || typeof document === 'undefined') return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="enquiry-success-title"
          className="fixed inset-0 z-[300] flex items-center justify-center bg-charcoal/40 px-4 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-[400px] rounded-2xl border border-[#dde8f5] bg-white p-8 shadow-xl"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-[92px] w-[92px] items-center justify-center" aria-hidden>
              <svg width="92" height="92" viewBox="0 0 92 92" className="text-[#0d9488]">
                <g transform="translate(46 46) rotate(-90)">
                  <motion.circle
                    r={R}
                    cx="0"
                    cy="0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={C}
                    initial={{ strokeDashoffset: C, opacity: 0 }}
                    animate={{ strokeDashoffset: 0, opacity: 1 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
                  />
                </g>
                <motion.path
                  d="M30 48 L42 60 L64 36"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
                />
              </svg>
            </div>

            <h2
              id="enquiry-success-title"
              className="mt-2 text-center font-montserrat text-lg font-extrabold leading-snug text-charcoal"
            >
              Your Enquiry has been submitted &amp; our team will reach out to you shortly
            </h2>

            <button
              type="button"
              className="mt-6 w-full rounded-xl bg-[#2f80ed] py-3 font-montserrat text-sm font-bold text-white transition hover:bg-[#2568c7]"
              onClick={onClose}
            >
              OK
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
