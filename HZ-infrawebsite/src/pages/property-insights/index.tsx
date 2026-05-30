import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const data = [
  { city: 'Hyderabad', absorption: 72 },
  { city: 'Bengaluru', absorption: 68 },
  { city: 'Chennai', absorption: 61 },
  { city: 'Mumbai', absorption: 59 },
];

export default function PropertyInsightsPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-offwhite">
      <Navbar />
      <div className="mx-auto max-w-infra px-4 py-9 md:px-7 md:py-10">
        <h1 className="font-montserrat text-[26px] font-extrabold leading-tight text-charcoal md:text-3xl">Property insights</h1>
        <p className="mt-2 font-inter text-[13px] leading-relaxed text-muted md:text-sm">Illustrative absorption index by city (recharts).</p>
        <div className="mt-6 h-64 min-w-0 rounded-2xl border border-border bg-hzwhite p-3 md:mt-8 md:h-72 md:p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="city" tick={{ fontSize: 11, fontFamily: 'Inter' }} />
              <YAxis tick={{ fontSize: 11, fontFamily: 'Inter' }} />
              <Tooltip />
              <Bar dataKey="absorption" fill="#2f80ed" radius={[6, 6, 0, 0]} name="Absorption %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <Footer />
    </div>
  );
}
