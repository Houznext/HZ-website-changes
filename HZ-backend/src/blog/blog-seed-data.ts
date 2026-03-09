import { BlogStatus, BlogType } from '../Enums/Blogs/blog';
import { CreateBlogDto } from './dto/blog.dto';

const UNSPLASH = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c',
  'https://images.unsplash.com/photo-1560448204-e42f0fb8fa4b',
  'https://images.unsplash.com/photo-1501594907352-04cda38ebc29',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3',
  'https://images.unsplash.com/photo-1501594907352-04cda38ebc29',
  'https://images.unsplash.com/photo-1560448204-e42f0fb8fa4b',
  'https://images.unsplash.com/photo-1501594907352-04cda38ebc29',
];

function img(i: number) {
  return UNSPLASH[i % UNSPLASH.length];
}

export const SEED_BLOGS: CreateBlogDto[] = [
  // ── Furniture (2) ──
  {
    title: 'How to Pick the Perfect Sofa for Your Living Room',
    previewDescription:
      'Choosing a sofa involves more than just colour. Learn how size, fabric, and frame quality determine long-term comfort and durability.',
    content: `<h2>Size Matters More Than Style</h2><p>Before browsing catalogues, measure your living room. A sofa that looked compact in the showroom can overwhelm a 12×14 ft room. Leave at least 18 inches of walkway on each side.</p><h2>Fabric &amp; Frame</h2><p>Hardwood frames (teak, sal) outlast engineered wood by years. For fabric, tightly-woven polyester blends resist stains better than pure cotton, making them ideal for homes with kids or pets.</p><p>Foam density above 32 kg/m³ keeps cushions from sagging within the first year. Always ask the retailer for the density spec before buying.</p>`,
    blogType: BlogType.Furniture,
    blogStatus: BlogStatus.Featured,
    thumbnailImageUrl: img(0),
    CoverImageUrl: img(1),
    externalResourceLink: null,
  },
  {
    title: 'Space-Saving Furniture Ideas for Compact Indian Homes',
    previewDescription:
      'Wall-mounted desks, murphy beds, and extendable dining tables—practical solutions for apartments under 800 sq ft.',
    content: `<h2>Think Vertical</h2><p>When floor space is tight, move storage upward. Floating shelves, tall bookcases, and loft beds free up valuable square footage without sacrificing functionality.</p><h2>Multi-Function Pieces</h2><p>A storage ottoman doubles as seating and a coffee table. A sofa-cum-bed eliminates the need for a guest room. Look for pieces that serve at least two purposes before committing.</p><p>Extendable dining tables that seat two daily but expand to six for gatherings are a staple in smart compact-home design.</p>`,
    blogType: BlogType.Furniture,
    blogStatus: BlogStatus.Regular,
    thumbnailImageUrl: img(2),
    CoverImageUrl: img(3),
    externalResourceLink: null,
  },

  // ── Interiors (2) ──
  {
    title: 'Colour Psychology: Picking the Right Palette for Every Room',
    previewDescription:
      'Blues calm the mind, yellows energise—here is a science-backed guide to choosing wall colours that actually affect how you feel at home.',
    content: `<h2>Bedrooms: Cool &amp; Muted</h2><p>Research from the University of Sussex shows soft blue and muted green walls help reduce heart rate, promoting better sleep. Avoid bright reds and oranges in spaces meant for rest.</p><h2>Kitchens &amp; Dining</h2><p>Warm yellows and terracotta tones stimulate appetite and conversation. A single accent wall in mustard can transform a neutral kitchen without overpowering the space.</p><p>For home offices, sage green improves focus while remaining easy on the eyes during long work sessions.</p>`,
    blogType: BlogType.Interiors,
    blogStatus: BlogStatus.Trending,
    thumbnailImageUrl: img(1),
    CoverImageUrl: img(4),
    externalResourceLink: null,
  },
  {
    title: 'Layered Lighting: The Secret to a Well-Designed Home',
    previewDescription:
      'Most homes rely on a single ceiling light per room. Learn how combining ambient, task, and accent layers creates warmth and depth.',
    content: `<h2>The Three-Layer Rule</h2><p>Professional designers never light a room with one fixture. Start with ambient light (ceiling or cove), add task lights (reading lamps, under-cabinet strips), then finish with accent lights (picture lights, LED niches).</p><h2>Practical Tips</h2><p>Use warm-white (2700–3000 K) for living and bedrooms, and neutral-white (4000 K) for kitchens and study areas. Dimmer switches on ambient lights let you shift mood without changing bulbs.</p>`,
    blogType: BlogType.Interiors,
    blogStatus: BlogStatus.Regular,
    thumbnailImageUrl: img(3),
    CoverImageUrl: img(0),
    externalResourceLink: null,
  },

  // ── Residential Construction (2) ──
  {
    title: 'Building a Home in India: A Realistic Timeline',
    previewDescription:
      'From land purchase to housewarming, most residential builds take 12–18 months. Here is a month-by-month breakdown so you can plan ahead.',
    content: `<h2>Months 1–3: Planning &amp; Approvals</h2><p>Hire an architect, finalise the floor plan, and apply for municipal building permission. Soil testing happens in this phase—expect 4–6 weeks for approvals depending on the city.</p><h2>Months 4–9: Structure</h2><p>Foundation, columns, slabs, and brickwork. Rain delays during monsoon can add 3–4 weeks; schedule concrete pours outside July–August if possible.</p><h2>Months 10–15: Finishing</h2><p>Plastering, electrical, plumbing, flooring, painting, and woodwork. This phase often overruns because material deliveries overlap. Build a 15 % time buffer into your plan.</p>`,
    blogType: BlogType.ResidentialConstruction,
    blogStatus: BlogStatus.Featured,
    thumbnailImageUrl: img(4),
    CoverImageUrl: img(2),
    externalResourceLink: null,
  },
  {
    title: 'How to Vet a Contractor Before Signing a Contract',
    previewDescription:
      'Asking for references is not enough. Use this checklist to verify licences, past projects, and financial health before handing over an advance.',
    content: `<h2>Verify Registration</h2><p>Every legitimate contractor should have a GST number and a registered firm. Ask for their PAN, GST certificate, and at least three completed-project references from the last two years.</p><h2>Visit a Live Site</h2><p>A polished portfolio can hide poor workmanship. Visit one of their ongoing projects unannounced—observe worker safety, material storage, and general site cleanliness.</p><p>Never pay more than 10 % as an advance. Structure payments milestone-wise: foundation done, slab cast, finishing started, and so on.</p>`,
    blogType: BlogType.ResidentialConstruction,
    blogStatus: BlogStatus.Regular,
    thumbnailImageUrl: img(0),
    CoverImageUrl: img(1),
    externalResourceLink: null,
  },

  // ── Construction for Business (1) ──
  {
    title: 'Designing a Modern Office Space on a Budget',
    previewDescription:
      'Open layouts, modular furniture, and smart HVAC choices can cut commercial fit-out costs by up to 30 % without compromising employee comfort.',
    content: `<h2>Open Plan Done Right</h2><p>Open offices save on partition costs, but acoustics suffer. Invest in ceiling baffles and desk-mounted screens instead of full-height glass cabins—you get privacy at a fraction of the cost.</p><h2>Modular Over Custom</h2><p>Modular workstations can be reconfigured when teams grow. Custom-built desks look premium but become a liability when you need to reorganise six months later.</p><p>For HVAC, VRF systems cost more upfront than split ACs but cut energy bills by 25–40 % in spaces above 2,000 sq ft.</p>`,
    blogType: BlogType.ConstructionForBusiness,
    blogStatus: BlogStatus.Trending,
    thumbnailImageUrl: img(2),
    CoverImageUrl: img(4),
    externalResourceLink: null,
  },

  // ── General (2) ──
  {
    title: 'Home Maintenance Checklist You Should Follow Every Year',
    previewDescription:
      'Neglecting small repairs leads to expensive fixes. A yearly routine covering plumbing, electrical, and exterior walls can save lakhs over a decade.',
    content: `<h2>Pre-Monsoon (April–May)</h2><p>Inspect the terrace for cracks, clean roof drains, and apply waterproofing paste on parapet joints. Check window seals and replace cracked putty to prevent leaks.</p><h2>Post-Monsoon (October)</h2><p>Look for damp patches on interior walls—they indicate seepage that worsens with each rain. Repaint affected areas with anti-fungal primer before applying finish coats.</p><h2>Year-Round</h2><p>Test RCCB/MCB switches quarterly. Flush water heaters to remove sediment. Lubricate door hinges and check for termite signs near wooden furniture every six months.</p>`,
    blogType: BlogType.General,
    blogStatus: BlogStatus.Featured,
    thumbnailImageUrl: img(3),
    CoverImageUrl: img(0),
    externalResourceLink: null,
  },
  {
    title: 'Renting vs Buying Your First Home: An Honest Comparison',
    previewDescription:
      'The "rent is wasted money" argument is overly simplistic. Here is a nuanced look at when renting makes more financial sense than buying.',
    content: `<h2>The Real Cost of Buying</h2><p>EMI is only part of the picture. Add registration (5–7 %), maintenance, property tax, and opportunity cost of the down payment. In high-value metros, renting the same flat costs 40–60 % less per month than an EMI.</p><h2>When Buying Wins</h2><p>If you plan to stay in one city for 7+ years, property appreciation and loan principal repayment build equity that rent never will. Tax benefits under Section 24 and 80C sweeten the deal further.</p><p>Run the numbers for your specific city and salary before deciding—there is no universal right answer.</p>`,
    blogType: BlogType.General,
    blogStatus: BlogStatus.Regular,
    thumbnailImageUrl: img(1),
    CoverImageUrl: img(2),
    externalResourceLink: null,
  },

  // ── Custom Builder (2) ──
  {
    title: 'What to Expect When You Hire a Custom Home Builder',
    previewDescription:
      'Custom builds offer freedom but demand involvement. From design review meetings to material approvals, here is what your weekly commitment looks like.',
    content: `<h2>Design Phase</h2><p>Expect 4–6 meetings with the architect to finalise the floor plan. Bring a Pinterest board or reference images—it communicates preferences far better than verbal descriptions.</p><h2>During Construction</h2><p>Plan to visit the site at least once a week. Key decision points—tile selection, kitchen layout, electrical outlet placement—arise on short notice. Delays happen when the owner is unreachable.</p><p>A good custom builder provides a weekly photo update and a shared spreadsheet tracking budget vs actual spend per line item.</p>`,
    blogType: BlogType.CustomBuilder,
    blogStatus: BlogStatus.Featured,
    thumbnailImageUrl: img(4),
    CoverImageUrl: img(3),
    externalResourceLink: null,
  },
  {
    title: 'Budgeting Realistically for a Custom-Built Home',
    previewDescription:
      'Most custom projects exceed the initial estimate by 15–25 %. Here is how to set a realistic budget with built-in buffers.',
    content: `<h2>The 80/20 Rule</h2><p>Allocate 80 % of your budget to the construction estimate and keep 20 % as a contingency. Unforeseen rock during excavation, design change requests, and material price hikes are almost guaranteed.</p><h2>Where Money Hides</h2><p>External development (compound wall, gate, landscaping) and utility connections (electricity transformer, borewell, sewage) are often quoted separately. Ask your builder for an all-inclusive scope to avoid surprises.</p>`,
    blogType: BlogType.CustomBuilder,
    blogStatus: BlogStatus.Regular,
    thumbnailImageUrl: img(0),
    CoverImageUrl: img(4),
    externalResourceLink: null,
  },

  // ── Paints (1) ──
  {
    title: 'Interior Paint Finishes: Matte, Satin, or Gloss?',
    previewDescription:
      'Each finish has trade-offs between looks and durability. This guide helps you pick the right one for every room.',
    content: `<h2>Matte</h2><p>Hides wall imperfections beautifully but scuffs easily. Best for ceilings and low-traffic rooms like formal living areas.</p><h2>Satin / Eggshell</h2><p>The sweet spot for most Indian homes. Wipeable, slightly reflective, and forgiving on textured plaster. Ideal for bedrooms, hallways, and dining rooms.</p><h2>Semi-Gloss &amp; Gloss</h2><p>Highly durable and moisture-resistant—perfect for kitchens, bathrooms, and window trims. The shine highlights imperfections, so surface prep is critical.</p>`,
    blogType: BlogType.Paints,
    blogStatus: BlogStatus.Trending,
    thumbnailImageUrl: img(2),
    CoverImageUrl: img(1),
    externalResourceLink: null,
  },

  // ── Electronics (2) ──
  {
    title: 'Setting Up a Smart Home in India: A Beginner\'s Guide',
    previewDescription:
      'You don\'t need to rewire your house. Wi-Fi-based smart switches, bulbs, and plugs let you automate almost anything for under ₹15,000.',
    content: `<h2>Start Small</h2><p>Replace two or three switches with Wi-Fi smart switches (₹800–1,200 each). Control lights, fans, and geysers from your phone or with voice via Alexa/Google Home.</p><h2>Build Gradually</h2><p>Add a smart doorbell, a robot vacuum, or automated curtains once you are comfortable with the app ecosystem. Avoid mixing too many brands—stick to one platform (Tuya, Smartlife, or Apple HomeKit) for reliability.</p><p>A stable 5 GHz Wi-Fi network is the backbone. Invest in a good mesh router if your home is above 1,200 sq ft.</p>`,
    blogType: BlogType.Electronics,
    blogStatus: BlogStatus.Featured,
    thumbnailImageUrl: img(3),
    CoverImageUrl: img(0),
    externalResourceLink: null,
  },
  {
    title: 'Inverter AC vs Non-Inverter: Which One Should You Buy?',
    previewDescription:
      'Inverter ACs cost 20–30 % more upfront but save significantly on electricity. Here is a practical comparison for Indian weather.',
    content: `<h2>How Inverter Tech Works</h2><p>A non-inverter compressor runs at full speed, switches off when the room cools, then restarts—consuming a power surge each time. An inverter compressor adjusts speed continuously, maintaining temperature without the stop-start cycle.</p><h2>Real-World Savings</h2><p>For 8 hours of daily use over 6 summer months, a 1.5-ton inverter AC saves ₹3,000–5,000 per year compared to a non-inverter. The extra upfront cost typically pays for itself in 2–3 years.</p><p>If you use AC only occasionally (weekends or a few hours at night), a non-inverter model may still make financial sense.</p>`,
    blogType: BlogType.Electronics,
    blogStatus: BlogStatus.Regular,
    thumbnailImageUrl: img(1),
    CoverImageUrl: img(4),
    externalResourceLink: null,
  },

  // ── Vaastu Consultation (1) ──
  {
    title: 'Vaastu Tips You Can Apply Without Structural Changes',
    previewDescription:
      'Already built your home? These non-invasive Vaastu adjustments use furniture placement, colours, and mirrors to improve energy flow.',
    content: `<h2>Entrance Enhancements</h2><p>Keep the main entrance well-lit and clutter-free. A nameplate and a clean doormat are considered auspicious. Avoid placing a mirror directly facing the front door—it is believed to push positive energy back out.</p><h2>Bedroom Adjustments</h2><p>Position the bed so your head points south or east while sleeping. If the bed faces a toilet wall, place a wooden partition or a tall bookshelf as a buffer.</p><p>Add indoor plants in the north-east corner of your living room for freshness and positive energy. Money plants and bamboo are popular low-maintenance choices.</p>`,
    blogType: BlogType.VaastuConsultation,
    blogStatus: BlogStatus.Regular,
    thumbnailImageUrl: img(4),
    CoverImageUrl: img(2),
    externalResourceLink: null,
  },

  // ── Civil Engineering (2) ──
  {
    title: 'Why Soil Testing Is Non-Negotiable Before Construction',
    previewDescription:
      'A ₹5,000 soil test can prevent foundation failures that cost lakhs to fix. Here is what engineers look for and how it affects your building design.',
    content: `<h2>What Is Tested</h2><p>Soil bearing capacity, water table level, and soil classification (clay, silt, sand, rock). These three parameters determine whether your foundation will be a simple strip footing or an expensive raft or pile system.</p><h2>Real Consequences</h2><p>Black cotton soil expands when wet and shrinks when dry, causing cracks in walls if the foundation isn't designed for it. Ignoring this is the single most common cause of structural distress in central and western India.</p><p>Always insist on a test report from a NABL-accredited lab, not a verbal assurance from the contractor.</p>`,
    blogType: BlogType.CivilEngineering,
    blogStatus: BlogStatus.Featured,
    thumbnailImageUrl: img(0),
    CoverImageUrl: img(3),
    externalResourceLink: null,
  },
  {
    title: 'Understanding RCC: The Backbone of Modern Indian Buildings',
    previewDescription:
      'Reinforced Cement Concrete is used in almost every urban building. Learn the basics of mix design, steel placement, and curing that determine structural life.',
    content: `<h2>Mix Design Basics</h2><p>M20 grade concrete (1:1.5:3 ratio) is standard for residential slabs and beams. Higher grades like M25 or M30 are used for columns and foundations where loads are concentrated.</p><h2>Steel Placement</h2><p>Rebar must maintain a minimum cover of 25 mm in slabs and 40 mm in columns to protect against corrosion. Improper cover is a silent defect—it won't show for years but leads to spalling and rust stains later.</p><p>Curing for at least 7 days (ideally 14) by keeping surfaces wet is critical. Under-cured concrete can lose up to 30 % of its designed strength.</p>`,
    blogType: BlogType.CivilEngineering,
    blogStatus: BlogStatus.Regular,
    thumbnailImageUrl: img(2),
    CoverImageUrl: img(1),
    externalResourceLink: null,
  },

  // ── Plumbing (1) ──
  {
    title: 'CPVC vs PPR Pipes: Which Plumbing System Suits Your Home?',
    previewDescription:
      'Both are popular for hot and cold water lines, but they differ in jointing method, cost, and long-term reliability. Here is an objective comparison.',
    content: `<h2>CPVC (Solvent-Welded)</h2><p>Joints are fused with solvent cement—quick, no special tools needed. CPVC handles temperatures up to 93 °C and is widely available across India. Downside: joints are permanent; repairs mean cutting and re-joining.</p><h2>PPR (Heat-Fused)</h2><p>Joints are welded with a heating tool, creating a seamless bond stronger than the pipe itself. PPR lasts 50+ years and is preferred in premium builds. However, the fusion machine and fittings cost more.</p><p>For budget-conscious residential projects, CPVC is the pragmatic choice. For long-term durability with zero leak risk, PPR is worth the premium.</p>`,
    blogType: BlogType.Plumbing,
    blogStatus: BlogStatus.Trending,
    thumbnailImageUrl: img(3),
    CoverImageUrl: img(4),
    externalResourceLink: null,
  },

  // ── Solar (2) ──
  {
    title: 'Is Rooftop Solar Worth It in India? A Cost-Benefit Analysis',
    previewDescription:
      'With government subsidies covering up to 40 %, a 3 kW rooftop system can pay for itself in 4–5 years. Here are the real numbers.',
    content: `<h2>Upfront Cost</h2><p>A 3 kW on-grid system costs ₹1.8–2.2 lakh before subsidy. Under the PM Surya Ghar scheme, you can get ₹78,000 back for a 3 kW system, bringing the effective cost to ₹1–1.4 lakh.</p><h2>Monthly Savings</h2><p>A 3 kW system generates ~12 units/day (360 units/month) in most Indian cities. At ₹8 per unit, that is ₹2,880/month or ₹34,500/year in savings. Payback period: 3–4 years after subsidy.</p><p>After payback, you get essentially free electricity for the remaining 20+ years of panel life. Net metering lets you sell excess units back to the grid in most states.</p>`,
    blogType: BlogType.Solar,
    blogStatus: BlogStatus.Featured,
    thumbnailImageUrl: img(4),
    CoverImageUrl: img(0),
    externalResourceLink: null,
  },
  {
    title: 'On-Grid vs Off-Grid vs Hybrid Solar: Which System Do You Need?',
    previewDescription:
      'Each solar setup has distinct pros and cons depending on your power backup needs and local net-metering policy.',
    content: `<h2>On-Grid (No Battery)</h2><p>Cheapest option. Excess power goes to the grid, and you get credits on your bill. Downside: no backup during power cuts since the inverter shuts off for safety.</p><h2>Off-Grid (Full Battery)</h2><p>Complete energy independence—great for remote areas without reliable grid supply. Batteries add ₹80,000–1.5 lakh to the cost and need replacement every 5–8 years (lead-acid) or 10–15 years (lithium).</p><h2>Hybrid</h2><p>Best of both worlds: grid-tied with a small battery bank for essential loads during outages. Costs 20–30 % more than on-grid but gives peace of mind in areas with frequent power cuts.</p>`,
    blogType: BlogType.Solar,
    blogStatus: BlogStatus.Regular,
    thumbnailImageUrl: img(1),
    CoverImageUrl: img(2),
    externalResourceLink: null,
  },

  // ── Home Decors (2) ──
  {
    title: 'Indoor Plants That Thrive in Indian Apartments',
    previewDescription:
      'Low light, irregular watering, and hot summers—these hardy plants survive Indian apartment conditions with minimal care.',
    content: `<h2>Top Picks</h2><p><strong>Snake Plant (Sansevieria):</strong> Tolerates low light and weeks without water. Releases oxygen at night, making it ideal for bedrooms.</p><p><strong>Money Plant (Pothos):</strong> Grows in soil or water, thrives in indirect light. Perfect for shelves and hanging baskets.</p><p><strong>ZZ Plant:</strong> Almost indestructible. Handles neglect, low light, and air-conditioned rooms without complaint.</p><h2>Care Basics</h2><p>Overwatering kills more indoor plants than underwatering. Stick your finger 2 inches into the soil—if it is dry, water. If damp, wait. Use pots with drainage holes to prevent root rot.</p>`,
    blogType: BlogType.HomeDecors,
    blogStatus: BlogStatus.Trending,
    thumbnailImageUrl: img(0),
    CoverImageUrl: img(3),
    externalResourceLink: null,
  },
  {
    title: 'How to Use Mirrors to Make Small Rooms Feel Bigger',
    previewDescription:
      'Strategically placed mirrors create an illusion of depth and amplify natural light. Here are five placement tricks designers use.',
    content: `<h2>Opposite a Window</h2><p>Place a large mirror directly across from the biggest window in the room. It reflects daylight deep into the space, reducing the need for artificial lighting during the day.</p><h2>Behind Furniture</h2><p>A floor-length mirror behind a console table or sofa creates the illusion of the room extending beyond the wall. This works especially well in narrow hallways and compact living rooms.</p><p>Avoid placing mirrors where they reflect clutter—you will double the visual chaos. Keep the reflected view clean: a window, a plant, or an art piece.</p>`,
    blogType: BlogType.HomeDecors,
    blogStatus: BlogStatus.Regular,
    thumbnailImageUrl: img(2),
    CoverImageUrl: img(4),
    externalResourceLink: null,
  },

  // ── Earth Mover (1) ──
  {
    title: 'Hiring Earthmoving Equipment: What You Need to Know',
    previewDescription:
      'JCBs, excavators, and tippers—how to choose the right machine, negotiate rates, and avoid hidden costs on your construction site.',
    content: `<h2>Match Machine to Job</h2><p>A backhoe loader (JCB) handles most residential excavation and levelling. For deep basement digs or rocky soil, a hydraulic excavator (Hitachi/Komatsu) is faster and more powerful but costs ₹3,000–5,000/hour vs ₹1,500–2,500/hour for a JCB.</p><h2>Negotiate Smart</h2><p>Daily rates (8 hours) are cheaper per hour than hourly hiring. Ask whether diesel is included in the quoted rate—it often isn't, and fuel can add ₹4,000–6,000/day.</p><p>Always get the operator's experience details. An inexperienced operator on a tight residential plot can damage boundary walls, underground pipes, or neighbouring structures.</p>`,
    blogType: BlogType.EarthMover,
    blogStatus: BlogStatus.Regular,
    thumbnailImageUrl: img(3),
    CoverImageUrl: img(1),
    externalResourceLink: null,
  },

  // ── Real Estate (2) ──
  {
    title: 'First-Time Home Buyer\'s Checklist for India',
    previewDescription:
      'From RERA verification to loan pre-approval, this 10-point checklist ensures you don\'t miss a critical step in your home-buying journey.',
    content: `<h2>Before You Search</h2><p>1. Check your CIBIL score (aim for 750+). 2. Get a loan pre-approval letter—it tells you exactly how much you can borrow. 3. Fix a budget that includes registration (5–7 %), GST (if under-construction), and interior fit-out costs.</p><h2>During the Search</h2><p>4. Verify the project's RERA registration number on your state's RERA website. 5. Check the builder's past delivery track record. 6. Visit the site at different times of day to assess noise, traffic, and natural light.</p><h2>Before Signing</h2><p>7. Read the agreement of sale clause by clause—especially penalty and delay compensation terms. 8. Verify the title deed goes back at least 30 years. 9. Confirm parking, maintenance deposit, and handover timeline in writing. 10. Budget 1–2 % of property value for legal and documentation fees.</p>`,
    blogType: BlogType.RealEstate,
    blogStatus: BlogStatus.Featured,
    thumbnailImageUrl: img(4),
    CoverImageUrl: img(0),
    externalResourceLink: null,
  },
  {
    title: 'Why Tier-2 Cities Are the New Real Estate Hotspots',
    previewDescription:
      'Jaipur, Lucknow, Indore, and Coimbatore are seeing 15–25 % year-on-year price growth. Here is what is driving demand.',
    content: `<h2>Work-From-Home Effect</h2><p>Remote work decoupled income from location. Professionals earning metro salaries now prefer spacious homes in tier-2 cities where ₹50 lakh buys a 3 BHK villa instead of a 1 BHK flat.</p><h2>Infrastructure Push</h2><p>Expressways, metro rail, and new airports are shrinking the distance to metros. Jaipur-Delhi (via expressway) is now under 4 hours; Coimbatore has direct flights to 20+ cities.</p><p>Rental yields in tier-2 cities (3–5 %) outperform metro yields (1.5–2.5 %), making them attractive for investors seeking cash flow alongside appreciation.</p>`,
    blogType: BlogType.RealEstate,
    blogStatus: BlogStatus.Trending,
    thumbnailImageUrl: img(1),
    CoverImageUrl: img(3),
    externalResourceLink: null,
  },
];
