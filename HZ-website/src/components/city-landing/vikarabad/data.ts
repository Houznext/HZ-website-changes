export const VIKARABAD_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Houznext Interiors — Vikarabad',
  description:
    'Fixed-price home interior designers serving Vikarabad. 2BHK, 3BHK and villa interiors with 45-day delivery and 10-year warranty.',
  image: 'https://houznext.com/og-home.jpg',
  url: 'https://houznext.com/interior-designers-in-vikarabad',
  telephone: '+91-9759750770',
  areaServed: {
    '@type': 'City',
    name: 'Vikarabad',
    containedInPlace: {
      '@type': 'AdministrativeArea',
      name: 'Telangana',
    },
  },
  priceRange: '₹4.5L – ₹18L',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '680',
  },
}

export const CITY_LINKS = [
  { label: 'Vikarabad', href: '/interior-designers-in-vikarabad' },
  { label: 'Mahabubnagar', href: '/interior-designers-in-mahabubnagar' },
  { label: 'Sangareddy', href: '/interior-designers-in-sangareddy' },
  { label: 'Siddipet', href: '/interior-designers-in-siddipet' },
  { label: 'Adilabad', href: '/interior-designers-in-adilabad' },
  { label: 'Suryapet', href: '/interior-designers-in-suryapet' },
]

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Design Ideas', href: '/design-ideas' },
  { label: 'LiveBuild', href: '/buildlive' },
  { label: 'About', href: '/about-us' },
]

export const MOB_NAV_LINKS = [
  ...NAV_LINKS,
  { label: 'Contact', href: '/contact-us' },
]

export const HERO_TRUST = [
  '45-day delivery',
  'Fixed-price quote',
  '10-year warranty',
  '4.8★ rating',
]

export const STATS = [
  { n: '15+', l: 'Homes Delivered', s: 'Across Telangana' },
  { n: '4.8★', l: 'Average Rating', s: '680+ verified reviews' },
  { n: '45d', l: 'Avg. Delivery', s: 'Fastest in market' },
  { n: '100%', l: 'Fixed-Price', s: 'Zero surprises' },
]

export const PROPERTY_TYPES = ['2BHK', '3BHK', 'Villa / 4BHK+', 'Independent home']

export const AREA_OPTIONS = [
  'Vikarabad town',
  'Tandur',
  'Parigi',
  'Kodangal',
  'Other',
]

export const SERVICES = [
  {
    title: 'Full Home Interiors',
    desc: 'Complete turnkey interior solutions for 2BHK, 3BHK, and villa homes. Includes design, fabrication, installation and finishing for every room.',
    meta: 'From ₹4.5L · 45-day delivery',
    iconBg: '#e8f1fd',
    iconColor: '#2f80ed',
    icon: 'home',
  },
  {
    title: 'Modular Kitchens',
    desc: 'L-shaped, parallel, U-shaped or island modular kitchens with soft-close hardware, granite/quartz counters, and BWP plywood carcass.',
    meta: 'From ₹1.2L · 18-day delivery',
    iconBg: '#fef3c7',
    iconColor: '#d97706',
    icon: 'grid',
  },
  {
    title: 'Wardrobes & Storage',
    desc: 'Sliding, hinged, or walk-in wardrobes with custom internals. BWR/BWP ply with laminate, acrylic, or PU finishes — designed to fit your room.',
    meta: 'From ₹35K · 12-day delivery',
    iconBg: '#dcfce7',
    iconColor: '#16a34a',
    icon: 'wardrobe',
  },
  {
    title: 'False Ceiling & Lighting',
    desc: 'Gypsum and POP false ceilings with cove lighting, profile lights, chandeliers, and smart lighting controls. Designed for ambient and task lighting.',
    meta: 'From ₹85/sqft · 8-day work',
    iconBg: '#f3e8ff',
    iconColor: '#7c3aed',
    icon: 'ceiling',
  },
  {
    title: 'TV Units & Wall Panels',
    desc: 'Wall-mounted, floor-standing, or floating TV units with hidden storage. Decorative wall panels in PVC, laminate, MDF, or wood veneer finishes.',
    meta: 'From ₹45K · 10-day work',
    iconBg: '#fce7f3',
    iconColor: '#be185d',
    icon: 'tv',
  },
  {
    title: 'Painting & Wallpapers',
    desc: 'Asian Paints, Berger, Nerolac shades with putty + primer + 2 coat finish. Premium wallpapers in vinyl, fabric, and textured options also available.',
    meta: 'From ₹22/sqft · 6-day work',
    iconBg: '#ccfbf1',
    iconColor: '#0d9488',
    icon: 'paint',
  },
]

export const PROCESS_STEPS = [
  {
    n: '01',
    title: 'Free Consultation',
    desc: 'Call or WhatsApp our Vikarabad team. We discuss your vision, space, family needs, and budget — no commitment required.',
  },
  {
    n: '02',
    title: '3D Design',
    desc: 'Our designers create photorealistic 3D designs for every room. You can see your home before any work begins. Revisions are free.',
  },
  {
    n: '03',
    title: 'Approval & BOQ',
    desc: 'Review and approve designs online. You receive a detailed BOQ with every material brand, quantity, and cost listed transparently.',
  },
  {
    n: '04',
    title: 'Execution & Tracking',
    desc: 'Our skilled team begins work at your home. LiveBuild gives you daily photo updates, room-wise progress, and milestone-linked payments.',
  },
]

export const PRICING = [
  {
    name: 'Essential',
    amount: '₹4.5L',
    from: 'onwards for 2BHK · all-inclusive',
    popular: false,
    features: [
      'Plywood: BWP / BWR Greenply',
      'Finish: Laminate (matte/glossy)',
      'Inner laminate: 0.8mm',
      'Outer laminate: 1mm',
      'Kitchen: laminate finish',
      'Wardrobes: laminate, simple handles',
      'Hardware: Ebco, Nimmi (non soft close)',
      '10-year workmanship warranty',
    ],
  },
  {
    name: 'Premium',
    amount: '₹7.5L',
    from: 'onwards for 2BHK · all-inclusive',
    popular: true,
    features: [
      'Wood: Plywood / HDHMR board',
      'Brand: Century / Greenply',
      'Finish: Laminates + partial acrylic',
      'Inner laminate: 1mm thickness',
      'Acrylic: 1.5mm or 2mm thickness',
      'Kitchen: modular, soft-close channels',
      'Wardrobes: sliding or hinged',
      'Hardware: Hettich / Ebco (soft close)',
    ],
  },
  {
    name: 'Luxury',
    amount: '₹13L',
    from: 'onwards for 2BHK · all-inclusive',
    popular: false,
    features: [
      'Wood: Plywood / HDHMR board',
      'Brand: Century / Greenply',
      'Finish: Acrylic / PU polish / Veneer',
      'Inner laminate fabric: 0.8mm',
      'Outer laminate: 1mm',
      'Acrylic: 1.5mm or 2mm',
      'Kitchen: high-gloss acrylic',
      'Hardware: Hettich / Hafele (all soft close)',
    ],
  },
]

export const PROJECTS = [
  { img: 1, pkg: 'Premium', days: '42 days', meta: '3BHK Apartment', title: "Rajesh's Family Home", loc: 'Vikarabad town', cost: '₹8.2L' },
  { img: 2, pkg: 'Essential', days: '38 days', meta: '2BHK Apartment', title: "Anita's Home", loc: 'Tandur', cost: '₹4.8L' },
  { img: 3, pkg: 'Luxury', days: '56 days', meta: '4BHK Villa', title: "Srinivas's Villa", loc: 'Vikarabad outskirts', cost: '₹22.5L' },
  { img: 4, pkg: 'Premium', days: '44 days', meta: '3BHK Independent', title: "Lakshmi's Home", loc: 'Parigi', cost: '₹9.6L' },
  { img: 5, pkg: 'Premium', days: '40 days', meta: '2BHK Apartment', title: "Naveen's Home", loc: 'Vikarabad town', cost: '₹7.8L' },
  { img: 6, pkg: 'Essential', days: '36 days', meta: '2BHK Apartment', title: "Pradeep's Home", loc: 'Kodangal', cost: '₹4.6L' },
]

export const WHY_US = [
  { title: 'Complete transparency', desc: 'Your quote is your final invoice. Every material brand, quantity, and cost is documented in your BOQ and visible in your LiveBuild portal.', icon: 'info' },
  { title: '40-point quality process', desc: 'Every project goes through 40+ documented quality checks — from plywood ISI mark verification to shutter alignment to final punch list.', icon: 'check' },
  { title: 'On-time delivery', desc: 'We commit to delivery timelines in writing. Average project completes in 45 days. Delays are tracked, explained, and accounted for — never hidden.', icon: 'clock' },
  { title: 'Milestone-based payments', desc: '4-stage payments linked to actual site progress. Pay as work gets done — not upfront. Zero-cost EMI available through partner banks and NBFCs.', icon: 'card' },
  { title: 'Always reachable', desc: 'Your assigned designer responds in under 2 hours. Your site supervisor updates you daily on LiveBuild. We are always one WhatsApp away.', icon: 'chat' },
  { title: '10-year warranty', desc: 'All workmanship is covered for 10 years. Material warranties from Greenply, Hettich, Jaquar, Saint-Gobain — all documented and stored in your portal forever.', icon: 'shield' },
]

export const TESTIMONIALS = [
  { q: '"We had heard of Houznext through a friend in Hyderabad. When they confirmed they serve Vikarabad too, we booked the consultation right away. Our 3BHK was delivered in 42 days, exactly as promised. The fixed pricing meant no last-minute shocks."', name: 'Rajesh Reddy', info: '3BHK · Vikarabad · Premium Package', initial: 'R' },
  { q: '"The 3D designs were beautiful — exactly how my kitchen turned out in real life. The team was respectful of our family time, worked Monday to Saturday, and finished my 2BHK in 38 days. Very happy with the workmanship."', name: 'Anita Sharma', info: '2BHK · Tandur · Essential Package', initial: 'A' },
  { q: '"For our villa, we wanted luxury but also accountability. Houznext gave us both. LiveBuild let me check site progress every evening after work. The acrylic kitchen and PU wardrobe finishing came out stunning. Worth every rupee."', name: 'Srinivas Goud', info: '4BHK Villa · Vikarabad · Luxury Package', initial: 'S' },
  { q: '"What impressed us most was the BOQ document. Every single material — plywood brand, laminate code, hardware model — was listed with quantities and prices. No hidden charges, no upselling during execution. Truly professional."', name: 'Lakshmi Devi', info: '3BHK · Parigi · Premium Package', initial: 'L' },
  { q: '"I was nervous about hiring someone from outside Vikarabad. But Houznext\'s local site supervisor was here daily, and the WhatsApp updates were continuous. My modular kitchen and wardrobes are top quality. Hettich soft-close everywhere."', name: 'Naveen Kumar', info: '2BHK · Vikarabad · Premium Package', initial: 'N' },
  { q: '"Budget was a big concern. The Essential package was perfect for our needs — clean laminate finishes, good plywood, all the basics done right. ₹4.6L final invoice, exactly as quoted. Now planning to upgrade my parents\' home with the same team."', name: 'Pradeep Yadav', info: '2BHK · Kodangal · Essential Package', initial: 'P' },
]

export const FAQS = [
  { q: 'What is the cost of 2BHK home interiors in Vikarabad?', a: 'Houznext 2BHK interior packages in Vikarabad start from ₹4.5 lakhs (Essential) and go up to ₹18 lakhs (Luxury) — fixed price, all-inclusive. The exact cost depends on which package you choose, the size of your apartment, and how many rooms need interior work. Most 2BHK homes in Vikarabad fall in the ₹4.5L–₹8L range.' },
  { q: 'How long does a home interior project take in Vikarabad?', a: 'A standard 2BHK takes around 35–45 days from design approval to handover. A 3BHK takes 45–55 days. Villas take 55–70 days depending on scope. We commit to your timeline in writing in the BOQ, and you can track every day of progress through LiveBuild — including photos, milestone status, and any delays with reasons.' },
  { q: 'Do you charge anything extra after the initial quote?', a: 'No. The price in your BOQ is the final invoice. If you change your mind mid-project and want to add or modify scope, we issue a written change order and you approve it before any extra work begins. Most homeowners\' final invoice matches their original quote to the rupee.' },
  { q: 'Which areas of Vikarabad district do you serve?', a: 'We serve Vikarabad town, Tandur, Parigi, Kodangal, Pargi, Bashirabad, and other major locations across Vikarabad district. If you\'re in a remote location, we\'ll still send our team — site visits and material transport are coordinated from our Hyderabad workshop, which is well-connected to Vikarabad via the Hyderabad-Bijapur road.' },
  { q: 'What is LiveBuild and how does it help me?', a: 'LiveBuild is Houznext\'s proprietary project tracking portal. You log in from your phone or laptop and see daily photo updates from your site, room-by-room progress percentages, milestone payment status, design approvals, and any queries raised. It\'s especially useful for homeowners in Vikarabad whose property might be far from where they work — you never need to make a long site visit just to check progress.' },
  { q: 'Do you offer EMI or financing options?', a: 'Yes. We have partnerships with leading banks and NBFCs including HDFC, ICICI, Bajaj Finserv, and Tata Capital to offer zero-cost EMI options for 3–24 months on most interior packages. Our payments themselves are milestone-based across 4 stages, so you only pay as work progresses — never upfront.' },
  { q: 'What materials and brands do you use?', a: 'Standard across all our packages: Greenply / Century plywood (ISI marked), Hettich / Ebco hardware (soft-close), Jaquar bathroom fittings, Saint-Gobain mirrors and glass, Asian Paints / Berger paints, and laminates from Greenlam, Merino, or Royale Touche. Every material is listed in your BOQ with the exact brand and model number.' },
  { q: 'What is your warranty policy?', a: 'All Houznext workmanship comes with a 10-year warranty covering joinery, hinges, alignment, finishing defects, and structural integrity of all built-in furniture. Manufacturer warranties on hardware (Hettich, Ebco), appliances, and electrical fittings are passed through separately. All warranty documents are stored in your LiveBuild portal permanently.' },
]

export const WHATSAPP_URL =
  'https://wa.me/919759750770?text=Hi%20Houznext%2C%20I%20want%20a%20free%20consultation%20for%20Vikarabad'
