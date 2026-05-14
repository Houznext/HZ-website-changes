import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SeenPropertiesClient } from '@/components/account/SeenPropertiesClient';

export default function SeenPropertiesPage() {
  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <SeenPropertiesClient />
      <Footer />
    </div>
  );
}
