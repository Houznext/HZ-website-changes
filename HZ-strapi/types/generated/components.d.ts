import type { Schema, Struct } from '@strapi/strapi';

export interface InteriorsCardItem extends Struct.ComponentSchema {
  collectionName: 'components_interiors_card_items';
  info: {
    displayName: 'cardItem';
  };
  attributes: {
    description: Schema.Attribute.Text;
    iconUrl: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    title: Schema.Attribute.String;
  };
}

export interface InteriorsCivilEngineeringDesign
  extends Struct.ComponentSchema {
  collectionName: 'components_interiors_civil_engineering_design_s';
  info: {
    displayName: 'CivilEngineeringDesign ';
  };
  attributes: {
    faq: Schema.Attribute.JSON;
    heroSection: Schema.Attribute.JSON;
    ourBlogs: Schema.Attribute.JSON;
    ourProcess: Schema.Attribute.JSON;
    ourServices: Schema.Attribute.JSON;
    packages: Schema.Attribute.JSON;
    testimonials: Schema.Attribute.JSON;
  };
}

export interface InteriorsDesignIdeas extends Struct.ComponentSchema {
  collectionName: 'components_interiors_design_ideas';
  info: {
    displayName: 'DesignIdeas';
  };
  attributes: {
    heading: Schema.Attribute.String;
    listOfSpaces: Schema.Attribute.Component<'interiors.list-of-spaces', false>;
    subHeading: Schema.Attribute.String;
  };
}

export interface InteriorsFurnitures extends Struct.ComponentSchema {
  collectionName: 'components_interiors_furnitures';
  info: {
    displayName: 'Furnitures';
  };
  attributes: {
    bestSellingPackages: Schema.Attribute.JSON;
    cards: Schema.Attribute.JSON;
    customizeFurniture: Schema.Attribute.JSON;
    designIdeas: Schema.Attribute.JSON;
    exploreOurWideRangeOfFurniture: Schema.Attribute.JSON;
    furnitureTypes: Schema.Attribute.JSON;
    heroSection: Schema.Attribute.JSON;
    ourBlogs: Schema.Attribute.JSON;
    testimonials: Schema.Attribute.JSON;
    whyVisitUs: Schema.Attribute.JSON;
  };
}

export interface InteriorsHeroCardItem extends Struct.ComponentSchema {
  collectionName: 'components_interiors_hero_card_items';
  info: {
    displayName: 'hero-card-item';
  };
  attributes: {
    bhk: Schema.Attribute.String;
    packages: Schema.Attribute.Component<'interiors.item-packages', true>;
  };
}

export interface InteriorsHeroPage extends Struct.ComponentSchema {
  collectionName: 'components_interiors_hero_pages';
  info: {
    displayName: 'HeroPage';
  };
  attributes: {
    bgImageUrl: Schema.Attribute.String;
    enquiryFormTitle: Schema.Attribute.String;
    heroSubTitle: Schema.Attribute.String;
    heroTitle: Schema.Attribute.String;
    leaderTagline: Schema.Attribute.String;
    ourAcheivements: Schema.Attribute.JSON;
  };
}

export interface InteriorsHeroSection extends Struct.ComponentSchema {
  collectionName: 'components_interiors_hero_sections';
  info: {
    displayName: 'HeroSection';
  };
  attributes: {
    bgImageUrl: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    bookingCtaUrl: Schema.Attribute.JSON;
    formHeading: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    locationCtaUrl: Schema.Attribute.JSON;
    subHeading: Schema.Attribute.String;
  };
}

export interface InteriorsInteriorDesign extends Struct.ComponentSchema {
  collectionName: 'components_interiors_interior_designs';
  info: {
    displayName: 'interiorDesign';
  };
  attributes: {
    heading: Schema.Attribute.String;
    list: Schema.Attribute.Component<'interiors.list', true>;
    subHeading: Schema.Attribute.String;
  };
}

export interface InteriorsInteriors extends Struct.ComponentSchema {
  collectionName: 'components_interiors_interiors';
  info: {
    description: '';
    displayName: 'Interiors';
  };
  attributes: {
    balconies: Schema.Attribute.JSON;
    bathrooms: Schema.Attribute.JSON;
    bedrooms: Schema.Attribute.JSON;
    cardsSection: Schema.Attribute.JSON;
    desingIdeas: Schema.Attribute.JSON;
    diningRoom: Schema.Attribute.JSON;
    heading: Schema.Attribute.JSON;
    heroSection: Schema.Attribute.JSON;
    interiorBgImage: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    kitchen: Schema.Attribute.JSON;
    livingRoom: Schema.Attribute.JSON;
    ourBlogs: Schema.Attribute.JSON;
    packages: Schema.Attribute.JSON;
    poojaRooms: Schema.Attribute.JSON;
    studyRoom: Schema.Attribute.JSON;
    testimonials: Schema.Attribute.JSON;
    tiles: Schema.Attribute.JSON;
    tvUnit: Schema.Attribute.JSON;
    wardrobe: Schema.Attribute.JSON;
    wayWeWork: Schema.Attribute.JSON;
  };
}

export interface InteriorsItemPackages extends Struct.ComponentSchema {
  collectionName: 'components_interiors_item_packages';
  info: {
    displayName: 'itemPackages';
  };
  attributes: {
    features: Schema.Attribute.JSON;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    startingPrice: Schema.Attribute.String;
    type: Schema.Attribute.String;
  };
}

export interface InteriorsKitchen extends Struct.ComponentSchema {
  collectionName: 'components_interiors_kitchens';
  info: {
    description: '';
    displayName: 'kitchen';
  };
  attributes: {
    description: Schema.Attribute.Text;
    faq: Schema.Attribute.JSON;
    heading: Schema.Attribute.String;
    ImageList: Schema.Attribute.Component<'kitchen.image-list', true>;
    mainImageUrl: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
  };
}

export interface InteriorsList extends Struct.ComponentSchema {
  collectionName: 'components_interiors_lists';
  info: {
    displayName: 'list';
  };
  attributes: {
    listCardItem: Schema.Attribute.Component<'interiors.list-card-item', true>;
  };
}

export interface InteriorsListCardItem extends Struct.ComponentSchema {
  collectionName: 'components_interiors_list_card_items';
  info: {
    displayName: 'listCardItem';
  };
  attributes: {
    imageUrl: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    label: Schema.Attribute.String;
  };
}

export interface InteriorsListItems extends Struct.ComponentSchema {
  collectionName: 'components_interiors_list_items';
  info: {
    description: '';
    displayName: 'listItems';
  };
  attributes: {
    cardItem1: Schema.Attribute.Component<'interiors.card-item', false>;
    cardItem2: Schema.Attribute.Component<'interiors.card-item', false>;
    cardItem3: Schema.Attribute.Component<'interiors.card-item', false>;
    cardItem4: Schema.Attribute.Component<'interiors.card-item', false>;
  };
}

export interface InteriorsListOfSpaces extends Struct.ComponentSchema {
  collectionName: 'components_interiors_list_of_spaces';
  info: {
    description: '';
    displayName: 'ListOfSpaces';
  };
  attributes: {
    balcony: Schema.Attribute.Component<'interiors.space-item', false>;
    bathroom: Schema.Attribute.Component<'interiors.space-item', false>;
    bedroom: Schema.Attribute.Component<'interiors.space-item', false>;
    diningRoom: Schema.Attribute.Component<'interiors.space-item', false>;
    kitchen: Schema.Attribute.Component<'interiors.space-item', false>;
    livingRoom: Schema.Attribute.Component<'interiors.space-item', false>;
    tvUnit: Schema.Attribute.Component<'interiors.space-item', false>;
    Wardrobe: Schema.Attribute.Component<'interiors.space-item', false>;
  };
}

export interface InteriorsLoans extends Struct.ComponentSchema {
  collectionName: 'components_interiors_loans';
  info: {
    displayName: 'Loans';
  };
  attributes: {
    bankingPartners: Schema.Attribute.JSON;
    faqs: Schema.Attribute.JSON;
    heroSection: Schema.Attribute.JSON;
  };
}

export interface InteriorsPackageItem extends Struct.ComponentSchema {
  collectionName: 'components_interiors_package_items';
  info: {
    displayName: 'packageItem';
  };
  attributes: {
    highlightOfProperty: Schema.Attribute.String;
    imageUrl: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    offerTitle: Schema.Attribute.String;
    price: Schema.Attribute.String;
  };
}

export interface InteriorsPackages extends Struct.ComponentSchema {
  collectionName: 'components_interiors_packages';
  info: {
    description: '';
    displayName: 'Packages';
  };
  attributes: {
    highlightOfProperty: Schema.Attribute.String;
    imageUrl: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    offerTitle: Schema.Attribute.String;
    price: Schema.Attribute.String;
  };
}

export interface InteriorsPainting extends Struct.ComponentSchema {
  collectionName: 'components_interiors_paintings';
  info: {
    displayName: 'Painting';
  };
  attributes: {
    AboutUs: Schema.Attribute.JSON;
    faq: Schema.Attribute.JSON;
    heroSection: Schema.Attribute.JSON;
    ourBlogs: Schema.Attribute.JSON;
    ourPartners: Schema.Attribute.JSON;
    ourServices: Schema.Attribute.JSON;
    testimonials: Schema.Attribute.JSON;
  };
}

export interface InteriorsPlumbing extends Struct.ComponentSchema {
  collectionName: 'components_interiors_plumbings';
  info: {
    displayName: 'Plumbing';
  };
  attributes: {
    choosePlumbingServices: Schema.Attribute.JSON;
    heroSection: Schema.Attribute.JSON;
    homeServices: Schema.Attribute.JSON;
    mostlyBooked: Schema.Attribute.JSON;
  };
}

export interface InteriorsPriceEstimator extends Struct.ComponentSchema {
  collectionName: 'components_interiors_price_estimators';
  info: {
    displayName: 'PriceEstimator';
  };
  attributes: {
    calculateBtnText: Schema.Attribute.String;
    contentDescription: Schema.Attribute.Text;
    contentTitle: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    iconUrl: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    imageUrl: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    subHeading: Schema.Attribute.String;
  };
}

export interface InteriorsSpaceItem extends Struct.ComponentSchema {
  collectionName: 'components_interiors_space_items';
  info: {
    description: '';
    displayName: 'spaceItem';
  };
  attributes: {
    spaceItemField1: Schema.Attribute.Component<'interiors.step-item', false>;
    spaceItemField2: Schema.Attribute.Component<'interiors.step-item', false>;
    spaceItemField3: Schema.Attribute.Component<'interiors.step-item', false>;
    spaceItemField4: Schema.Attribute.Component<'interiors.step-item', false>;
  };
}

export interface InteriorsSpaceItemField extends Struct.ComponentSchema {
  collectionName: 'components_interiors_space_item_fields';
  info: {
    displayName: 'spaceItemField';
  };
  attributes: {
    title: Schema.Attribute.String;
  };
}

export interface InteriorsStepItem extends Struct.ComponentSchema {
  collectionName: 'components_interiors_step_items';
  info: {
    displayName: 'stepItem';
  };
  attributes: {
    imageUrl: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    stepTitle: Schema.Attribute.String;
  };
}

export interface InteriorsSteps extends Struct.ComponentSchema {
  collectionName: 'components_interiors_steps';
  info: {
    description: '';
    displayName: 'steps';
  };
  attributes: {
    stepItem1: Schema.Attribute.Component<'interiors.step-item', false>;
    stepItem2: Schema.Attribute.Component<'interiors.step-item', false>;
    stepItem3: Schema.Attribute.Component<'interiors.step-item', false>;
    stepItem4: Schema.Attribute.Component<'interiors.step-item', false>;
    stepItem5: Schema.Attribute.Component<'interiors.step-item', false>;
  };
}

export interface InteriorsTestimonialItem extends Struct.ComponentSchema {
  collectionName: 'components_interiors_testimonial_items';
  info: {
    displayName: 'testimonialItem';
  };
  attributes: {
    message: Schema.Attribute.Text;
    name: Schema.Attribute.String;
    rating: Schema.Attribute.Integer;
  };
}

export interface InteriorsTestimonials extends Struct.ComponentSchema {
  collectionName: 'components_interiors_testimonials';
  info: {
    description: '';
    displayName: 'Testimonials';
  };
  attributes: {
    heading: Schema.Attribute.String;
    testimonial: Schema.Attribute.Component<
      'interiors.testimonials-list',
      true
    >;
  };
}

export interface InteriorsTestimonialsList extends Struct.ComponentSchema {
  collectionName: 'components_interiors_testimonials_lists';
  info: {
    description: '';
    displayName: 'testimonialsList';
  };
  attributes: {
    message: Schema.Attribute.Text;
    name: Schema.Attribute.String;
    rating: Schema.Attribute.Integer;
  };
}

export interface InteriorsVastu extends Struct.ComponentSchema {
  collectionName: 'components_interiors_vastus';
  info: {
    displayName: 'Vastu';
  };
  attributes: {
    faq: Schema.Attribute.JSON;
    heroSection: Schema.Attribute.JSON;
    ourBlogs: Schema.Attribute.JSON;
    ourSevices: Schema.Attribute.JSON;
    ourVastuProcess: Schema.Attribute.JSON;
    testimonials: Schema.Attribute.JSON;
    vastuDefinition: Schema.Attribute.JSON;
  };
}

export interface InteriorsWayWeWork extends Struct.ComponentSchema {
  collectionName: 'components_interiors_way_we_works';
  info: {
    displayName: 'WayWeWork';
  };
  attributes: {
    heading: Schema.Attribute.String;
    steps: Schema.Attribute.Component<'interiors.steps', false>;
    subHeading: Schema.Attribute.String;
  };
}

export interface KitchenCardSection extends Struct.ComponentSchema {
  collectionName: 'components_kitchen_card_sections';
  info: {
    description: '';
    displayName: 'CardSection';
  };
  attributes: {
    listItems: Schema.Attribute.Component<'interiors.list-items', false>;
    mainHeading: Schema.Attribute.String;
    subHeading: Schema.Attribute.String;
  };
}

export interface KitchenCards extends Struct.ComponentSchema {
  collectionName: 'components_kitchen_cards';
  info: {
    displayName: 'Cards';
  };
  attributes: {};
}

export interface KitchenImageList extends Struct.ComponentSchema {
  collectionName: 'components_kitchen_image_lists';
  info: {
    description: '';
    displayName: 'ImageList';
  };
  attributes: {
    description: Schema.Attribute.Text;
    imageUrl: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    title: Schema.Attribute.String;
  };
}

export interface KitchenImageListItem extends Struct.ComponentSchema {
  collectionName: 'components_kitchen_image_list_items';
  info: {
    displayName: 'ImageListItem';
  };
  attributes: {
    description: Schema.Attribute.Text;
    imageUrl: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    title: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'interiors.card-item': InteriorsCardItem;
      'interiors.civil-engineering-design': InteriorsCivilEngineeringDesign;
      'interiors.design-ideas': InteriorsDesignIdeas;
      'interiors.furnitures': InteriorsFurnitures;
      'interiors.hero-card-item': InteriorsHeroCardItem;
      'interiors.hero-page': InteriorsHeroPage;
      'interiors.hero-section': InteriorsHeroSection;
      'interiors.interior-design': InteriorsInteriorDesign;
      'interiors.interiors': InteriorsInteriors;
      'interiors.item-packages': InteriorsItemPackages;
      'interiors.kitchen': InteriorsKitchen;
      'interiors.list': InteriorsList;
      'interiors.list-card-item': InteriorsListCardItem;
      'interiors.list-items': InteriorsListItems;
      'interiors.list-of-spaces': InteriorsListOfSpaces;
      'interiors.loans': InteriorsLoans;
      'interiors.package-item': InteriorsPackageItem;
      'interiors.packages': InteriorsPackages;
      'interiors.painting': InteriorsPainting;
      'interiors.plumbing': InteriorsPlumbing;
      'interiors.price-estimator': InteriorsPriceEstimator;
      'interiors.space-item': InteriorsSpaceItem;
      'interiors.space-item-field': InteriorsSpaceItemField;
      'interiors.step-item': InteriorsStepItem;
      'interiors.steps': InteriorsSteps;
      'interiors.testimonial-item': InteriorsTestimonialItem;
      'interiors.testimonials': InteriorsTestimonials;
      'interiors.testimonials-list': InteriorsTestimonialsList;
      'interiors.vastu': InteriorsVastu;
      'interiors.way-we-work': InteriorsWayWeWork;
      'kitchen.card-section': KitchenCardSection;
      'kitchen.cards': KitchenCards;
      'kitchen.image-list': KitchenImageList;
      'kitchen.image-list-item': KitchenImageListItem;
    }
  }
}
