import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::hero-card-section-package.hero-card-section-package',
  ({ strapi }) => ({
    async find(ctx) {
      const entries = await strapi.entityService.findMany(
        'api::hero-card-section-package.hero-card-section-package',
        {
          populate: {
            heroCardItems: {
              populate: {
                packages: {
                  populate: {
                    image: {
                      fields: ['url'],
                    },
                  },
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
