/**
 * service-custom-builder controller
 */

// import { factories } from '@strapi/strapi'

// export default factories.createCoreController('api::service-custom-builder.service-custom-builder');

import { factories } from "@strapi/strapi";

const ImageListItems = {
  ImageListItem1: {
    populate: { imageUrl: { fields: ["url"] } },
  },
  ImageListItem2: {
    populate: { imageUrl: { fields: ["url"] } },
  },
  ImageListItem3: {
    populate: { imageUrl: { fields: ["url"] } },
  },
  ImageListItem4: {
    populate: { imageUrl: { fields: ["url"] } },
  },
  ImageListItem5: {
    populate: { imageUrl: { fields: ["url"] } },
  },
  ImageListItem6: {
    populate: { imageUrl: { fields: ["url"] } },
  },
};

const wayWeWorkStepItems = {
  stepItem1: {
    populate: {
      imageUrl: {
        fields: ["url"],
      },
    },
  },
  stepItem2: {
    populate: {
      imageUrl: {
        fields: ["url"],
      },
    },
  },
  stepItem3: {
    populate: {
      imageUrl: {
        fields: ["url"],
      },
    },
  },
  stepItem4: {
    populate: {
      imageUrl: {
        fields: ["url"],
      },
    },
  },
  stepItem5: {
    populate: {
      imageUrl: {
        fields: ["url"],
      },
    },
  },
};

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

const packageItems = {
  packageItem1: {
    populate: {
      imageUrl: { fields: ["url"] },
    },
  },
  packageItem2: {
    populate: {
      imageUrl: { fields: ["url"] },
    },
  },
  packageItem3: {
    populate: {
      imageUrl: { fields: ["url"] },
    },
  },
};

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
};

export default factories.createCoreController(
  "api::service-custom-builder.service-custom-builder",
  ({ strapi }) => ({
    async find(ctx) {
      const entries = await strapi.entityService.findMany(
        "api::service-custom-builder.service-custom-builder",
        {
          populate: {
            kitchen: {
              populate: {
                mainImageUrl: { fields: ["url"] },
                faqImageUrl: { fields: ["url"] },
                ImageList: {
                  populate: ImageListItems,
                },
              },
            } as any,
            LivingRoom: {
              populate: {
                mainImageUrl: { fields: ["url"] },
                faqImageUrl: { fields: ["url"] },
                ImageList: {
                  populate: ImageListItems,
                },
              },
            } as any,
            Bedrooms: {
              populate: {
                mainImageUrl: { fields: ["url"] },
                faqImageUrl: { fields: ["url"] },
                ImageList: {
                  populate: ImageListItems,
                },
              },
            } as any,
            DiningRoom: {
              populate: {
                mainImageUrl: { fields: ["url"] },
                faqImageUrl: { fields: ["url"] },
                ImageList: {
                  populate: ImageListItems,
                },
              },
            } as any,
            Balconies: {
              populate: {
                mainImageUrl: { fields: ["url"] },
                faqImageUrl: { fields: ["url"] },
                ImageList: {
                  populate: ImageListItems,
                },
              },
            } as any,
            Bathrooms: {
              populate: {
                mainImageUrl: { fields: ["url"] },
                faqImageUrl: { fields: ["url"] },
                ImageList: {
                  populate: ImageListItems,
                },
              },
            } as any,
            Hall: {
              populate: {
                mainImageUrl: { fields: ["url"] },
                faqImageUrl: { fields: ["url"] },
                ImageList: {
                  populate: ImageListItems,
                },
              },
            } as any,
            PoojaRoom: {
              populate: {
                mainImageUrl: { fields: ["url"] },
                faqImageUrl: { fields: ["url"] },
                ImageList: {
                  populate: ImageListItems,
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
            CardSection: {
              populate: {
                listItems: {
                  populate: cardSectionItems,
                },
              },
            } as any,
            Packages: {
              populate: packageItems,
            } as any,
            PriceEstimator: {
              populate: {
                imageUrl: {
                  fields: ["url"], // Only fetch the name field
                },
              },
            } as any,
            DesignIdeas: {
              populate: {
                listOfSpaces: {
                  populate: designIdeasListOfSpaces,
                },
              },
            } as any,
            WayWeWork: {
              populate: {
                steps: {
                  populate: wayWeWorkStepItems,
                },
              },
            } as any,
            Testimonials: {
              populate: {
                testimonials: {
                  populate: "*",
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
