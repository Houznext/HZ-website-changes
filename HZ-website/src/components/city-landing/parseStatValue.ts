export type ParsedStat = {
  target: number
  suffix: string
  initial: string
}

/** Parses CMS stat display strings like "15+", "4.8★", "45d", "100%". */
export function parseStatValue(display: string): ParsedStat {
  const trimmed = display.trim()
  const match = trimmed.match(/^([\d.]+)(.*)$/)
  if (!match) {
    return { target: 0, suffix: '', initial: trimmed || '0' }
  }
  const target = parseFloat(match[1])
  const suffix = match[2] || ''
  if (!Number.isFinite(target)) {
    return { target: 0, suffix, initial: `0${suffix}` }
  }
  const isFloat = target % 1 !== 0
  const initial = `${isFloat ? '0.0' : '0'}${suffix}`
  return { target, suffix, initial }
}

export function formatStatValue(target: number, suffix: string): string {
  const isFloat = target % 1 !== 0
  return `${isFloat ? target.toFixed(1) : String(target)}${suffix}`
}
