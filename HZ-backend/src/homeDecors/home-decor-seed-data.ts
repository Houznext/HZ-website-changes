import { HomeDecorsCategory } from './enum/homeDecors.enum';

const HOME_DECOR_IMAGES = [
  'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=600&h=600&fit=crop', // ceramic vase
  'https://images.unsplash.com/photo-1622302420547-cb66419a05d1?w=600&h=600&fit=crop', // macrame wall hanging
  'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=600&h=600&fit=crop', // floating shelf
  'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=600&h=600&fit=crop', // metal shelf
  'https://images.unsplash.com/photo-1595437193398-f24279553f4f?w=600&h=600&fit=crop', // woven basket
  'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=600&h=600&fit=crop', // seagrass basket
  'https://images.unsplash.com/photo-1582045252753-126ffe9a9e67?w=600&h=600&fit=crop', // photo frame
  'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600&h=600&fit=crop', // collage frame
  'https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&h=600&fit=crop', // round mirror
  'https://images.unsplash.com/photo-1600210491892-ed038d3e38fe?w=600&h=600&fit=crop', // full length mirror
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=600&fit=crop', // canvas print
  'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&h=600&fit=crop', // botanical art
  'https://images.unsplash.com/photo-1567225477277-c8162eb4991d?w=600&h=600&fit=crop', // figurine
  'https://images.unsplash.com/photo-1602615007799-0c6629d6fd56?w=600&h=600&fit=crop', // buddha statue
  'https://images.unsplash.com/photo-1603204077779-bed963ea7d0e?w=600&h=600&fit=crop', // miniature
  'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=600&fit=crop', // terracotta pots
  'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&h=600&fit=crop', // succulent planter
  'https://images.unsplash.com/photo-1637967886160-fd78dc3ce3f5?w=600&h=600&fit=crop', // monstera plant
  'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=600&h=600&fit=crop', // tulip bouquet
  'https://images.unsplash.com/photo-1604762524889-3e2fcc145683?w=600&h=600&fit=crop', // candle
  'https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=600&h=600&fit=crop', // wall clock
  'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=600&h=600&fit=crop', // teapot
  'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=600&fit=crop', // wine glasses
];

function getHomeDecorImage(index: number): string {
  return HOME_DECOR_IMAGES[index % HOME_DECOR_IMAGES.length];
}

export interface HomeDecorSeedItem {
  name: string;
  category: HomeDecorsCategory;
  price: number;
  discount: number;
  prodDetails: string;
  design: string;
  color: string;
  shape: string;
  brand: string;
}

export const SEED_HOME_DECOR: HomeDecorSeedItem[] = [
  { name: 'Contemporary Ceramic Vase', category: HomeDecorsCategory.NewArrivals, price: 1299, discount: 10, prodDetails: 'Handcrafted ceramic vase.', design: 'Modern', color: 'Terracotta', shape: 'Cylindrical', brand: 'HomeStyle' },
  { name: 'Boho Wall Hanging', category: HomeDecorsCategory.NewArrivals, price: 899, discount: 5, prodDetails: 'Macrame wall decor.', design: 'Bohemian', color: 'Natural', shape: 'Irregular', brand: 'DecoArt' },
  { name: 'Floating Wood Shelf', category: HomeDecorsCategory.WallShelves, price: 1999, discount: 15, prodDetails: 'Mountable wooden shelf.', design: 'Minimalist', color: 'Oak', shape: 'Rectangle', brand: 'Urban Ladder' },
  { name: 'Metal Display Shelf', category: HomeDecorsCategory.WallShelves, price: 2499, discount: 10, prodDetails: 'Industrial-style metal shelf.', design: 'Industrial', color: 'Black', shape: 'Rectangle', brand: 'HomeTown' },
  { name: 'Woven Storage Basket', category: HomeDecorsCategory.Baskets, price: 699, discount: 8, prodDetails: 'Handwoven storage basket.', design: 'Rustic', color: 'Natural', shape: 'Round', brand: 'Craftsman' },
  { name: 'Seagrass Basket Set', category: HomeDecorsCategory.Baskets, price: 1499, discount: 12, prodDetails: 'Set of 3 seagrass baskets.', design: 'Coastal', color: 'Beige', shape: 'Oval', brand: 'Nature Home' },
  { name: 'Wooden Photo Frame 8x10', category: HomeDecorsCategory.PhotoFrame, price: 499, discount: 5, prodDetails: 'Classic wooden frame.', design: 'Classic', color: 'Walnut', shape: 'Rectangle', brand: 'FrameCo' },
  { name: 'Collage Photo Frame', category: HomeDecorsCategory.PhotoFrame, price: 1299, discount: 10, prodDetails: 'Multi-photo collage frame.', design: 'Modern', color: 'White', shape: 'Square', brand: 'Memory Lane' },
  { name: 'Round Decorative Mirror', category: HomeDecorsCategory.WallMirrors, price: 2499, discount: 15, prodDetails: 'Gold-finished round mirror.', design: 'Decorative', color: 'Gold', shape: 'Round', brand: 'MirrorCraft' },
  { name: 'Full Length Mirror', category: HomeDecorsCategory.WallMirrors, price: 3499, discount: 10, prodDetails: 'Leaner floor mirror.', design: 'Minimal', color: 'Black', shape: 'Rectangle', brand: 'Reflect' },
  { name: 'Abstract Canvas Print', category: HomeDecorsCategory.WallartAndPaintings, price: 1999, discount: 20, prodDetails: 'Gallery-wrapped canvas art.', design: 'Abstract', color: 'Multi', shape: 'Rectangle', brand: 'ArtSpace' },
  { name: 'Botanical Illustration', category: HomeDecorsCategory.WallartAndPaintings, price: 1599, discount: 12, prodDetails: 'Floral botanical print.', design: 'Botanical', color: 'Green', shape: 'Square', brand: 'Green Art' },
  { name: 'Brass Elephant Figurine', category: HomeDecorsCategory.Figurines, price: 899, discount: 8, prodDetails: 'Handcrafted brass elephant.', design: 'Traditional', color: 'Brass', shape: 'Figure', brand: 'Craft India' },
  { name: 'Ceramic Buddha Statue', category: HomeDecorsCategory.Figurines, price: 1299, discount: 10, prodDetails: 'Peaceful Buddha figurine.', design: 'Zen', color: 'White', shape: 'Figure', brand: 'Serenity' },
  { name: 'Vintage Car Miniature', category: HomeDecorsCategory.Miniatures, price: 599, discount: 5, prodDetails: 'Die-cast miniature car.', design: 'Vintage', color: 'Red', shape: 'Figure', brand: 'Collectible' },
  { name: 'House Model Miniature', category: HomeDecorsCategory.Miniatures, price: 799, discount: 10, prodDetails: 'Architectural house model.', design: 'Modern', color: 'White', shape: 'House', brand: 'Mini World' },
  { name: 'Terracotta Plant Pot Set', category: HomeDecorsCategory.PotsAndPlants, price: 999, discount: 12, prodDetails: 'Set of 3 terracotta pots.', design: 'Classic', color: 'Terracotta', shape: 'Round', brand: 'Garden Co' },
  { name: 'Ceramic Succulent Planter', category: HomeDecorsCategory.PotsAndPlants, price: 649, discount: 8, prodDetails: 'Small succulent planter.', design: 'Modern', color: 'Mint', shape: 'Round', brand: 'PlantLove' },
  { name: 'Faux Monstera Plant', category: HomeDecorsCategory.ArtificalPlantsAndFlowers, price: 1499, discount: 15, prodDetails: 'Lifelike artificial monstera.', design: 'Realistic', color: 'Green', shape: 'Natural', brand: 'FauxFlora' },
  { name: 'Artificial Tulip Bouquet', category: HomeDecorsCategory.ArtificalPlantsAndFlowers, price: 899, discount: 10, prodDetails: 'Colorful silk tulips.', design: 'Elegant', color: 'Pink', shape: 'Bouquet', brand: 'Forever Flowers' },
  { name: 'Metal Plant Stand', category: HomeDecorsCategory.PlantStand, price: 1299, discount: 10, prodDetails: 'Tiered metal plant stand.', design: 'Industrial', color: 'Black', shape: 'Tiered', brand: 'Stand Up' },
  { name: 'Wooden Plant Rack', category: HomeDecorsCategory.PlantStand, price: 1899, discount: 12, prodDetails: '3-tier wooden rack.', design: 'Scandinavian', color: 'Natural', shape: 'Ladder', brand: 'Wood & Green' },
  { name: 'Macrame Hanging Planter', category: HomeDecorsCategory.HangingPlanters, price: 799, discount: 15, prodDetails: 'Macrame with ceramic pot.', design: 'Bohemian', color: 'Natural', shape: 'Round', brand: 'Hang Green' },
  { name: 'Geometric Hanging Planter', category: HomeDecorsCategory.HangingPlanters, price: 1099, discount: 8, prodDetails: 'Metal geometric planter.', design: 'Geometric', color: 'Copper', shape: 'Hexagon', brand: 'GeoPlant' },
  { name: 'Garden Tool Set', category: HomeDecorsCategory.Gardening, price: 1499, discount: 10, prodDetails: 'Essential gardening tools.', design: 'Practical', color: 'Green', shape: 'Set', brand: 'GardenPro' },
  { name: 'Decorative Garden Gnome', category: HomeDecorsCategory.Gardening, price: 499, discount: 5, prodDetails: 'Classic garden gnome.', design: 'Classic', color: 'Red', shape: 'Figure', brand: 'Garden Fun' },
  { name: 'Diwali Diya Set', category: HomeDecorsCategory.FestiveDecor, price: 699, discount: 15, prodDetails: 'Brass diya set for festivals.', design: 'Traditional', color: 'Brass', shape: 'Round', brand: 'Festive Joy' },
  { name: 'Christmas Ornament Set', category: HomeDecorsCategory.FestiveDecor, price: 899, discount: 20, prodDetails: 'Hand-painted ornaments.', design: 'Festive', color: 'Multi', shape: 'Various', brand: 'Holiday Home' },
  { name: 'Scented Soy Candle', category: HomeDecorsCategory.Candles, price: 649, discount: 10, prodDetails: 'Lavender scented candle.', design: 'Minimal', color: 'White', shape: 'Cylinder', brand: 'CandleCo' },
  { name: 'Decorative Pillar Candle', category: HomeDecorsCategory.Candles, price: 449, discount: 5, prodDetails: 'Unscented pillar candle.', design: 'Classic', color: 'Ivory', shape: 'Cylinder', brand: 'Light & Glow' },
  { name: 'Home Spa Gift Set', category: HomeDecorsCategory.DecorGiftSets, price: 1999, discount: 15, prodDetails: 'Candles and diffuser set.', design: 'Luxury', color: 'Pink', shape: 'Box', brand: 'GiftBox' },
  { name: 'Tea Lovers Gift Set', category: HomeDecorsCategory.DecorGiftSets, price: 1299, discount: 12, prodDetails: 'Tea set with infuser.', design: 'Elegant', color: 'White', shape: 'Set', brand: 'TeaTime' },
  { name: 'Ceramic Dinner Plates Set', category: HomeDecorsCategory.Tableware, price: 1499, discount: 10, prodDetails: 'Set of 6 ceramic plates.', design: 'Contemporary', color: 'White', shape: 'Round', brand: 'Table Art' },
  { name: 'Salad Bowl Set', category: HomeDecorsCategory.Tableware, price: 999, discount: 8, prodDetails: 'Set of 3 nesting bowls.', design: 'Minimal', color: 'Grey', shape: 'Round', brand: 'Kitchen Style' },
  { name: '20-Piece Dinner Set', category: HomeDecorsCategory.DinnerSet, price: 2999, discount: 15, prodDetails: 'Complete ceramic dinner set.', design: 'Classic', color: 'White', shape: 'Set', brand: 'DineWell' },
  { name: 'Stoneware Dinner Set', category: HomeDecorsCategory.DinnerSet, price: 4499, discount: 12, prodDetails: 'Premium stoneware set.', design: 'Modern', color: 'Grey', shape: 'Set', brand: 'Stone Craft' },
  { name: 'Ceramic Coffee Mug', category: HomeDecorsCategory.CoffeeMugs, price: 349, discount: 10, prodDetails: '350ml ceramic mug.', design: 'Minimal', color: 'Navy', shape: 'Cylinder', brand: 'Brew Cup' },
  { name: 'Insulated Travel Mug', category: HomeDecorsCategory.CoffeeMugs, price: 599, discount: 8, prodDetails: 'Double-wall insulated.', design: 'Practical', color: 'Black', shape: 'Cylinder', brand: 'StayHot' },
  { name: 'Wooden Serving Tray', category: HomeDecorsCategory.ServingTrays, price: 1299, discount: 12, prodDetails: 'Handcrafted wooden tray.', design: 'Rustic', color: 'Teak', shape: 'Rectangle', brand: 'Serve Well' },
  { name: 'Marble Cheese Board', category: HomeDecorsCategory.ServingTrays, price: 1899, discount: 10, prodDetails: 'Marble serving board.', design: 'Luxury', color: 'White', shape: 'Rectangle', brand: 'Marble Home' },
  { name: 'Ceramic Teapot', category: HomeDecorsCategory.Teapots, price: 899, discount: 10, prodDetails: '1L ceramic teapot.', design: 'Classic', color: 'Blue', shape: 'Round', brand: 'Tea House' },
  { name: 'Glass Teapot with Infuser', category: HomeDecorsCategory.Teapots, price: 1199, discount: 15, prodDetails: 'Borosilicate glass teapot.', design: 'Modern', color: 'Clear', shape: 'Round', brand: 'See Steep' },
  { name: 'Wine Glass Set', category: HomeDecorsCategory.Glassware, price: 999, discount: 10, prodDetails: 'Set of 4 wine glasses.', design: 'Elegant', color: 'Clear', shape: 'Tulip', brand: 'Vino Glass' },
  { name: 'Tumbler Glass Set', category: HomeDecorsCategory.Glassware, price: 699, discount: 8, prodDetails: 'Set of 6 tumblers.', design: 'Classic', color: 'Clear', shape: 'Cylinder', brand: 'DrinkWell' },
  { name: 'Wall Clock Modern', category: HomeDecorsCategory.Clocks, price: 1499, discount: 12, prodDetails: 'Minimalist wall clock.', design: 'Modern', color: 'Black', shape: 'Round', brand: 'TickTock' },
  { name: 'Desk Clock', category: HomeDecorsCategory.Clocks, price: 799, discount: 8, prodDetails: 'Compact desk clock.', design: 'Minimal', color: 'White', shape: 'Square', brand: 'Time Craft' },
  { name: 'Wooden Home Temple', category: HomeDecorsCategory.HomeTemples, price: 2499, discount: 10, prodDetails: 'Handcrafted puja mandir.', design: 'Traditional', color: 'Sheesham', shape: 'Arch', brand: 'Divine Home' },
  { name: 'Wall Mount Temple', category: HomeDecorsCategory.HomeTemples, price: 1899, discount: 12, prodDetails: 'Space-saving wall temple.', design: 'Modern', color: 'White', shape: 'Rectangle', brand: 'Sacred Space' },
  { name: 'Bamboo Breakfast Tray', category: HomeDecorsCategory.Trays, price: 899, discount: 10, prodDetails: 'Lightweight bamboo tray.', design: 'Natural', color: 'Natural', shape: 'Rectangle', brand: 'Bamboo Co' },
  { name: 'Metal Decorative Tray', category: HomeDecorsCategory.Trays, price: 1299, discount: 8, prodDetails: 'Brass decorative tray.', design: 'Decorative', color: 'Brass', shape: 'Oval', brand: 'Metal Craft' },
  { name: 'Reed Diffuser Set', category: HomeDecorsCategory.HomeFragrances, price: 999, discount: 15, prodDetails: 'Lavender reed diffuser.', design: 'Elegant', color: 'Clear', shape: 'Cylinder', brand: 'Scent Home' },
  { name: 'Room Spray', category: HomeDecorsCategory.HomeFragrances, price: 449, discount: 8, prodDetails: 'Fresh linen room spray.', design: 'Simple', color: 'White', shape: 'Cylinder', brand: 'Fresh Air' },
  { name: 'Glass Flower Vase', category: HomeDecorsCategory.FlowerPotAndVases, price: 699, discount: 10, prodDetails: 'Tall glass vase.', design: 'Modern', color: 'Clear', shape: 'Cylinder', brand: 'Vase Co' },
  { name: 'Ceramic Flower Pot', category: HomeDecorsCategory.FlowerPotAndVases, price: 549, discount: 8, prodDetails: 'Decorative flower pot.', design: 'Classic', color: 'Terracotta', shape: 'Round', brand: 'Pot Style' },
];

export function buildHomeDecorDto(item: HomeDecorSeedItem, userId: string, index = 0) {
  return {
    name: item.name,
    price: item.price,
    prodDetails: item.prodDetails,
    discount: item.discount,
    category: item.category,
    images: [getHomeDecorImage(index)],
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
    createdById: userId,
  };
}
