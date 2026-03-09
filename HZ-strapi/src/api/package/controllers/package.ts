import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::package.package",
  ({ strapi }) => ({
    async find(ctx) {
      const entries = await strapi.entityService.findMany(
        "api::package.package",
        {
          populate: {
            Packages: {
              populate: {
                imageUrl: {
                  fields: ["url"],
                },
              },
            },
          },
        }
      );

      return entries;
    },
  })
);
