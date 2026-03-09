// export default factories.createCoreController('api::hero-card-price.hero-card-price');

/**
 * design-idea controller
 */

import { factories } from "@strapi/strapi";

const cardSectionItems = {
  cardItem1: {
    populate: {
      iconUrl: { fields: ["url"] },
    },
  },
  cardItem2: {
    populate: {
      iconUrl: { fields: ["url"] },
    },
  },
  cardItem3: {
    populate: {
      iconUrl: { fields: ["url"] },
    },
  },
  cardItem4: {
    populate: {
      iconUrl: { fields: ["url"] },
    },
  },
};

export default factories.createCoreController(
  "api::hero-card-price.hero-card-price",
  ({ strapi }) => ({
    async find(ctx) {
      const entries = await strapi.entityService.findMany(
        "api::hero-card-price.hero-card-price",
        {
          populate: {
            CardSection: {
              populate: {
                listItems: {
                  populate: cardSectionItems,
                },
              },
            } as any,
            HeroSection: {
              populate: {
                bgImageUrl: {
                  fields: ["url"], // Only fetch the URL field
                },
              },
            } as any,
            PriceEstimator: {
              populate: {
                imageUrl: {
                  fields: ["url"], // Only fetch the name field
                },
              },
            } as any,
          },
        }
      );

      return entries;
    },
  })
);
