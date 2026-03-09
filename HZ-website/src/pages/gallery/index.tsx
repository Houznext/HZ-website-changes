import Link from "next/link";
import { motion } from "framer-motion";
import withGeneralLayout from "@/components/Layouts/GeneralLayout";
import SEO from "@/components/SEO";

function GalleryPage() {
  const galleryItems = [
    "Living Room Concepts",
    "Bedroom Styling",
    "Kitchen Modularity",
    "False Ceiling Designs",
    "Storage Solutions",
    "Luxury Foyer Themes",
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
      <SEO
        title="Houznext Gallery - Interior Inspirations"
        description="Explore premium interior inspirations and design styles curated by Houznext."
        keywords="interior gallery, luxury interiors, modular design ideas, houznext gallery"
      />
      <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">Gallery</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
        Curated inspirations for your upcoming interior project.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {galleryItems.map((item, index) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="text-lg font-medium text-slate-900">{item}</h2>
            <p className="mt-2 text-sm text-slate-600">
              Contact Houznext for a personalized walkthrough and proposal.
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mt-8">
        <Link href="/contact-us" className="rounded-md bg-[#3586FF] px-5 py-2.5 text-sm font-medium text-white">
          Start Your Project
        </Link>
      </div>
    </div>
  );
}

export default withGeneralLayout(GalleryPage);
