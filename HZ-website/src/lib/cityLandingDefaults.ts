import {
  PRICING,
  PROCESS_STEPS,
  SERVICES,
  WHY_US,
} from '@/components/city-landing/vikarabad/data'
import { HERO_TRUST, STATS as SHARED_STATS } from '@/components/city-landing/shared/constants'
import type { CityLandingContent } from './cityLandingCms'
import {
  CITY_LANDING_REGISTRY,
  getCityMeta,
  whatsappUrlForCity,
  type CitySlug,
} from './cityLandingRegistry'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80'

function sharedServices() {
  return {
    eyebrow: 'Our Services',
    title: 'Everything your home needs, handled in one place',
    subtitle:
      'From your first design call to the final installation, every step is planned and executed by Houznext. No coordinating with multiple vendors, no chasing contractors — one team, full accountability.',
    items: SERVICES.map((s) => ({ title: s.title, desc: s.desc, meta: s.meta })),
  }
}

function sharedPricing(cityName: string) {
  return {
    eyebrow: 'Packages',
    title: `Pick the right package for your ${cityName} home`,
    subtitle:
      'All packages are fixed-price with zero hidden costs. The price you see is the price you pay — including GST, installation, and 10-year warranty.',
    packages: PRICING.map((p) => ({ ...p, features: [...p.features] })),
  }
}

function sharedProcess(cityName: string) {
  const steps = PROCESS_STEPS.map((s) => ({ ...s }))
  steps[0] = {
    ...steps[0],
    desc: `Call or WhatsApp our ${cityName} team. We discuss your vision, space, family needs, and budget — no commitment required.`,
  }
  return {
    eyebrow: 'The Process',
    title: 'How it works',
    subtitle:
      'From your first call to a beautifully finished home in 4 simple steps — all coordinated, tracked, and documented by Houznext.',
    steps,
  }
}

function sharedWhyUs(cityName: string) {
  return {
    eyebrow: 'Why Houznext',
    title: 'Why 500+ families chose us',
    subtitle: `Six reasons homeowners in ${cityName} and across Telangana trust Houznext with their most important investment — their home.`,
    items: WHY_US.map((w) => ({ title: w.title, desc: w.desc })),
  }
}

function sharedProjects() {
  return {
    eyebrow: 'Featured Projects',
    title: "Recent homes we've delivered",
    subtitle:
      'Real homes, real homeowners, real timelines. Each project includes the package chosen, delivery duration, and final cost — exactly as quoted at the start.',
  }
}

function sharedTestimonialsHeader(cityName: string, areas: string[]) {
  const areaList = areas.filter((a) => a !== 'Other').slice(0, 3).join(', ')
  return {
    eyebrow: 'Reviews',
    title: `What our ${cityName} homeowners say`,
    subtitle: `Real reviews from real homeowners in ${cityName}, ${areaList}, and surrounding areas. Every project includes verified photos, BOQ, and LiveBuild progress logs.`,
  }
}

function sharedFaqHeader(cityName: string) {
  return {
    eyebrow: 'FAQ',
    title: 'Frequently asked questions',
    subtitle: `Answers to common questions from homeowners in ${cityName} and surrounding areas. Have a question that's not here? WhatsApp us anytime.`,
  }
}

function baseSeo(cityName: string, slug: string) {
  return {
    title: `Interior Designers in ${cityName} | Home Interiors from ₹4.5L | Houznext`,
    description: `Top interior designers in ${cityName}. Fixed-price 2BHK, 3BHK and villa interiors starting from ₹4.5 lakhs. 45-day delivery, LiveBuild tracking, 10-year warranty. Free consultation.`,
    keywords: `interior designers in ${cityName}, home interiors ${cityName}, modular kitchen ${cityName}, 2BHK interiors ${cityName}, 3BHK interiors ${cityName}, villa interiors ${cityName}, Houznext ${cityName}`,
  }
}

function baseHero(cityName: string) {
  return {
    eyebrow: `Now serving ${cityName}`,
    titleBefore: 'Top Interior Designers in ',
    titleHighlight: cityName,
    subtitle: `Turnkey home interiors for 2BHK, 3BHK and villa homes across ${cityName} and surrounding areas. Fixed-price packages from ₹4.5 lakhs, 45-day delivery, and daily site updates through LiveBuild — Houznext's live project tracking system.`,
    trustBadges: [...HERO_TRUST],
    heroImageUrl: HERO_IMAGE,
    heroImageOpacity: 22,
  }
}

function baseIntro(cityName: string, paragraphs: string[]) {
  return {
    eyebrow: `Interior Design in ${cityName}`,
    title: `Bringing premium home interiors to ${cityName}`,
    paragraphs,
    badgeText: `Now serving ${cityName}`,
  }
}

function faq2bhk(cityName: string) {
  return `Houznext 2BHK interior packages in ${cityName} start from ₹4.5 lakhs (Essential) and go up to ₹18 lakhs (Luxury) — fixed price, all-inclusive. The exact cost depends on which package you choose, the size of your apartment, and how many rooms need interior work. Most 2BHK homes in ${cityName} fall in the ₹4.5L–₹8L range.`
}

function faqTimeline(cityName: string) {
  return `A standard 2BHK takes around 35–45 days from design approval to handover. A 3BHK takes 45–55 days. Villas take 55–70 days depending on scope. We commit to your timeline in writing in the BOQ, and you can track every day of progress through LiveBuild — including photos, milestone status, and any delays with reasons.`
}

function faqAreas(cityName: string, areas: string[]) {
  const list = areas.filter((a) => a !== 'Other').join(', ')
  return `We serve ${list}, and other major locations across ${cityName} district. If you're in a remote location, we'll still send our team — site visits and material transport are coordinated from our Hyderabad workshop.`
}

function faqLivebuild(cityName: string) {
  return `LiveBuild is Houznext's proprietary project tracking portal. You log in from your phone or laptop and see daily photo updates from your site, room-by-room progress percentages, milestone payment status, design approvals, and any queries raised. It's especially useful for homeowners in ${cityName} whose property might be far from where they work — you never need to make a long site visit just to check progress.`
}

function buildFaq(cityName: string, areas: string[]) {
  return [
    { q: `What is the cost of 2BHK home interiors in ${cityName}?`, a: faq2bhk(cityName) },
    { q: `How long does a home interior project take in ${cityName}?`, a: faqTimeline(cityName) },
    {
      q: 'Do you charge anything extra after the initial quote?',
      a: "No. The price in your BOQ is the final invoice. If you change your mind mid-project and want to add or modify scope, we issue a written change order and you approve it before any extra work begins. Most homeowners' final invoice matches their original quote to the rupee.",
    },
    { q: `Which areas of ${cityName} district do you serve?`, a: faqAreas(cityName, areas) },
    { q: 'What is LiveBuild and how does it help me?', a: faqLivebuild(cityName) },
    {
      q: 'Do you offer EMI or financing options?',
      a: 'Yes. We have partnerships with leading banks and NBFCs including HDFC, ICICI, Bajaj Finserv, and Tata Capital to offer zero-cost EMI options for 3–24 months on most interior packages. Our payments themselves are milestone-based across 4 stages, so you only pay as work progresses — never upfront.',
    },
    {
      q: 'What materials and brands do you use?',
      a: 'Standard across all our packages: Greenply / Century plywood (ISI marked), Hettich / Ebco hardware (soft-close), Jaquar bathroom fittings, Saint-Gobain mirrors and glass, Asian Paints / Berger paints, and laminates from Greenlam, Merino, or Royale Touche. Every material is listed in your BOQ with the exact brand and model number.',
    },
    {
      q: 'What is your warranty policy?',
      a: 'All Houznext workmanship comes with a 10-year warranty covering joinery, hinges, alignment, finishing defects, and structural integrity of all built-in furniture. Manufacturer warranties on hardware (Hettich, Ebco), appliances, and electrical fittings are passed through separately. All warranty documents are stored in your LiveBuild portal permanently.',
    },
  ]
}

type CityContentOverrides = {
  introParagraphs: string[]
  testimonials: CityLandingContent['testimonials']['items']
}

const CITY_OVERRIDES: Record<CitySlug, CityContentOverrides> = {
  vikarabad: {
    introParagraphs: [
      'Vikarabad has grown rapidly over the last decade. With new gated communities, independent homes, and apartment projects coming up along the Hyderabad–Bijapur highway, homeowners here are increasingly looking for the same quality of interior design and execution available in Hyderabad — without compromising on transparency, timeline, or finishing standards.',
      'Houznext brings that exact experience to Vikarabad. Our team of certified interior designers, site supervisors, and skilled craftsmen now serves Vikarabad town, Tandur, Parigi, Kodangal, and surrounding areas. Whether you own a 2BHK in a new layout, a 3BHK in a gated community, or an independent villa on agricultural land near the city — we build it the same way: fixed price, on time, and tracked daily through LiveBuild.',
      'From modular kitchens and built-in wardrobes to false ceilings, TV units, study rooms, and pooja spaces — every part of your home is designed by a dedicated team and built in our quality-controlled workshop. Materials like Greenply plywood, Hettich hardware, Jaquar fittings, and Saint-Gobain glass are used as standard across every project.',
    ],
    testimonials: [
      { q: '"We had heard of Houznext through a friend in Hyderabad. When they confirmed they serve Vikarabad too, we booked the consultation right away. Our 3BHK was delivered in 42 days, exactly as promised. The fixed pricing meant no last-minute shocks."', name: 'Rajesh Reddy', info: '3BHK · Vikarabad · Premium Package', initial: 'R' },
      { q: '"The 3D designs were beautiful — exactly how my kitchen turned out in real life. The team was respectful of our family time, worked Monday to Saturday, and finished my 2BHK in 38 days. Very happy with the workmanship."', name: 'Anita Sharma', info: '2BHK · Tandur · Essential Package', initial: 'A' },
      { q: '"For our villa, we wanted luxury but also accountability. Houznext gave us both. LiveBuild let me check site progress every evening after work. The acrylic kitchen and PU wardrobe finishing came out stunning. Worth every rupee."', name: 'Srinivas Goud', info: '4BHK Villa · Vikarabad · Luxury Package', initial: 'S' },
      { q: '"What impressed us most was the BOQ document. Every single material — plywood brand, laminate code, hardware model — was listed with quantities and prices. No hidden charges, no upselling during execution. Truly professional."', name: 'Lakshmi Devi', info: '3BHK · Parigi · Premium Package', initial: 'L' },
      { q: '"I was nervous about hiring someone from outside Vikarabad. But Houznext\'s local site supervisor was here daily, and the WhatsApp updates were continuous. My modular kitchen and wardrobes are top quality. Hettich soft-close everywhere."', name: 'Naveen Kumar', info: '2BHK · Vikarabad · Premium Package', initial: 'N' },
      { q: '"Budget was a big concern. The Essential package was perfect for our needs — clean laminate finishes, good plywood, all the basics done right. ₹4.6L final invoice, exactly as quoted. Now planning to upgrade my parents\' home with the same team."', name: 'Pradeep Yadav', info: '2BHK · Kodangal · Essential Package', initial: 'P' },
    ],
  },
  mahabubnagar: {
    introParagraphs: [
      "Mahabubnagar — formerly known as Palamuru — is one of Telangana's most historically rich districts, with rapid residential growth happening along the Hyderabad–Bangalore highway corridor. With Jadcherla and Shadnagar becoming preferred residential zones due to their proximity to Hyderabad, homeowners here are increasingly investing in quality home interiors.",
      'Houznext now serves Mahabubnagar town, Jadcherla, Shadnagar, Narayanpet, Wanaparthy, and surrounding areas. Whether you own a 2BHK in a new apartment complex, a 3BHK in a gated community, or an independent home in town — we build it the same way: fixed price, on time, and tracked daily through LiveBuild.',
      'From modular kitchens and built-in wardrobes to false ceilings, TV units, study rooms, and pooja spaces — every part of your home is designed by a dedicated team and built in our quality-controlled workshop. Materials like Greenply plywood, Hettich hardware, Jaquar fittings, and Saint-Gobain glass are used as standard across every project.',
    ],
    testimonials: [
      { q: '"We booked Houznext after seeing their work in Hyderabad. Our 3BHK in Mahabubnagar town was finished in 42 days with zero price changes. LiveBuild updates every evening were a huge relief."', name: 'Rajesh Reddy', info: '3BHK · Mahabubnagar town · Premium Package', initial: 'R' },
      { q: '"The kitchen and wardrobes came out exactly like the 3D renders. Jadcherla is a bit off the highway but their site team was here regularly. Finished in 38 days."', name: 'Anita Reddy', info: '2BHK · Jadcherla · Essential Package', initial: 'A' },
      { q: '"Our villa in Shadnagar needed premium finishes. Houznext delivered on time with Hettich hardware throughout. The acrylic kitchen is the highlight of our home."', name: 'Srinivas Naidu', info: '4BHK Villa · Shadnagar · Luxury Package', initial: 'S' },
      { q: '"Transparent BOQ from day one. Every laminate code and hardware brand was documented. Narayanpet is not close to Hyderabad but they never missed a milestone."', name: 'Lakshmi Devi', info: '3BHK · Narayanpet · Premium Package', initial: 'L' },
      { q: '"Daily WhatsApp updates and a local supervisor made the process stress-free. Our 2BHK modular kitchen is excellent quality for the price."', name: 'Naveen Goud', info: '2BHK · Mahabubnagar town · Premium Package', initial: 'N' },
      { q: '"Essential package was perfect for our first home in Wanaparthy. ₹4.6L final bill — exactly as quoted. Already recommending Houznext to neighbours."', name: 'Pradeep Yadav', info: '2BHK · Wanaparthy · Essential Package', initial: 'P' },
    ],
  },
  sangareddy: {
    introParagraphs: [
      "Sangareddy has emerged as one of Hyderabad's most important satellite growth zones, with major industrial parks at Patancheru and the upcoming pharmaceutical hub driving residential demand. New gated communities, apartments, and independent homes are coming up across the district, and homeowners want interior design that matches the quality of metro cities — without traveling to Hyderabad for every site visit.",
      'Houznext now serves Sangareddy town, Patancheru, Zaheerabad, Narayankhed, Jogipet, and surrounding areas. Whether you own a 2BHK in a new apartment, a 3BHK in a gated community, or an independent villa — we build it the same way: fixed price, on time, and tracked daily through LiveBuild.',
      'From modular kitchens and built-in wardrobes to false ceilings, TV units, study rooms, and pooja spaces — every part of your home is designed by a dedicated team and built in our quality-controlled workshop. Materials like Greenply plywood, Hettich hardware, Jaquar fittings, and Saint-Gobain glass are used as standard across every project.',
    ],
    testimonials: [
      { q: '"Patancheru industrial area is busy but Houznext managed our 3BHK interior without delays. Fixed price, great finishes, and LiveBuild kept us informed daily."', name: 'Vijay Kumar', info: '3BHK · Sangareddy town · Premium Package', initial: 'V' },
      { q: '"As a working couple we could not visit site often. LiveBuild photos every day were enough. Kitchen and wardrobes in Patancheru look premium."', name: 'Priya Reddy', info: '2BHK · Patancheru · Essential Package', initial: 'P' },
      { q: '"Zaheerabad villa project was large scope. Houznext coordinated everything — false ceiling, modular kitchen, wardrobes — in 55 days."', name: 'Mahesh Patil', info: '4BHK Villa · Zaheerabad · Luxury Package', initial: 'M' },
      { q: '"BOQ transparency was the deciding factor. Every material listed upfront. Narayankhed location was never an issue for their team."', name: 'Sunita Sharma', info: '3BHK · Narayankhed · Premium Package', initial: 'S' },
      { q: '"Soft-close Hettich everywhere. Site supervisor was professional and punctual. Sangareddy town 2BHK done in 41 days."', name: 'Ramesh Naidu', info: '2BHK · Sangareddy town · Premium Package', initial: 'R' },
      { q: '"Affordable Essential package for our Jogipet apartment. Clean work, on-time handover, no hidden costs."', name: 'Ashok Goud', info: '2BHK · Jogipet · Essential Package', initial: 'A' },
    ],
  },
  siddipet: {
    introParagraphs: [
      'Siddipet has seen remarkable infrastructure development in recent years, with widened roads, new layouts, and improved connectivity to Hyderabad making it a hotspot for both retired professionals and young families. The district headquarters and surrounding mandals like Gajwel are seeing steady growth in new apartment and independent home construction.',
      'Houznext now serves Siddipet town, Gajwel, Husnabad, Cheriyal, Dubbak, and surrounding areas. Whether you own a 2BHK in a new apartment, a 3BHK in a gated community, or an independent home — we build it the same way: fixed price, on time, and tracked daily through LiveBuild.',
      'From modular kitchens and built-in wardrobes to false ceilings, TV units, study rooms, and pooja spaces — every part of your home is designed by a dedicated team and built in our quality-controlled workshop. Materials like Greenply plywood, Hettich hardware, Jaquar fittings, and Saint-Gobain glass are used as standard across every project.',
    ],
    testimonials: [
      { q: '"Siddipet connectivity has improved so much — we wanted interiors to match. Houznext delivered our 3BHK in 44 days with excellent modular kitchen work."', name: 'Karthik Reddy', info: '3BHK · Siddipet town · Premium Package', initial: 'K' },
      { q: '"Gajwel is growing fast. Houznext team understood our budget and recommended Essential package. Finished on time with quality laminates."', name: 'Bhavani Devi', info: '2BHK · Gajwel · Essential Package', initial: 'B' },
      { q: '"Villa in Husnabad needed luxury finishes. LiveBuild tracking meant we never worried about progress while working in Hyderabad."', name: 'Suresh Goud', info: '4BHK Villa · Husnabad · Luxury Package', initial: 'S' },
      { q: '"Cheriyal project had detailed BOQ — no surprises at handover. Wardrobes and TV unit are standout features."', name: 'Kalyani Sharma', info: '3BHK · Cheriyal · Premium Package', initial: 'K' },
      { q: '"Professional site team, daily updates, fixed pricing. Siddipet town 2BHK completed in 40 days."', name: 'Mohan Naidu', info: '2BHK · Siddipet town · Premium Package', initial: 'M' },
      { q: '"Dubbak apartment — Essential package was value for money. ₹4.7L all-inclusive as promised."', name: 'Ravi Kumar', info: '2BHK · Dubbak · Essential Package', initial: 'R' },
    ],
  },
  adilabad: {
    introParagraphs: [
      'Adilabad — the northern gateway to Telangana — combines tribal heritage with growing urban infrastructure. With Mancherial and Bellampalli supporting strong industrial bases and Nirmal known for its furniture and arts heritage, homeowners across the district are looking for interior design partners who understand quality craftsmanship and deliver with accountability.',
      'Houznext now serves Adilabad town, Nirmal, Mancherial, Bellampalli, Bhainsa, and surrounding areas. Whether you own a 2BHK in a new apartment, a 3BHK in a gated community, or an independent home — we build it the same way: fixed price, on time, and tracked daily through LiveBuild.',
      'From modular kitchens and built-in wardrobes to false ceilings, TV units, study rooms, and pooja spaces — every part of your home is designed by a dedicated team and built in our quality-controlled workshop. Materials like Greenply plywood, Hettich hardware, Jaquar fittings, and Saint-Gobain glass are used as standard across every project.',
    ],
    testimonials: [
      { q: '"Adilabad town 3BHK — Houznext brought Hyderabad-quality interiors to our home. 45 days, fixed price, excellent modular kitchen."', name: 'Ramakrishna Rao', info: '3BHK · Adilabad town · Premium Package', initial: 'R' },
      { q: '"Nirmal is known for woodwork — Houznext matched that craftsmanship with modern modular design. Very satisfied with our 2BHK."', name: 'Padma Devi', info: '2BHK · Nirmal · Essential Package', initial: 'P' },
      { q: '"Mancherial villa project was complex. LiveBuild made remote monitoring easy. Luxury package finishes are outstanding."', name: 'Venkatesh Reddy', info: '4BHK Villa · Mancherial · Luxury Package', initial: 'V' },
      { q: '"Bellampalli industrial area — team was punctual and professional. BOQ matched final invoice exactly."', name: 'Saritha Naidu', info: '3BHK · Bellampalli · Premium Package', initial: 'S' },
      { q: '"WhatsApp updates daily. Adilabad town 2BHK wardrobes and kitchen are top notch."', name: 'Praveen Kumar', info: '2BHK · Adilabad town · Premium Package', initial: 'P' },
      { q: '"Bhainsa Essential package — affordable, on time, no compromises on plywood quality."', name: 'Sridhar Goud', info: '2BHK · Bhainsa · Essential Package', initial: 'S' },
    ],
  },
  suryapet: {
    introParagraphs: [
      'Suryapet sits at the crossroads of Hyderabad, Vijayawada, and Khammam — making it one of the most strategically located districts in Telangana. With the Hyderabad–Vijayawada expressway driving residential growth and Kodad emerging as an important commercial center, homeowners here want interior design that reflects the modern lifestyle they aspire to.',
      'Houznext now serves Suryapet town, Kodad, Huzurnagar, Tirumalagiri, Mothey, and surrounding areas. Whether you own a 2BHK in a new apartment, a 3BHK in a gated community, or an independent home — we build it the same way: fixed price, on time, and tracked daily through LiveBuild.',
      'From modular kitchens and built-in wardrobes to false ceilings, TV units, study rooms, and pooja spaces — every part of your home is designed by a dedicated team and built in our quality-controlled workshop. Materials like Greenply plywood, Hettich hardware, Jaquar fittings, and Saint-Gobain glass are used as standard across every project.',
    ],
    testimonials: [
      { q: '"Suryapet expressway corridor is booming. Houznext finished our 3BHK in 43 days — kitchen and wardrobes are exactly as designed in 3D."', name: 'Chandra Reddy', info: '3BHK · Suryapet town · Premium Package', initial: 'C' },
      { q: '"Kodad commercial growth meant we wanted modern interiors. Essential package delivered great value in 37 days."', name: 'Madhavi Sharma', info: '2BHK · Kodad · Essential Package', initial: 'M' },
      { q: '"Huzurnagar villa — luxury finishes throughout. LiveBuild portal was our window to the site every evening."', name: 'Vinod Goud', info: '4BHK Villa · Huzurnagar · Luxury Package', initial: 'V' },
      { q: '"Tirumalagiri 3BHK — transparent pricing, milestone payments, no stress. Highly recommend Houznext."', name: 'Sushma Devi', info: '3BHK · Tirumalagiri · Premium Package', initial: 'S' },
      { q: '"Suryapet town apartment — professional team, Hettich hardware, on-time delivery."', name: 'Anil Kumar', info: '2BHK · Suryapet town · Premium Package', initial: 'A' },
      { q: '"Mothey Essential package — ₹4.5L fixed. Parents are thrilled with the pooja room and kitchen."', name: 'Kishore Naidu', info: '2BHK · Mothey · Essential Package', initial: 'K' },
    ],
  },
}

export function getDefaultCityContent(slug: CitySlug): CityLandingContent {
  const meta = getCityMeta(slug)
  const overrides = CITY_OVERRIDES[slug]
  const areas = meta.surroundingAreas
  const testimonialHeader = sharedTestimonialsHeader(meta.name, areas)
  const faqHeader = sharedFaqHeader(meta.name)

  return {
    seo: baseSeo(meta.name, slug),
    hero: baseHero(meta.name),
    areaOptions: [...areas],
    footerDescription: `Buy Right. Build Strong. Design Beautiful. Fixed-price home interiors and live LiveBuild tracking for homeowners across Telangana, including ${meta.name} and surrounding areas.`,
    stats: SHARED_STATS.map((s) => ({ ...s })),
    intro: baseIntro(meta.name, overrides.introParagraphs),
    services: sharedServices(),
    process: sharedProcess(meta.name),
    pricing: sharedPricing(meta.name),
    projects: sharedProjects(),
    whyUs: sharedWhyUs(meta.name),
    testimonials: { ...testimonialHeader, items: overrides.testimonials },
    faq: { ...faqHeader, items: buildFaq(meta.name, areas) },
    cta: {
      title: `Ready to start your dream interiors in ${meta.name}?`,
      subtitle:
        'Chat with our design advisor on WhatsApp for a free consultation. No commitment, no obligation — just clarity on your home.',
      whatsappUrl: whatsappUrlForCity(meta.name),
    },
  }
}

export { CITY_LANDING_REGISTRY }
