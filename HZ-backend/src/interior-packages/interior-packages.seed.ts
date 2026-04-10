import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../../db/datasource';
import { InteriorPackage } from './entities/interior-package.entity';

// Run manually: npx ts-node src/interior-packages/interior-packages.seed.ts
export const DEFAULT_PACKAGES = [
  {
    name: 'Essential',
    price: '₹4.5L',
    suffix: 'onwards',
    color: '#5a6a7e',
    features: [
      'Modular kitchen',
      'Wardrobes',
      'False ceiling',
      'TV unit',
      '1-yr warranty',
    ],
    highlighted: false,
    sortOrder: 0,
    isActive: true,
    bhkType: null,
  },
  {
    name: 'Premium',
    price: '₹7.5L',
    suffix: 'onwards',
    color: '#2f80ed',
    features: [
      'Everything in Essential',
      'Wall panelling',
      'Study unit',
      'Crockery unit',
      'BuildLive tracking',
    ],
    highlighted: true,
    sortOrder: 1,
    isActive: true,
    bhkType: null,
  },
  {
    name: 'Luxury',
    price: '₹13L',
    suffix: 'onwards',
    color: '#f2994a',
    features: [
      'Italian lacquer finishes',
      'Walk-in wardrobe',
      'Smart lighting',
      'Full furniture package',
      '2-yr warranty',
    ],
    highlighted: false,
    sortOrder: 2,
    isActive: true,
    bhkType: null,
  },
];

async function runSeed() {
  const ds = new DataSource({
    ...dataSourceOptions,
    entities: [InteriorPackage],
  });

  await ds.initialize();
  try {
    const repo = ds.getRepository(InteriorPackage);
    const count = await repo.count();
    if (count === 0) {
      for (const pkg of DEFAULT_PACKAGES) {
        await repo.save(repo.create(pkg));
      }
      // eslint-disable-next-line no-console
      console.log('Interior packages seeded.');
    } else {
      // eslint-disable-next-line no-console
      console.log('Interior package table is not empty. Seed skipped.');
    }
  } finally {
    await ds.destroy();
  }
}

if (require.main === module) {
  runSeed().catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  });
}
