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
    <section className="bg-offwhite py-14">
      <div className="mx-auto max-w-infra px-4 md:px-7">
        <h2 className="font-montserrat text-2xl font-extrabold text-charcoal">What partners say</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {quotes.map((q) => (
            <figure key={q.name} className="rounded-2xl border border-border bg-hzwhite p-6">
              <blockquote className="font-inter text-sm leading-relaxed text-charcoal">&ldquo;{q.text}&rdquo;</blockquote>
              <figcaption className="mt-4 font-montserrat text-sm font-bold text-charcoal">{q.name}</figcaption>
              <div className="font-inter text-xs text-muted">{q.role}</div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
