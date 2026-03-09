/**
 * design-idea controller
 */

// export default factories.createCoreController('api::design-idea.design-idea');

import { factories } from '@strapi/strapi'

const designIdeasListOfSpaces = {
    kitchen: {
      populate: {
        spaceItemField1: {
          populate: {
            imageUrl: { fields: ["url"] },
          },
        },
        spaceItemField2: {
          populate: {
            imageUrl: { fields: ["url"] },
          },
        },
        spaceItemField3: {
          populate: {
            imageUrl: { fields: ["url"] },
          },
        },
        spaceItemField4: {
          populate: {
            imageUrl: { fields: ["url"] },
          },
        },
      },
    },
    bedroom: {
      populate: {
        spaceItemField1: {
          populate: {
            imageUrl: { fields: ["url"] },
          },
        },
        spaceItemField2: {
          populate: {
            imageUrl: { fields: ["url"] },
          },
        },
        spaceItemField3: {
          populate: {
            imageUrl: { fields: ["url"] },
          },
        },
        spaceItemField4: {
          populate: {
            imageUrl: { fields: ["url"] },
          },
        },
      },
    },
    livingRoom: {
      populate: {
        spaceItemField1: {
          populate: {
            imageUrl: { fields: ["url"] },
          },
        },
        spaceItemField2: {
          populate: {
            imageUrl: { fields: ["url"] },
          },
        },
        spaceItemField3: {
          populate: {
            imageUrl: { fields: ["url"] },
          },
        },
        spaceItemField4: {
          populate: {
            imageUrl: { fields: ["url"] },
          },
        },
      },
    },
    tvUnit: {
      populate: {
        spaceItemField1: {
          populate: {
            imageUrl: { fields: ["url"] },
          },
        },
        spaceItemField2: {
          populate: {
            imageUrl: { fields: ["url"] },
          },
        },
        spaceItemField3: {
          populate: {
            imageUrl: { fields: ["url"] },
          },
        },
        spaceItemField4: {
          populate: {
            imageUrl: { fields: ["url"] },
          },
        },
      },
    },
    bathroom: {
      populate: {
        spaceItemField1: {
          populate: {
            imageUrl: { fields: ["url"] },
          },
        },
        spaceItemField2: {
          populate: {
            imageUrl: { fields: ["url"] },
          },
        },
        spaceItemField3: {
          populate: {
            imageUrl: { fields: ["url"] },
          },
        },
        spaceItemField4: {
          populate: {
            imageUrl: { fields: ["url"] },
          },
        },
      },
    },
    balcony: {
      populate: {
        spaceItemField1: {
          populate: {
            imageUrl: { fields: ["url"] },
          },
        },
        spaceItemField2: {
          populate: {
            imageUrl: { fields: ["url"] },
          },
        },
        spaceItemField3: {
          populate: {
            imageUrl: { fields: ["url"] },
          },
        },
        spaceItemField4: {
          populate: {
            imageUrl: { fields: ["url"] },
          },
        },
      },
    },
    Wardrobe: {
      populate: {
        spaceItemField1: {
          populate: {
            imageUrl: { fields: ["url"] },
          },
        },
        spaceItemField2: {
          populate: {
            imageUrl: { fields: ["url"] },
          },
        },
        spaceItemField3: {
          populate: {
            imageUrl: { fields: ["url"] },
          },
        },
        spaceItemField4: {
          populate: {
            imageUrl: { fields: ["url"] },
          },
        },
      },
    },
    diningRoom: {
      populate: {
        spaceItemField1: {
          populate: {
            imageUrl: { fields: ["url"] },
          },
        },
        spaceItemField2: {
          populate: {
            imageUrl: { fields: ["url"] },
          },
        },
        spaceItemField3: {
          populate: {
            imageUrl: { fields: ["url"] },
          },
        },
        spaceItemField4: {
          populate: {
            imageUrl: { fields: ["url"] },
          },
        },
      },
    },
  };

  export default factories.createCoreController(
    "api::design-idea.design-idea",
    ({ strapi }) => ({
      async find(ctx) {
        const entries = await strapi.entityService.findMany(
          "api::design-idea.design-idea",
          {
            populate:{
                DesignIdeas: {
                    populate: {
                      listOfSpaces: {
                        populate: designIdeasListOfSpaces,
                      },
                    },
                  } as any,
            },
        });

        return entries;
        },
    })
);