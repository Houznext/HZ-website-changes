const quotes = [
  {
    name: 'Ananya Rao',
    role: 'Investor, Hyderabad',
    text: 'Title verification and EC clarity before site visit — Infra saved us weeks of back-and-forth.',
  },
  {
    name: 'Rahul Verma',
    role: 'Developer, Bengaluru',
    text: 'Pipeline-grade CRM and visit scheduling keeps our launch inventory moving without chaos.',
  },
];

export function Testimonials() {
  return (
    <section className="overflow-x-hidden bg-offwhite py-9 md:py-14">
      <div className="mx-auto max-w-infra px-4 md:px-7">
        <h2 className="font-montserrat text-[22px] font-extrabold leading-tight text-charcoal md:text-2xl">What partners say</h2>
        <div className="-mx-4 mt-6 flex gap-3 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
          {quotes.map((q) => (
            <figure
              key={q.name}
              className="w-[80vw] max-w-[300px] shrink-0 rounded-2xl border border-border bg-hzwhite p-5 md:w-auto md:max-w-none md:shrink md:p-6"
            >
              <blockquote className="font-inter text-[13px] leading-relaxed text-charcoal md:text-sm">&ldquo;{q.text}&rdquo;</blockquote>
              <figcaption className="mt-4 font-montserrat text-[13px] font-bold text-charcoal md:text-sm">{q.name}</figcaption>
              <div className="font-inter text-[11px] text-muted md:text-xs">{q.role}</div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
