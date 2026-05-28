import { useEffect } from 'react';

/**
 * Sticky offsets for LiveBuild inside AdminShell.
 * Scroll container is PageContainer (main), not the window — admin TopNavbar is outside it.
 */
export function useLbStickyTop() {
  useEffect(() => {
    const measure = () => {
      const embedded = document.querySelector('.lb-admin-embedded');
      const pdHead = document.querySelector('.lb-pd-head');

      if (pdHead) {
        document.documentElement.style.setProperty(
          '--lb-pd-head-height',
          `${Math.round(pdHead.getBoundingClientRect().height)}px`,
        );
      } else {
        document.documentElement.style.removeProperty('--lb-pd-head-height');
      }

      if (embedded) {
        document.documentElement.style.setProperty('--lb-admin-sticky-top', '0px');
        return;
      }

      const adminBar = document.querySelector('[data-admin-topbar]');
      const h = adminBar?.getBoundingClientRect().height ?? 56;
      document.documentElement.style.setProperty('--lb-admin-sticky-top', `${Math.round(h)}px`);
    };

    measure();
    window.addEventListener('resize', measure);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    const head = document.querySelector('.lb-pd-head');
    if (ro && head) ro.observe(head);

    return () => {
      window.removeEventListener('resize', measure);
      ro?.disconnect();
    };
  }, []);
}
