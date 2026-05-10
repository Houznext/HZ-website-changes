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
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <div className="mx-auto max-w-infra px-4 py-10 md:px-7">
        <h1 className="font-montserrat text-3xl font-extrabold text-charcoal">Property insights</h1>
        <p className="mt-2 font-inter text-sm text-muted">Illustrative absorption index by city (recharts).</p>
        <div className="mt-8 h-72 rounded-2xl border border-border bg-hzwhite p-4">
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
