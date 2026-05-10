import ReactGA from 'react-ga4';

let initialized = false;

export function initGA() {
  const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  if (!measurementId || initialized || typeof window === 'undefined') return;
  ReactGA.initialize(measurementId);
  initialized = true;
}

export function trackPageView(url: string) {
  if (!initialized) return;
  ReactGA.send({ hitType: 'pageview', page: url });
}

export function trackEvent(category: string, action: string, label?: string) {
  if (!initialized) return;
  ReactGA.event({ category, action, label });
}
