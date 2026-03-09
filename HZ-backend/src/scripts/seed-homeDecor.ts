/**
 * Seed script: Create 2 home decor items per category (54 total).
 * Run: npm run seed:homeDecor
 */
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env before any other imports that need DB config
dotenv.config({ path: path.resolve(process.cwd(), '.env.development') });
dotenv.config({ path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`) });

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { HomeDecorService } from '../homeDecors/homeDecors.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { HomeDecorsCategory } from '../homeDecors/enum/homeDecors.enum';
import { CreateHomeDecoreDto } from '../homeDecors/dto/homeDecor.dto';

const PLACEHOLDER_IMG = '';

const SEED_ITEMS: Array<{
  name: string;
  category: HomeDecorsCategory;
  price: number;
  discount: number;
  prodDetails: string;
  design: string;
  color: string;
  shape: string;
  brand: string;
}> = [
  // New Arrivals - 2
  { name: 'Contemporary Ceramic Vase', category: HomeDecorsCategory.NewArrivals, price: 1299, discount: 10, prodDetails: 'Handcrafted ceramic vase.', design: 'Modern', color: 'Terracotta', shape: 'Cylindrical', brand: 'HomeStyle' },
  { name: 'Boho Wall Hanging', category: HomeDecorsCategory.NewArrivals, price: 899, discount: 5, prodDetails: 'Macrame wall decor.', design: 'Bohemian', color: 'Natural', shape: 'Irregular', brand: 'DecoArt' },
  // Wall Shelves - 2
  { name: 'Floating Wood Shelf', category: HomeDecorsCategory.WallShelves, price: 1999, discount: 15, prodDetails: 'Mountable wooden shelf.', design: 'Minimalist', color: 'Oak', shape: 'Rectangle', brand: 'Urban Ladder' },
  { name: 'Metal Display Shelf', category: HomeDecorsCategory.WallShelves, price: 2499, discount: 10, prodDetails: 'Industrial-style metal shelf.', design: 'Industrial', color: 'Black', shape: 'Rectangle', brand: 'HomeTown' },
  // Baskets - 2
  { name: 'Woven Storage Basket', category: HomeDecorsCategory.Baskets, price: 699, discount: 8, prodDetails: 'Handwoven storage basket.', design: 'Rustic', color: 'Natural', shape: 'Round', brand: 'Craftsman' },
  { name: 'Seagrass Basket Set', category: HomeDecorsCategory.Baskets, price: 1499, discount: 12, prodDetails: 'Set of 3 seagrass baskets.', design: 'Coastal', color: 'Beige', shape: 'Oval', brand: 'Nature Home' },
  // Photo Frame - 2
  { name: 'Wooden Photo Frame 8x10', category: HomeDecorsCategory.PhotoFrame, price: 499, discount: 5, prodDetails: 'Classic wooden frame.', design: 'Classic', color: 'Walnut', shape: 'Rectangle', brand: 'FrameCo' },
  { name: 'Collage Photo Frame', category: HomeDecorsCategory.PhotoFrame, price: 1299, discount: 10, prodDetails: 'Multi-photo collage frame.', design: 'Modern', color: 'White', shape: 'Square', brand: 'Memory Lane' },
  // Wall Mirrors - 2
  { name: 'Round Decorative Mirror', category: HomeDecorsCategory.WallMirrors, price: 2499, discount: 15, prodDetails: 'Gold-finished round mirror.', design: 'Decorative', color: 'Gold', shape: 'Round', brand: 'MirrorCraft' },
  { name: 'Full Length Mirror', category: HomeDecorsCategory.WallMirrors, price: 3499, discount: 10, prodDetails: 'Leaner floor mirror.', design: 'Minimal', color: 'Black', shape: 'Rectangle', brand: 'Reflect' },
  // Wall Art and Paintings - 2
  { name: 'Abstract Canvas Print', category: HomeDecorsCategory.WallartAndPaintings, price: 1999, discount: 20, prodDetails: 'Gallery-wrapped canvas art.', design: 'Abstract', color: 'Multi', shape: 'Rectangle', brand: 'ArtSpace' },
  { name: 'Botanical Illustration', category: HomeDecorsCategory.WallartAndPaintings, price: 1599, discount: 12, prodDetails: 'Floral botanical print.', design: 'Botanical', color: 'Green', shape: 'Square', brand: 'Green Art' },
  // Figurines - 2
  { name: 'Brass Elephant Figurine', category: HomeDecorsCategory.Figurines, price: 899, discount: 8, prodDetails: 'Handcrafted brass elephant.', design: 'Traditional', color: 'Brass', shape: 'Figure', brand: 'Craft India' },
  { name: 'Ceramic Buddha Statue', category: HomeDecorsCategory.Figurines, price: 1299, discount: 10, prodDetails: 'Peaceful Buddha figurine.', design: 'Zen', color: 'White', shape: 'Figure', brand: 'Serenity' },
  // Miniatures - 2
  { name: 'Vintage Car Miniature', category: HomeDecorsCategory.Miniatures, price: 599, discount: 5, prodDetails: 'Die-cast miniature car.', design: 'Vintage', color: 'Red', shape: 'Figure', brand: 'Collectible' },
  { name: 'House Model Miniature', category: HomeDecorsCategory.Miniatures, price: 799, discount: 10, prodDetails: 'Architectural house model.', design: 'Modern', color: 'White', shape: 'House', brand: 'Mini World' },
  // Pots and Plants - 2
  { name: 'Terracotta Plant Pot Set', category: HomeDecorsCategory.PotsAndPlants, price: 999, discount: 12, prodDetails: 'Set of 3 terracotta pots.', design: 'Classic', color: 'Terracotta', shape: 'Round', brand: 'Garden Co' },
  { name: 'Ceramic Succulent Planter', category: HomeDecorsCategory.PotsAndPlants, price: 649, discount: 8, prodDetails: 'Small succulent planter.', design: 'Modern', color: 'Mint', shape: 'Round', brand: 'PlantLove' },
  // Artificial Plants - 2
  { name: 'Faux Monstera Plant', category: HomeDecorsCategory.ArtificalPlantsAndFlowers, price: 1499, discount: 15, prodDetails: 'Lifelike artificial monstera.', design: 'Realistic', color: 'Green', shape: 'Natural', brand: 'FauxFlora' },
  { name: 'Artificial Tulip Bouquet', category: HomeDecorsCategory.ArtificalPlantsAndFlowers, price: 899, discount: 10, prodDetails: 'Colorful silk tulips.', design: 'Elegant', color: 'Pink', shape: 'Bouquet', brand: 'Forever Flowers' },
  // Plant Stand - 2
  { name: 'Metal Plant Stand', category: HomeDecorsCategory.PlantStand, price: 1299, discount: 10, prodDetails: 'Tiered metal plant stand.', design: 'Industrial', color: 'Black', shape: 'Tiered', brand: 'Stand Up' },
  { name: 'Wooden Plant Rack', category: HomeDecorsCategory.PlantStand, price: 1899, discount: 12, prodDetails: '3-tier wooden rack.', design: 'Scandinavian', color: 'Natural', shape: 'Ladder', brand: 'Wood & Green' },
  // Hanging Planters - 2
  { name: 'Macrame Hanging Planter', category: HomeDecorsCategory.HangingPlanters, price: 799, discount: 15, prodDetails: 'Macrame with ceramic pot.', design: 'Bohemian', color: 'Natural', shape: 'Round', brand: 'Hang Green' },
  { name: 'Geometric Hanging Planter', category: HomeDecorsCategory.HangingPlanters, price: 1099, discount: 8, prodDetails: 'Metal geometric planter.', design: 'Geometric', color: 'Copper', shape: 'Hexagon', brand: 'GeoPlant' },
  // Gardening - 2
  { name: 'Garden Tool Set', category: HomeDecorsCategory.Gardening, price: 1499, discount: 10, prodDetails: 'Essential gardening tools.', design: 'Practical', color: 'Green', shape: 'Set', brand: 'GardenPro' },
  { name: 'Decorative Garden Gnome', category: HomeDecorsCategory.Gardening, price: 499, discount: 5, prodDetails: 'Classic garden gnome.', design: 'Classic', color: 'Red', shape: 'Figure', brand: 'Garden Fun' },
  // Festive Decor - 2
  { name: 'Diwali Diya Set', category: HomeDecorsCategory.FestiveDecor, price: 699, discount: 15, prodDetails: 'Brass diya set for festivals.', design: 'Traditional', color: 'Brass', shape: 'Round', brand: 'Festive Joy' },
  { name: 'Christmas Ornament Set', category: HomeDecorsCategory.FestiveDecor, price: 899, discount: 20, prodDetails: 'Hand-painted ornaments.', design: 'Festive', color: 'Multi', shape: 'Various', brand: 'Holiday Home' },
  // Candles - 2
  { name: 'Scented Soy Candle', category: HomeDecorsCategory.Candles, price: 649, discount: 10, prodDetails: 'Lavender scented candle.', design: 'Minimal', color: 'White', shape: 'Cylinder', brand: 'CandleCo' },
  { name: 'Decorative Pillar Candle', category: HomeDecorsCategory.Candles, price: 449, discount: 5, prodDetails: 'Unscented pillar candle.', design: 'Classic', color: 'Ivory', shape: 'Cylinder', brand: 'Light & Glow' },
  // Decor Gift Sets - 2
  { name: 'Home Spa Gift Set', category: HomeDecorsCategory.DecorGiftSets, price: 1999, discount: 15, prodDetails: 'Candles and diffuser set.', design: 'Luxury', color: 'Pink', shape: 'Box', brand: 'GiftBox' },
  { name: 'Tea Lovers Gift Set', category: HomeDecorsCategory.DecorGiftSets, price: 1299, discount: 12, prodDetails: 'Tea set with infuser.', design: 'Elegant', color: 'White', shape: 'Set', brand: 'TeaTime' },
  // Tableware - 2
  { name: 'Ceramic Dinner Plates Set', category: HomeDecorsCategory.Tableware, price: 1499, discount: 10, prodDetails: 'Set of 6 ceramic plates.', design: 'Contemporary', color: 'White', shape: 'Round', brand: 'Table Art' },
  { name: 'Salad Bowl Set', category: HomeDecorsCategory.Tableware, price: 999, discount: 8, prodDetails: 'Set of 3 nesting bowls.', design: 'Minimal', color: 'Grey', shape: 'Round', brand: 'Kitchen Style' },
  // Dinner Set - 2
  { name: '20-Piece Dinner Set', category: HomeDecorsCategory.DinnerSet, price: 2999, discount: 15, prodDetails: 'Complete ceramic dinner set.', design: 'Classic', color: 'White', shape: 'Set', brand: 'DineWell' },
  { name: 'Stoneware Dinner Set', category: HomeDecorsCategory.DinnerSet, price: 4499, discount: 12, prodDetails: 'Premium stoneware set.', design: 'Modern', color: 'Grey', shape: 'Set', brand: 'Stone Craft' },
  // Coffee Mugs - 2
  { name: 'Ceramic Coffee Mug', category: HomeDecorsCategory.CoffeeMugs, price: 349, discount: 10, prodDetails: '350ml ceramic mug.', design: 'Minimal', color: 'Navy', shape: 'Cylinder', brand: 'Brew Cup' },
  { name: 'Insulated Travel Mug', category: HomeDecorsCategory.CoffeeMugs, price: 599, discount: 8, prodDetails: 'Double-wall insulated.', design: 'Practical', color: 'Black', shape: 'Cylinder', brand: 'StayHot' },
  // Serving Trays - 2
  { name: 'Wooden Serving Tray', category: HomeDecorsCategory.ServingTrays, price: 1299, discount: 12, prodDetails: 'Handcrafted wooden tray.', design: 'Rustic', color: 'Teak', shape: 'Rectangle', brand: 'Serve Well' },
  { name: 'Marble Cheese Board', category: HomeDecorsCategory.ServingTrays, price: 1899, discount: 10, prodDetails: 'Marble serving board.', design: 'Luxury', color: 'White', shape: 'Rectangle', brand: 'Marble Home' },
  // Teapots - 2
  { name: 'Ceramic Teapot', category: HomeDecorsCategory.Teapots, price: 899, discount: 10, prodDetails: '1L ceramic teapot.', design: 'Classic', color: 'Blue', shape: 'Round', brand: 'Tea House' },
  { name: 'Glass Teapot with Infuser', category: HomeDecorsCategory.Teapots, price: 1199, discount: 15, prodDetails: 'Borosilicate glass teapot.', design: 'Modern', color: 'Clear', shape: 'Round', brand: 'See Steep' },
  // Glassware - 2
  { name: 'Wine Glass Set', category: HomeDecorsCategory.Glassware, price: 999, discount: 10, prodDetails: 'Set of 4 wine glasses.', design: 'Elegant', color: 'Clear', shape: 'Tulip', brand: 'Vino Glass' },
  { name: 'Tumbler Glass Set', category: HomeDecorsCategory.Glassware, price: 699, discount: 8, prodDetails: 'Set of 6 tumblers.', design: 'Classic', color: 'Clear', shape: 'Cylinder', brand: 'DrinkWell' },
  // Clocks - 2
  { name: 'Wall Clock Modern', category: HomeDecorsCategory.Clocks, price: 1499, discount: 12, prodDetails: 'Minimalist wall clock.', design: 'Modern', color: 'Black', shape: 'Round', brand: 'TickTock' },
  { name: 'Desk Clock', category: HomeDecorsCategory.Clocks, price: 799, discount: 8, prodDetails: 'Compact desk clock.', design: 'Minimal', color: 'White', shape: 'Square', brand: 'Time Craft' },
  // Home Temples - 2
  { name: 'Wooden Home Temple', category: HomeDecorsCategory.HomeTemples, price: 2499, discount: 10, prodDetails: 'Handcrafted puja mandir.', design: 'Traditional', color: 'Sheesham', shape: 'Arch', brand: 'Divine Home' },
  { name: 'Wall Mount Temple', category: HomeDecorsCategory.HomeTemples, price: 1899, discount: 12, prodDetails: 'Space-saving wall temple.', design: 'Modern', color: 'White', shape: 'Rectangle', brand: 'Sacred Space' },
  // Trays - 2
  { name: 'Bamboo Breakfast Tray', category: HomeDecorsCategory.Trays, price: 899, discount: 10, prodDetails: 'Lightweight bamboo tray.', design: 'Natural', color: 'Natural', shape: 'Rectangle', brand: 'Bamboo Co' },
  { name: 'Metal Decorative Tray', category: HomeDecorsCategory.Trays, price: 1299, discount: 8, prodDetails: 'Brass decorative tray.', design: 'Decorative', color: 'Brass', shape: 'Oval', brand: 'Metal Craft' },
  // Home Fragrances - 2
  { name: 'Reed Diffuser Set', category: HomeDecorsCategory.HomeFragrances, price: 999, discount: 15, prodDetails: 'Lavender reed diffuser.', design: 'Elegant', color: 'Clear', shape: 'Cylinder', brand: 'Scent Home' },
  { name: 'Room Spray', category: HomeDecorsCategory.HomeFragrances, price: 449, discount: 8, prodDetails: 'Fresh linen room spray.', design: 'Simple', color: 'White', shape: 'Cylinder', brand: 'Fresh Air' },
  // Flower Pot and Vases - 2
  { name: 'Glass Flower Vase', category: HomeDecorsCategory.FlowerPotAndVases, price: 699, discount: 10, prodDetails: 'Tall glass vase.', design: 'Modern', color: 'Clear', shape: 'Cylinder', brand: 'Vase Co' },
  { name: 'Ceramic Flower Pot', category: HomeDecorsCategory.FlowerPotAndVases, price: 549, discount: 8, prodDetails: 'Decorative flower pot.', design: 'Classic', color: 'Terracotta', shape: 'Round', brand: 'Pot Style' },
  // Vases - 2
  { name: 'Bud Vase Set', category: HomeDecorsCategory.Vases, price: 799, discount: 12, prodDetails: 'Set of 3 bud vases.', design: 'Minimal', color: 'White', shape: 'Cylinder', brand: 'Vase Art' },
  { name: 'Decorative Ceramic Vase', category: HomeDecorsCategory.Vases, price: 1299, discount: 10, prodDetails: 'Artistic ceramic vase.', design: 'Artistic', color: 'Blue', shape: 'Asymmetric', brand: 'Art Vase' },
  // Wall Hanging - 2
  { name: 'Metal Wall Art', category: HomeDecorsCategory.WallHanging, price: 1599, discount: 15, prodDetails: 'Abstract metal wall sculpture.', design: 'Abstract', color: 'Gold', shape: 'Abstract', brand: 'Metal Art' },
  { name: 'Jute Wall Hanging', category: HomeDecorsCategory.WallHanging, price: 899, discount: 10, prodDetails: 'Handcrafted jute decor.', design: 'Natural', color: 'Natural', shape: 'Round', brand: 'Jute Craft' },
  // Wallpapers and Decals - 2
  { name: 'Peel & Stick Wallpaper', category: HomeDecorsCategory.WallpapersAndDecals, price: 1499, discount: 20, prodDetails: 'Removable wallpaper roll.', design: 'Botanical', color: 'Green', shape: 'Roll', brand: 'Wall Art' },
  { name: 'Wall Decal Sticker', category: HomeDecorsCategory.WallpapersAndDecals, price: 499, discount: 15, prodDetails: 'Quote wall decal.', design: 'Typography', color: 'Black', shape: 'Various', brand: 'Decal Co' },
  // Fountains - 2
  { name: 'Tabletop Water Fountain', category: HomeDecorsCategory.Fountains, price: 2499, discount: 12, prodDetails: 'Zen table fountain.', design: 'Zen', color: 'Stone', shape: 'Cascade', brand: 'Flow Home' },
  { name: 'Indoor Fountain', category: HomeDecorsCategory.Fountains, price: 3999, discount: 10, prodDetails: 'Floor standing fountain.', design: 'Classical', color: 'Bronze', shape: 'Tiered', brand: 'Water Art' },
  // Key Holder - 2
  { name: 'Wooden Key Holder', category: HomeDecorsCategory.KeyHolder, price: 599, discount: 8, prodDetails: 'Wall mount key holder.', design: 'Rustic', color: 'Wood', shape: 'Rectangle', brand: 'Key Home' },
  { name: 'Metal Key Organizer', category: HomeDecorsCategory.KeyHolder, price: 449, discount: 10, prodDetails: 'Sleek key holder.', design: 'Modern', color: 'Black', shape: 'Bar', brand: 'Key Craft' },
  // Outdoor Decors - 2
  { name: 'Garden Solar Lights', category: HomeDecorsCategory.OutdoorDecors, price: 999, discount: 15, prodDetails: 'Set of 4 solar lanterns.', design: 'Garden', color: 'Black', shape: 'Lantern', brand: 'Outdoor Light' },
  { name: 'Patio Wind Chime', category: HomeDecorsCategory.OutdoorDecors, price: 699, discount: 10, prodDetails: 'Bamboo wind chime.', design: 'Natural', color: 'Natural', shape: 'Vertical', brand: 'Garden Sound' },
];

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const homeDecorService = app.get(HomeDecorService);
  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));

  const [user] = await userRepo.find({ where: {}, take: 1 });
  if (!user) {
    console.error('No user found. Please create at least one user first.');
    await app.close();
    process.exit(1);
  }

  console.log(`Seeding home decor as user: ${user.id}`);

  for (const item of SEED_ITEMS) {
    const dto: CreateHomeDecoreDto = {
      name: item.name,
      price: item.price,
      prodDetails: item.prodDetails,
      discount: item.discount,
      category: item.category,
      images: [PLACEHOLDER_IMG],
      design: item.design,
      color: item.color,
      shape: item.shape,
      productQuantity: 50,
      otherProperties: { style: item.design },
      deliveryTime: '5-7 days',
      assembly: 'No assembly required',
      customizeOptions: false,
      warranty: '6 months',
      brand: item.brand,
      deliveryLocations: 'All India',
      createdById: user.id,
    };

    try {
      await homeDecorService.createHomeDecor(dto);
      console.log(`Created: ${item.name} (${item.category})`);
    } catch (err) {
      console.error(`Failed ${item.name}:`, err?.message || err);
    }
  }

  console.log('Home decor seed complete.');
  await app.close();
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
