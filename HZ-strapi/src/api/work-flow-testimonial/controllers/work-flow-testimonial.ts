/**
 * work-flow-testimonial controller
 */

// import { factories } from '@strapi/strapi'

// export default factories.createCoreController('api::work-flow-testimonial.work-flow-testimonial');

import { factories } from "@strapi/strapi";

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

export default factories.createCoreController(
  "api::work-flow-testimonial.work-flow-testimonial",
  ({ strapi }) => ({
    async find(ctx) {
      const entries = await strapi.entityService.findMany(
        "api::work-flow-testimonial.work-flow-testimonial",
        {
          populate: {
            
            wayWeWork: {
                populate: {
                  steps: {
                    populate: wayWeWorkStepItems,
                  },
                },
              } as any,
              Testimonials: {
                populate: {
                  testimonial: {
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
