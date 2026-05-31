import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ListPropertyWizard } from '@/components/sell/ListPropertyWizard';

export default function SellPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-offwhite">
      <Navbar />
      <ListPropertyWizard />
      <Footer />
    </div>
  );
}
