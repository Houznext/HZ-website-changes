export const getApiEndpoint = () => {
  const env = process.env.NODE_ENV;

  if (env === 'development') {
    return process.env.LOCAL_API_ENDPOINT;
  } else if (env === 'production') {
    return process.env.PROD_API_ENDPOINT;
  } else {
    return process.env.DEV_API_ENDPOINT;
  }
};
