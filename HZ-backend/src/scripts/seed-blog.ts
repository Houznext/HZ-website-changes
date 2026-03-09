/**
 * Seed script: Create 6 blog posts per category (90 total across 15 categories).
 * Run: npm run seed:blog
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.development') });
dotenv.config({ path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`) });

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { BlogService } from '../blog/blog.service';
import { BlogStatus, BlogType } from '../Enums/Blogs/blog';
import { CreateBlogDto } from '../blog/dto/blog.dto';

const PLACEHOLDER_THUMB = 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29';
const PLACEHOLDER_COVER = 'https://images.unsplash.com/photo-1560448204-e42f0fb8fa4b';

type SeedPost = {
  title: string;
  previewDescription: string;
  content: string;
  blogStatus: BlogStatus;
};

const BLOG_TEMPLATES: Record<BlogType, SeedPost[]> = {
  [BlogType.Furniture]: [
    { title: 'Modern Sofa Styles for 2025', previewDescription: 'Explore trending sofa designs.', content: '<p>Discover the latest sofa trends including modular, L-shaped, and minimalist designs that transform your living space.</p>', blogStatus: BlogStatus.Featured },
    { title: 'Wood vs Metal Furniture', previewDescription: 'Compare material choices.', content: '<p>Understand the pros and cons of wood versus metal furniture for durability, aesthetics, and maintenance.</p>', blogStatus: BlogStatus.Trending },
    { title: 'Space-Saving Furniture Ideas', previewDescription: 'Maximize small spaces.', content: '<p>Smart furniture solutions for compact homes: foldable tables, storage beds, and multi-functional pieces.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Eco-Friendly Furniture Brands', previewDescription: 'Sustainable choices.', content: '<p>Top brands offering recycled, reclaimed, and sustainably sourced furniture for eco-conscious homeowners.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Custom Wardrobe Design Tips', previewDescription: 'Tailored storage solutions.', content: '<p>Plan the perfect custom wardrobe: dimensions, materials, and organization features that fit your needs.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Dining Table Selection Guide', previewDescription: 'Find your ideal table.', content: '<p>Size, shape, material—how to choose the perfect dining table for your family and space.</p>', blogStatus: BlogStatus.Regular },
  ],
  [BlogType.Interiors]: [
    { title: 'Minimalist Interior Design Principles', previewDescription: 'Less is more.', content: '<p>Key principles of minimalist design: decluttering, neutral palettes, and purposeful furnishings.</p>', blogStatus: BlogStatus.Featured },
    { title: 'Color Psychology in Home Design', previewDescription: 'Colors that influence mood.', content: '<p>How different colors affect mood and energy—choose the right palette for each room.</p>', blogStatus: BlogStatus.Trending },
    { title: 'Lighting Makes the Space', previewDescription: 'Layered lighting tips.', content: '<p>Combine ambient, task, and accent lighting for a warm, functional, and inviting home.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Mixing Traditional and Modern', previewDescription: 'Fusion interior styles.', content: '<p>Blend classic elements with contemporary pieces for a unique, timeless look.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Small Apartment Interior Ideas', previewDescription: 'Maximize every square foot.', content: '<p>Creative ways to make compact apartments feel spacious and stylish.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Texture and Material Layering', previewDescription: 'Add depth to rooms.', content: '<p>Use textiles, wood, stone, and metal to create visual interest and comfort.</p>', blogStatus: BlogStatus.Regular },
  ],
  [BlogType.ResidentialConstruction]: [
    { title: 'New Home Construction Timeline', previewDescription: 'What to expect.', content: '<p>Typical phases of residential construction from foundation to handover.</p>', blogStatus: BlogStatus.Featured },
    { title: 'Choosing the Right Builder', previewDescription: 'Vetting contractors.', content: '<p>How to research, compare, and select a reliable residential builder.</p>', blogStatus: BlogStatus.Trending },
    { title: 'Construction Permits Explained', previewDescription: 'Navigate approvals.', content: '<p>Understanding building permits, inspections, and local regulations.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Foundation Types for Indian Homes', previewDescription: 'Stable foundations.', content: '<p>Shallow vs deep foundations—when to use each for Indian soil conditions.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Cost Per Sq Ft: Realistic Estimates', previewDescription: 'Budget planning.', content: '<p>Current construction costs per sq ft for different finishes and regions.</p>', blogStatus: BlogStatus.Regular },
    { title: 'RCC vs Load-Bearing Construction', previewDescription: 'Structural choices.', content: '<p>Pros and cons of reinforced concrete versus load-bearing brick construction.</p>', blogStatus: BlogStatus.Regular },
  ],
  [BlogType.ConstructionForBusiness]: [
    { title: 'Commercial Building Design Trends', previewDescription: 'Modern workspaces.', content: '<p>Flexible layouts, wellness features, and sustainability in commercial construction.</p>', blogStatus: BlogStatus.Featured },
    { title: 'Warehouse Construction Essentials', previewDescription: 'Industrial builds.', content: '<p>Key considerations for warehouse design: loading docks, clear height, and utilities.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Retail Space Fit-Out Guide', previewDescription: 'Store buildouts.', content: '<p>Planning retail interiors for foot traffic, displays, and brand identity.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Office Building Compliance', previewDescription: 'Codes and standards.', content: '<p>Fire safety, accessibility, and environmental norms for commercial buildings.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Industrial Shed Construction', previewDescription: 'Metal and RCC sheds.', content: '<p>Prefab vs traditional industrial shed construction—cost and timeline comparison.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Mixed-Use Development Tips', previewDescription: 'Residential + commercial.', content: '<p>How to plan mixed-use projects for better ROI and community value.</p>', blogStatus: BlogStatus.Regular },
  ],
  [BlogType.General]: [
    { title: 'Home Maintenance Checklist 2025', previewDescription: 'Stay on top of upkeep.', content: '<p>Seasonal and annual tasks to keep your home in top condition.</p>', blogStatus: BlogStatus.Featured },
    { title: 'Moving to a New Home: Tips', previewDescription: 'Smooth relocation.', content: '<p>Packing, hiring movers, and settling into a new space efficiently.</p>', blogStatus: BlogStatus.Trending },
    { title: 'Pet-Friendly Home Modifications', previewDescription: 'Comfort for pets.', content: '<p>Flooring, storage, and safety tweaks for homes with pets.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Rental vs Own Home: Pros and Cons', previewDescription: 'Make an informed choice.', content: '<p>Financial and lifestyle factors when deciding to rent or buy.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Seasonal Home Preparations', previewDescription: 'Weather-proofing.', content: '<p>Prepare for monsoon, summer, and winter to protect your home.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Green Living at Home', previewDescription: 'Eco-friendly habits.', content: '<p>Simple changes for energy saving, waste reduction, and sustainable living.</p>', blogStatus: BlogStatus.Regular },
  ],
  [BlogType.CustomBuilder]: [
    { title: 'Custom Home Design Process', previewDescription: 'From concept to keys.', content: '<p>Step-by-step journey of designing and building a custom home.</p>', blogStatus: BlogStatus.Featured },
    { title: 'Architect vs Builder: Who Does What', previewDescription: 'Roles clarified.', content: '<p>When you need an architect, a builder, or both for your project.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Site Selection for Custom Homes', previewDescription: 'Choose land wisely.', content: '<p>Soil, orientation, utilities, and regulations—what to check before buying.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Bespoke Interior Fit-Outs', previewDescription: 'Tailored finishes.', content: '<p>Custom millwork, built-ins, and unique finishes for one-of-a-kind spaces.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Budgeting for Custom Builds', previewDescription: 'Realistic planning.', content: '<p>Buffer for contingencies, design changes, and premium materials.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Timeline for Custom Construction', previewDescription: 'Expect delays.', content: '<p>Typical duration for custom projects and how to minimize delays.</p>', blogStatus: BlogStatus.Regular },
  ],
  [BlogType.Paints]: [
    { title: 'Interior Paint Finishes Explained', previewDescription: 'Matte, satin, gloss.', content: '<p>Which finish suits which room—durability, washability, and aesthetics.</p>', blogStatus: BlogStatus.Featured },
    { title: 'Eco-Friendly Paints in India', previewDescription: 'Low-VOC options.', content: '<p>Brands and products with minimal toxins for healthier indoor air.</p>', blogStatus: BlogStatus.Trending },
    { title: 'Exterior Paint Maintenance', previewDescription: 'Protect your walls.', content: '<p>When to repaint, how to prep, and products that last in Indian climate.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Popular Wall Color Trends 2025', previewDescription: 'On-trend palettes.', content: '<p>Neutrals, earth tones, and accent colors dominating this year.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Textured Paint Techniques', previewDescription: 'Add dimension.', content: '<p>Venetian plaster, suede, and other textured finishes for feature walls.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Primer: Why It Matters', previewDescription: 'Don\'t skip primer.', content: '<p>How primer improves adhesion, coverage, and longevity of paint jobs.</p>', blogStatus: BlogStatus.Regular },
  ],
  [BlogType.Electronics]: [
    { title: 'Smart Home Automation Basics', previewDescription: 'Start with basics.', content: '<p>Lights, thermostats, and voice assistants—entry-level smart home setup.</p>', blogStatus: BlogStatus.Featured },
    { title: 'Energy-Efficient Appliances', previewDescription: 'Save on bills.', content: '<p>Star ratings, inverter tech, and choosing efficient ACs, refrigerators, and more.</p>', blogStatus: BlogStatus.Trending },
    { title: 'Home Theater Setup Guide', previewDescription: 'Cinema at home.', content: '<p>TV vs projector, soundbars vs surround—build your ideal setup.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Inverter vs Generator', previewDescription: 'Backup power.', content: '<p>Which backup solution suits your home and load requirements.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Cable Management Tips', previewDescription: 'Tidy wiring.', content: '<p>Conceal and organize cables for a clean, professional look.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Kitchen Appliances Must-Haves', previewDescription: 'Essential gadgets.', content: '<p>Microwave, mixer, air fryer—prioritize what you really need.</p>', blogStatus: BlogStatus.Regular },
  ],
  [BlogType.VaastuConsultation]: [
    { title: 'Vaastu Basics for New Homes', previewDescription: 'Foundation principles.', content: '<p>Direction, placement of rooms, and main door—fundamental Vaastu guidelines.</p>', blogStatus: BlogStatus.Featured },
    { title: 'Vaastu Remedies for Existing Homes', previewDescription: 'Adjustments you can make.', content: '<p>Simple corrections without major structural changes.</p>', blogStatus: BlogStatus.Trending },
    { title: 'Kitchen Placement in Vaastu', previewDescription: 'Agni and nourishment.', content: '<p>Ideal direction and layout for kitchen as per Vaastu.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Bedroom Vaastu Tips', previewDescription: 'Rest and harmony.', content: '<p>Bed position, head direction, and colors for peaceful sleep.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Office Vaastu for Prosperity', previewDescription: 'Workplace balance.', content: '<p>Desk placement, entrance, and décor for positive work energy.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Vaastu for Apartments', previewDescription: 'When you can\'t change structure.', content: '<p>Working within constraints of flats and high-rises.</p>', blogStatus: BlogStatus.Regular },
  ],
  [BlogType.CivilEngineering]: [
    { title: 'Soil Testing Before Construction', previewDescription: 'Know your land.', content: '<p>Why soil tests matter and what engineers look for.</p>', blogStatus: BlogStatus.Featured },
    { title: 'Structural Design Basics', previewDescription: 'Load and safety.', content: '<p>How structural engineers ensure buildings can bear loads safely.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Foundation Design for Different Soils', previewDescription: 'Match foundation to soil.', content: '<p>Shallow, pile, and raft foundations—when to use each.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Reinforcement in RCC', previewDescription: 'Steel in concrete.', content: '<p>Types of rebar, spacing, and cover—basics of RCC design.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Slab Types: One-Way vs Two-Way', previewDescription: 'Choosing the right slab.', content: '<p>Understanding slab behavior and selection for spans.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Earthquake-Resistant Design', previewDescription: 'Seismic safety.', content: '<p>Principles of ductile design and base isolation for seismic zones.</p>', blogStatus: BlogStatus.Regular },
  ],
  [BlogType.Plumbing]: [
    { title: 'Modern Plumbing Materials', previewDescription: 'CPVC, PEX, and more.', content: '<p>Which pipes suit hot, cold, and sewage—durability and cost.</p>', blogStatus: BlogStatus.Featured },
    { title: 'Water Heater Selection Guide', previewDescription: 'Geyser options.', content: '<p>Storage vs instant, gas vs electric—choose the right water heater.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Common Plumbing Issues and Fixes', previewDescription: 'DIY troubleshooting.', content: '<p>Leaks, clogs, low pressure—when to fix yourself vs call a plumber.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Bathroom Plumbing Layout', previewDescription: 'Plan for efficiency.', content: '<p>Optimal placement of fixtures for functionality and maintenance.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Rainwater Harvesting at Home', previewDescription: 'Sustainable water use.', content: '<p>Basic setup for collecting and reusing rainwater.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Sewage and Drainage Design', previewDescription: 'Proper disposal.', content: '<p>Septic tanks, soak pits, and municipal connections—what you need.</p>', blogStatus: BlogStatus.Regular },
  ],
  [BlogType.Solar]: [
    { title: 'Solar Panels for Homes', previewDescription: 'Going off-grid or hybrid.', content: '<p>On-grid, off-grid, and hybrid solar systems—what suits your need.</p>', blogStatus: BlogStatus.Featured },
    { title: 'Solar Subsidies in India 2025', previewDescription: 'Govt incentives.', content: '<p>Central and state subsidies, net metering, and payback period.</p>', blogStatus: BlogStatus.Trending },
    { title: 'Roof Solar Installation Steps', previewDescription: 'From survey to switch-on.', content: '<p>Site assessment, design, permits, and installation process.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Solar Inverter Types', previewDescription: 'String vs microinverter.', content: '<p>Pros and cons of different inverter technologies.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Battery Backup for Solar', previewDescription: 'Store excess energy.', content: '<p>Lithium vs lead-acid, sizing, and when battery makes sense.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Maintaining Solar Systems', previewDescription: 'Keep output high.', content: '<p>Cleaning, monitoring, and when to get professional checks.</p>', blogStatus: BlogStatus.Regular },
  ],
  [BlogType.HomeDecors]: [
    { title: 'Wall Art and Mirrors', previewDescription: 'Reflect and decorate.', content: '<p>How to use art and mirrors to add depth and personality to walls.</p>', blogStatus: BlogStatus.Featured },
    { title: 'Indoor Plants for Beginners', previewDescription: 'Easy-to-grow greens.', content: '<p>Low-maintenance plants that thrive in Indian homes.</p>', blogStatus: BlogStatus.Trending },
    { title: 'Curtains and Blinds Guide', previewDescription: 'Window treatments.', content: '<p>Fabrics, styles, and automation for privacy and light control.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Rugs and Carpets', previewDescription: 'Warmth underfoot.', content: '<p>Sizes, materials, and placement for living and bedroom.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Candles and Fragrances', previewDescription: 'Ambiance at home.', content: '<p>Creating a calming atmosphere with scent and soft light.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Seasonal Décor Swaps', previewDescription: 'Refresh for festivals.', content: '<p>Quick changes for Diwali, Christmas, and other occasions.</p>', blogStatus: BlogStatus.Regular },
  ],
  [BlogType.EarthMover]: [
    { title: 'Earthwork Basics for Construction', previewDescription: 'Excavation and filling.', content: '<p>When you need earthwork, types of equipment, and cost factors.</p>', blogStatus: BlogStatus.Featured },
    { title: 'JCB vs Mini Excavator', previewDescription: 'Equipment choice.', content: '<p>Which machine fits residential vs commercial projects.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Site Grading Explained', previewDescription: 'Level the land.', content: '<p>Why grading matters and how it affects drainage and foundation.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Soil Compaction', previewDescription: 'Solid foundations.', content: '<p>Importance of compaction and how it\'s tested on site.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Hiring Earth Moving Equipment', previewDescription: 'Rent vs own.', content: '<p>Daily rates, operator costs, and what to clarify before hiring.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Land Clearing for New Build', previewDescription: 'Prep the site.', content: '<p>Removing vegetation, debris, and leveling for construction start.</p>', blogStatus: BlogStatus.Regular },
  ],
  [BlogType.RealEstate]: [
    { title: 'First-Time Home Buyer Tips', previewDescription: 'Your guide to buying.', content: '<p>Documentation, loans, and what to check before signing for your first home.</p>', blogStatus: BlogStatus.Featured },
    { title: 'Resale vs Under-Construction', previewDescription: 'Which to choose.', content: '<p>Pros and cons of buying resale vs under-construction properties.</p>', blogStatus: BlogStatus.Trending },
    { title: 'Property Investment in Tier-2 Cities', previewDescription: 'Emerging markets.', content: '<p>Growth potential, yields, and risks of investing in smaller cities.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Home Loan Eligibility', previewDescription: 'Maximize your approval.', content: '<p>Income, credit score, and documents that affect loan approval.</p>', blogStatus: BlogStatus.Regular },
    { title: 'RERA: What Buyers Must Know', previewDescription: 'Protect your rights.', content: '<p>Key provisions of RERA and how they benefit homebuyers.</p>', blogStatus: BlogStatus.Regular },
    { title: 'Property Registration Process', previewDescription: 'From agreement to deed.', content: '<p>Stamp duty, registration charges, and steps to complete ownership transfer.</p>', blogStatus: BlogStatus.Regular },
  ],
};

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const blogService = app.get(BlogService);

  console.log('Seeding blogs...');

  let created = 0;
  for (const blogType of Object.keys(BLOG_TEMPLATES) as BlogType[]) {
    const posts = BLOG_TEMPLATES[blogType];
    if (!posts) continue;
    for (const post of posts) {
      const dto: CreateBlogDto = {
        title: post.title,
        previewDescription: post.previewDescription,
        content: post.content,
        blogType,
        blogStatus: post.blogStatus,
        thumbnailImageUrl: PLACEHOLDER_THUMB,
        CoverImageUrl: PLACEHOLDER_COVER,
        externalResourceLink: null,
      };
      try {
        await blogService.create(dto);
        created++;
        console.log(`Created: ${post.title} (${blogType})`);
      } catch (err: any) {
        console.error(`Failed ${post.title}:`, err?.message || err);
      }
    }
  }

  console.log(`Blog seed complete. Created ${created} posts.`);
  await app.close();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
