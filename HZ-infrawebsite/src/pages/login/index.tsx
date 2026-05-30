import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const InfraLoginPanel = dynamic(
  () => import('@/components/auth/InfraLoginPanel').then((m) => m.InfraLoginPanel),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-[400px] overflow-hidden rounded-[20px] bg-white px-8 py-12 text-center font-inter text-sm text-[#5a6a7e] shadow-xl">
        Loading…
      </div>
    ),
  },
);

export default function LoginPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f7fa]">
      <Navbar />
      <div className="flex min-h-[calc(100vh-64px)] items-stretch justify-center px-0 py-0 sm:items-center sm:px-4 sm:py-10">
        <div className="flex w-full max-w-[420px] flex-col sm:w-full">
          <InfraLoginPanel />
          <p className="mt-5 px-4 text-center font-inter text-[13px] text-[#5a6a7e] sm:px-0">
            <Link href="/" className="font-semibold text-[#2f80ed] hover:underline">
              Back to home
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
