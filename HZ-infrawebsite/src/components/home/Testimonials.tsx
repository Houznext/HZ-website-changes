const quotes = [
  {
    initials: 'RK',
    avatarBg: '#2f80ed',
    name: 'Ravi Kumar',
    role: 'Hyderabad · Villa buyer',
    text: 'Found my dream villa in Kokapet through Houznext Infra. RERA verified, title clear, zero brokerage. The property insights helped me understand the area growth potential.',
  },
  {
    initials: 'SM',
    avatarBg: '#db2777',
    name: 'Sunita Mehta',
    role: 'Bengaluru · Apartment seller',
    text: 'Sold my apartment in 3 weeks! The listing process was smooth and the Houznext team handled everything including the EC verification and documentation.',
  },
  {
    initials: 'VR',
    avatarBg: '#0d9488',
    name: 'Venkat Rao',
    role: 'Hyderabad · Plot buyer',
    text: 'The property value calculator was spot on. Got a fair deal on a plot in ORR. Free 1-year property management support is a bonus that none of the others offer.',
  },
];

export function Testimonials() {
  return (
    <section className="overflow-x-hidden bg-white py-9 md:py-14">
      <div className="mx-auto max-w-infra px-4 md:px-7">
        <div className="mb-8 text-center md:mb-8">
          <div className="font-montserrat text-[11px] font-bold uppercase tracking-[0.12em] text-hz-teal">
            Customer stories
          </div>
          <h2 className="mt-1.5 font-montserrat text-[26px] font-extrabold text-charcoal">
            What our customers say
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-[18px]">
          {quotes.map((q) => (
            <figure
              key={q.name}
              className="rounded-[14px] border border-[#dde8f5] bg-offwhite p-5 md:p-[22px]"
            >
              <div className="mb-3 flex gap-0.5 text-sm text-hz-amber" aria-hidden>
                {'★★★★★'}
              </div>
              <blockquote className="mb-3.5 font-inter text-[13px] leading-[1.7] text-muted">
                &ldquo;{q.text}&rdquo;
              </blockquote>
              <figcaption className="flex items-center gap-2.5">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-montserrat text-xs font-extrabold text-white"
                  style={{ backgroundColor: q.avatarBg }}
                >
                  {q.initials}
                </div>
                <div>
                  <div className="font-montserrat text-[13px] font-bold text-charcoal">{q.name}</div>
                  <div className="font-inter text-[11px] text-muted">{q.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
