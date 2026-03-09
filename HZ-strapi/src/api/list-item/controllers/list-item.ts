/**
 * list-item controller
 */

// import { factories } from '@strapi/strapi'

// export default factories.createCoreController('api::list-item.list-item');

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::list-item.list-item",
  ({ strapi }) => ({
    async find(ctx) {
      const entries = await strapi.entityService.findMany(
        "api::list-item.list-item",
        {
          populate: {
            Kitchen: {
                populate: {
                  mainImageUrl: { fields: ["url"] },
                  ImageList: {
                    populate: { imageUrl: { fields: ["url"] } },
                  },
                },
              } as any,
              LivingRoom: {
                populate: {
                  mainImageUrl: { fields: ["url"] },
                  ImageList: {
                    populate: { imageUrl: { fields: ["url"] } },
                  },
                },
              } as any,
              Bedroom: {
                populate: {
                  mainImageUrl: { fields: ["url"] },
                  ImageList: {
                    populate: { imageUrl: { fields: ["url"] } },
                  },
                },
              } as any,
              DiningRoom: {
                populate: {
                  mainImageUrl: { fields: ["url"] },
                  ImageList: {
                    populate: { imageUrl: { fields: ["url"] } },
                  },
                },
              } as any,
              Balconies: {
                populate: {
                  mainImageUrl: { fields: ["url"] },
                  ImageList: {
                    populate: { imageUrl: { fields: ["url"] } },
                  },
                },
              } as any,
              Bathroom: {
                populate: {
                  mainImageUrl: { fields: ["url"] },
                  ImageList: {
                    populate: { imageUrl: { fields: ["url"] } },
                  },
                },
              } as any,
              Home: {
                populate: {
                  mainImageUrl: { fields: ["url"] },
                  ImageList: {
                    populate: { imageUrl: { fields: ["url"] } },
                  },
                },
              } as any,
              PoojaRoom: {
                populate: {
                  mainImageUrl: { fields: ["url"] },
                  ImageList: {
                    populate: { imageUrl: { fields: ["url"] } },
                  },
                },
              } as any,
              StudyRoom: {
                populate: {
                  mainImageUrl: { fields: ["url"] },
                  ImageList: {
                    populate: { imageUrl: { fields: ["url"] } },
                  },
                },
              } as any,
              Tiles: {
                populate: {
                  mainImageUrl: { fields: ["url"] },
                  ImageList: {
                    populate: { imageUrl: { fields: ["url"] } },
                  },
                },
              } as any,
              TvUnit: {
                populate: {
                  mainImageUrl: { fields: ["url"] },
                  ImageList: {
                    populate: { imageUrl: { fields: ["url"] } },
                  },
                },
              } as any,
              Wardrobe: {
                populate: {
                  mainImageUrl: { fields: ["url"] },
                  ImageList: {
                    populate: { imageUrl: { fields: ["url"] } },
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
