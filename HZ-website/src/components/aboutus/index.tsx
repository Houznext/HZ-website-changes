import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CreateDesign,
  Customise,
  Development,
  DotIcon,
  Optimisation,
  Residential,
  Support,
} from "../Icons";
import CustomInput from "@/common/FormElements/CustomInput";
import Button from "@/common/Button";
import { motion } from "framer-motion";
import OurJourney from "./Timeline";
import { CountUp, ImpactStrip } from "./CountUp";

const H = {
  section: "max-w-7xl mx-auto px-5 md:px-8",
  h1: "text-3xl md:text-4xl font-bold tracking-tight",
  h2: "text-xl md:text-2xl font-bold tracking-tight",
  p: "text-[12px] md:text-[14px] leading-7 text-[#50525a] font-medium",
  card: "rounded-2xl shadow-sm border border-gray-200 bg-white",
};

const highlights = [
  { title: "CREATE DESIGN", sub: "Bring your ideas to life with custom architectural designs.", Icon: CreateDesign },
  { title: "Easy to customize", sub: "Tailor the design to match your unique preferences and needs.", Icon: Customise },
  { title: "Residential", sub: "Expert solutions for creating beautiful residential spaces.", Icon: Residential },
  { title: "Development", sub: "Innovative and efficient development solutions for every project.", Icon: Development },
  { title: "Optimization", sub: "Maximize efficiency and performance with design optimization.", Icon: Optimisation },
  { title: "Support 24/7", sub: "Our team is available around the clock to assist you.", Icon: Support },
];

const impactStats = [
  { label: "Homes Matched", value: "200+" },
  { label: "Cities Covered", value: "8+" },
  { label: "Avg. TAT", value: "48h" },
  { label: "Partner Network", value: "100+" },
];

const values = [
  {
    title: "Client-First",
    description:
      "We obsess over clarity, timelines, and results so buyers and sellers stay in control.",
    icon: "🤝",
  },
  {
    title: "Radical Transparency",
    description:
      "From pricing intel to builder credibility, we present facts without the fluff.",
    icon: "🔍",
  },
  {
    title: "Design + Data",
    description:
      "Aesthetics meet analytics—every recommendation is backed by real signals.",
    icon: "📊",
  },
  {
    title: "Reliable Support",
    description:
      "Questions at 10pm? We’re around. Our support runs when your search does.",
    icon: "📞",
  },
];

const team = [
  {
    name: "SACHIN CHAVAN",
    role: "FOUNDER — OneCasa Pvt Limited",
    img: "/images/team/founder.jpg",
    bio: `As the Founder & CEO of OneCasa, I bring over four years of entrepreneurial and hands-on real estate experience. My journey began with a simple vision—to simplify property ownership and make real estate more transparent, accessible, and rewarding for every individual. Over the years, I have worked closely with property buyers, sellers, and developers, gaining deep insights into the challenges faced in the industry. At OneCasa, my focus is on leveraging technology, data, and innovation to bridge these gaps, offering clients a seamless platform for buying, selling, and managing properties. Beyond transactions, I am committed to creating a trustworthy ecosystem where clients feel empowered and confident in their investment decisions.`,
  },
  {
    name: "RAMANA REDDY",
    role: "PROMOTER — OneCasa Pvt Limited",
    img: "/images/team/promoter.png",
    bio: `As a Promoter & Strategic Investor at OneCasa, I bring both financial backing and a strong belief in the company’s mission to transform the real estate landscape. My role goes beyond investment—I actively contribute to shaping strategies that ensure long-term growth, innovation, and sustainability. With a focus on creating value for both clients and stakeholders, I support initiatives that make property investment simpler, smarter, and more efficient. I believe in driving a customer-first approach, ensuring that OneCasa not only scales as a business but also builds lasting trust within the community. By aligning vision with execution, I aim to help OneCasa become a leader in providing transparent, future-ready real estate solutions.`,
  },
];


const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function AboutOneCasa() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", about: "" });
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const isValidPhone = (p: string) => /^\d{10}$/.test(p);
  const isValidEmail = (e: string) => /\S+@\S+\.\S+/.test(e);

  const handleChange = (key: keyof typeof form, value: string) => {
    setForm((s) => ({ ...s, [key]: value }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Please enter your name";
    if (!isValidPhone(form.phone)) e.phone = "Enter a valid 10‑digit phone";
    if (!isValidEmail(form.email)) e.email = "Enter a valid email";
    if (form.about.trim().length < 20) e.about = "Tell us a bit more (20+ chars)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      setSubmitting(true);
      // TODO: swap with your API endpoint
      // await apiClient.post("/careers/apply", form);
      await new Promise((r) => setTimeout(r, 900));
      alert("Thanks! We\'ll get back to you soon.");
      setForm({ name: "", phone: "", email: "", about: "" });
      setErrors({});
    } finally {
      setSubmitting(false);
    }
  };

  const crumb = useMemo(
    () => (
      <nav aria-label="Breadcrumb" className="text-white/90">
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <Link href="/" className="hover:underline">Home</Link>
          </li>
          <li className="opacity-70">›</li>
          <li className="font-medium text-blue-400">About us</li>
        </ol>
      </nav>
    ),
    []
  );

  return (
    <div className="min-h-screen w-full bg-white">
      <section className="relative">
        <div className="relative h-[140px] md:h-[180px] w-full overflow-hidden">
          <Image
            src="/images/background/aboutus_bg.jpg"
            alt="About OneCasa background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-[#090a12]/50" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-5">
            <motion.h1
              variants={fadeIn}
              initial="hidden"
              animate="show"
              className="text-3xl md:text-4xl font-bold text-white "
            >
              About One<span className="text-[#3586FF]">
                Casa
              </span>
            </motion.h1>
            <motion.div variants={fadeIn} initial="hidden" animate="show" className="mt-2">
              {crumb}
            </motion.div>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className={`${H.section} py-12 md:py-16 grid md:grid-cols-2 gap-10 items-center`}>
        <div className="space-y-4">
          <h2 className={H.h1}>We discover fantastic homes for our clients.</h2>
          <p className={H.p}>
            We simplify real estate—from discovery and shortlisting to negotiation and closure—
            so you make confident decisions faster. Whether you’re a first‑time buyer or a seasoned investor,
            our curated listings, builder network, and on‑call experts put you in control.
          </p>
          <div className="flex gap-3 max-md:justify-center">
            <Button href="/services/custom-builder" className="inline-block bg-[#4388ef] text-white font-medium md:text-[14px] text-[12px] rounded-xl px-5 py-2">Explore Services</Button>
            <Button href="/properties" className="inline-block bg-white border border-gray-300 font-medium md:text-[14px] text-[12px] rounded-xl px-5 py-2">Browse Properties</Button>
          </div>
        </div>
        <div className="relative md:aspect-[4/3] h-[200px] w-full rounded-2xl overflow-hidden shadow-sm">
          <Image
            src="/images/background/aboutus.png"
            alt="OneCasa team at work"
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="bg-[#EDF3FC] py-12 md:py-16">
        <div className={`${H.section}`}>
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="flex items-center justify-center gap-2 text-[#3586FF]">
              <DotIcon />
              <p className="font-bold text-xl">What we do</p>
            </div>
            <p className={`${H.p} mt-2`}>
              Design‑forward. Data‑driven. Human‑backed. Here’s how we help you move from search to keys in hand.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {highlights.map(({ title, sub, Icon }, i) => (
              <motion.div
                key={title}
                variants={fadeIn}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                className={`${H.card} p-6 flex items-start gap-4`}
              >
                <div className="shrink-0"><Icon /></div>
                <div>
                  <p className="text-[#3586FF] font-medium">{title}</p>
                  <p className="text-[14px] text-[#7B7C83] mt-1">{sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT STRIP */}
      <section className={`${H.section} py-12 md:py-16`}>
        <ImpactStrip />
      </section>


      {/* TEAM */}
      <section className={`${H.section} py-8 md:py-10`}>
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2">
            <DotIcon />
            <p className="font-bold md:text-2xl text-xl">Meet the Team</p>
          </div>
          <p className={`${H.p} font-regular mt-2`}>Experience, innovation, and creativity—your plans are in good hands.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {team.map((m) => (
            <article key={m.name} className={`${H.card} p-6 md:p-7 flex gap-6 items-start`}>
              <div className="relative h-[120px] w-[120px] rounded-full overflow-hidden shrink-0">
                <Image src={m.img} alt={m.name} fill className="object-cover" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold md:text-lg text-sm">{m.name}</h3>
                <p className="text-[#7B7C83] text-sm font-medium uppercase tracking-wide">{m.role}</p>
                <p className={H.p}>{m.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* VALUES */}
      <section className="bg-[#FAFBFF] py-10 sm:py-14">
        <div className={`${H.section}`}>
          <div className="text-center mb-8 sm:mb-12">
            <p className="font-bold text-2xl sm:text-3xl mb-2">Our Values</p>
            <p className={`${H.p} max-w-2xl mx-auto text-sm sm:text-base`}>
              Principles that shape every interaction and every build.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {values.map((v) => (
              <motion.div
                key={v.title}
                variants={fadeIn}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6
                     flex flex-col items-center text-center
                     shadow-sm hover:shadow-md transition-shadow
                     border-t-4 border-[#3586FF]"
              >
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{v.icon}</div>
                <h3 className="font-bold text-[15px] sm:text-lg mb-1.5 sm:mb-2">
                  {v.title}
                </h3>
                <p className="text-[13px] sm:text-sm text-[#565a67] leading-6">
                  {v.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* TIMELINE */}
      <OurJourney />

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#3F7CF8] to-[#6BA3FF] text-white">
        <div className={`${H.section} py-10 md:py-14 flex flex-col md:flex-row items-center gap-6 md:gap-10`}>
          <div className="flex-1">
            <h3 className="text-2xl md:text-3xl font-bold">Ready to find your place?</h3>
            <p className="mt-2 text-white/90 max-w-prose font-regular md:text-[14px] text-[12px]">
              Talk to a OneCasa specialist for a personalized shortlist, visit planning, and negotiation support.
            </p>
          </div>
          <div className="flex gap-3">
            <Button href="/contact" className="bg-white text-[#2b6be7] rounded-xl font-medium px-5 py-3">Talk to us</Button>
            <Button href="/interiors" className="bg-transparent border border-white rounded-xl font-medium  px-5 py-3">Interiors</Button>
          </div>
        </div>
      </section>

      {/* JOIN OUR TEAM */}
      <section className={`${H.section} py-12 md:py-16`}>
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2">
            <DotIcon />
            <p className="font-bold text-2xl">Join our Team</p>
          </div>
          <p className={`${H.p} mt-2 max-w-2xl mx-auto`}>
            We’re building the most trusted home‑decision platform. If that excites you, send a short note about what you’d like to build here.
          </p>
        </div>

        <form onSubmit={submit} className={`${H.card} max-w-3xl mx-auto p-6 md:p-8`}>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <CustomInput
                type="text"
                label="Name"
                labelCls="text-[14px] font-medium"
                name="name"
                rootCls="bg-white"
                className="placeholder:text-[14px]"
                value={form.name}
                onChange={(e: any) => handleChange("name", e.target.value)}
                errorMsg={errors.name}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <CustomInput
                type="text"
                label="Phone Number"
                labelCls="text-[14px] font-medium"
                name="phone"
                rootCls="bg-white"
                className="placeholder:text-[14px]"
                value={form.phone}
                onChange={(e: any) => handleChange("phone", e.target.value)}
                errorMsg={errors.phone}
                placeholder="10‑digit phone"
                required
              />
            </div>
            <div>
              <CustomInput
                type="text"
                label="Email"
                labelCls="text-[14px] font-medium"
                name="email"
                rootCls="bg-white"
                className="placeholder:text-[14px]"
                value={form.email}
                onChange={(e: any) => handleChange("email", e.target.value)}
                errorMsg={errors.email}
                placeholder="you@domain.com"
                required
              />
            </div>
            <div>
              <CustomInput
                type="text"
                label="About"
                labelCls="text-[14px] font-medium"
                name="about"
                rootCls="bg-white"
                className="placeholder:text-[14px] "
                value={form.about}
                onChange={(e: any) => handleChange("about", e.target.value)}
                errorMsg={errors.about}
                placeholder="Tell us about your interest"
                required
              />
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <Button disabled={submitting} className="bg-[#3586FF] md:py-2 py-1 w-full md:w-[340px] rounded-xl text-white font-bold">
              {submitting ? "Submitting..." : "Submit Requirements"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
