import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { FeatureFlag } from '../entities/feature-flag.entity';
import { HeroSlide } from '../entities/hero-slide.entity';

async function seed() {
  await AppDataSource.initialize();
  console.log('Seeding database...');

  const flagRepo = AppDataSource.getRepository(FeatureFlag);
  const slideRepo = AppDataSource.getRepository(HeroSlide);

  // Admin user is created on app startup via ADMIN_EMAIL (see AdminBootstrapService)

  // Feature flags
  const flags = [
    { name: 'tax', isEnabled: false, description: 'Enable tax calculation on orders' },
    { name: 'maintenance_mode', isEnabled: false, description: 'Put store in maintenance mode' },
    { name: 'digital_products', isEnabled: true, description: 'Enable digital product sales' },
  ];

  for (const flag of flags) {
    const exists = await flagRepo.findOne({ where: { name: flag.name } });
    if (!exists) {
      await flagRepo.save(flagRepo.create(flag));
      console.log(`✓ Feature flag: ${flag.name}`);
    }
  }

  // Sample hero slide
  const slideExists = await slideRepo.count();
  if (slideExists === 0) {
    await slideRepo.save(
      slideRepo.create({
        headline: 'Welcome to Vill Shop',
        subtext: 'Quality products at great prices',
        ctaLabel: 'Shop Now',
        ctaUrl: '/products',
        sortOrder: 0,
        isActive: true,
      }),
    );
    console.log('✓ Hero slide created');
  }

  await AppDataSource.destroy();
  console.log('\nSeeding complete!');
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
