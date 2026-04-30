import Link from 'next/link'

export default function Custom404() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ background: '#f5f7fa' }}
    >
      <div className="w-full max-w-[420px] text-center">
        <p
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]"
          style={{ background: 'rgba(47,128,237,0.12)', color: '#2f80ed' }}
        >
          <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: '#2f80ed' }} />
          Page not found
        </p>

        <h1 className="font-head mt-6 text-[clamp(3.5rem,12vw,5rem)] font-black leading-none tracking-tight text-[#1f2933]">
          404
        </h1>

        <p className="mt-6 text-[15px] leading-relaxed md:text-[16px]" style={{ color: '#5a6a7e' }}>
          The page you&apos;re looking for doesn&apos;t exist or may have been moved. Let&apos;s get you back to
          something useful.
        </p>

        <Link
          href="/"
          className="font-head mt-10 inline-flex min-h-[48px] min-w-[160px] items-center justify-center rounded-xl px-8 text-[15px] font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-[0.96]"
          style={{ background: '#2f80ed', boxShadow: '0 8px 24px rgba(47,128,237,0.35)' }}
        >
          Home page
        </Link>
      </div>
    </div>
  )
}
