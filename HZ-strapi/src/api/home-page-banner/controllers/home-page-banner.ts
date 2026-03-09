/**
 * home-page-banner controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController(
  'api::home-page-banner.home-page-banner',
  ({ strapi }) => ({
    async find(ctx) {
      const entries = await strapi.entityService.findMany(
        'api::home-page-banner.home-page-banner',
        {
          populate: {
            background_image: {
              fields: ['url'],
            },
          },
        }
      );

      return entries;
    },
  })
);
