import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type Props = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function RbacPageChrome({ title, subtitle, actions, children }: Props) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <h1 className="font-montserrat text-2xl font-extrabold text-charcoal">{title}</h1>
          {subtitle ? <p className="mt-1 max-w-2xl font-inter text-sm text-muted">{subtitle}</p> : null}
        </div>
        {actions ? (
          <motion.div
            className="flex flex-wrap items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.06, duration: 0.2 }}
          >
            {actions}
          </motion.div>
        ) : null}
      </motion.div>
      <div className="mt-6">{children}</div>
    </>
  );
}
