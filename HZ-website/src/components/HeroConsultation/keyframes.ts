/** Keyframes + utility classes used by hero consultation form, city dropdown, and success modal */
export const HERO_CONSULTATION_CSS = `
@keyframes hz-city-dropdown-in {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes hz-modal-in {
  from { opacity: 0; transform: scale(0.92) translateY(16px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes hz-modal-bg-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes hz-check-pop {
  0% { transform: scale(0) rotate(-20deg); opacity: 0; }
  70% { transform: scale(1.18) rotate(4deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
@keyframes hz-ring-pulse {
  0%, 100% { transform: scale(1); opacity: 0.4; }
  50% { transform: scale(1.12); opacity: 0.15; }
}
.animate-hz-city-in { animation: hz-city-dropdown-in 0.18s ease both; }
.animate-hz-modal-in { animation: hz-modal-in 0.28s cubic-bezier(0.34,1.56,0.64,1) both; }
.animate-hz-modal-bg { animation: hz-modal-bg-in 0.22s ease both; }
.animate-hz-check-pop { animation: hz-check-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both 0.15s; }
.animate-hz-ring { animation: hz-ring-pulse 2.4s ease-in-out infinite; }
`
