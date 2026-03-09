module.exports = (config, { strapi }) => {
    return async (ctx, next) => {
      // Add populate=* to the query for all GET requests
      if (ctx.method === "GET" && !ctx.query.populate) {
        ctx.query.populate = "*";
      }
      await next();
    };
  };