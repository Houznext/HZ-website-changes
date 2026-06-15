import { useEffect, useRef } from 'react'
import { formatStatValue, parseStatValue } from './parseStatValue'

function animateCounter(
  element: HTMLElement,
  target: number,
  duration: number,
  suffix: string,
) {
  const start = 0
  const startTime = performance.now()
  const isFloat = target % 1 !== 0

  function update(currentTime: number) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - (1 - progress) ** 3
    const current = start + (target - start) * eased

    element.textContent = isFloat
      ? `${current.toFixed(1)}${suffix}`
      : `${Math.floor(current)}${suffix}`

    if (progress < 1) {
      requestAnimationFrame(update)
    } else {
      element.textContent = formatStatValue(target, suffix)
    }
  }

  requestAnimationFrame(update)
}

/** Attaches IntersectionObserver count-up to `.stats` inside `root`. Runs once per mount. */
export function useStatsCounter(rootRef: React.RefObject<HTMLElement | null>) {
  const firedRef = useRef(false)

  useEffect(() => {
    const root = rootRef.current
    if (!root || firedRef.current) return

    const statsSection = root.querySelector('.stats')
    if (!statsSection) return

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const runAnimation = () => {
      if (firedRef.current) return
      firedRef.current = true

      const statNumbers = statsSection.querySelectorAll<HTMLElement>('.stat-n')
      statNumbers.forEach((el) => {
        const target = parseFloat(el.dataset.target || '0')
        const suffix = el.dataset.suffix || ''
        if (!Number.isFinite(target)) return

        if (prefersReducedMotion) {
          el.textContent = formatStatValue(target, suffix)
          return
        }
        animateCounter(el, target, 1800, suffix)
      })
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runAnimation()
            observer.unobserve(entry.target)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.3 },
    )

    observer.observe(statsSection)
    return () => observer.disconnect()
  }, [rootRef])
}
