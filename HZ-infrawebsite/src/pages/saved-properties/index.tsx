import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SavedPropertiesClient } from '@/components/account/SavedPropertiesClient';

export default function SavedPropertiesPage() {
  return (
    <div className="min-h-screen bg-offwhite">
      <Navbar />
      <SavedPropertiesClient />
      <Footer />
    </div>
  );
}
