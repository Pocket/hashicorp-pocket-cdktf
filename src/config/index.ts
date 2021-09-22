const name = 'HashicorpPocketCdktf';
const domainPrefix = 'cdktf';
export const isDev = process.env.NODE_ENV === 'development';
const environment = 'Dev';
const domain = `${domainPrefix}.getpocket.dev`;

export const config = {
  name,
  prefix: `${name}-${environment}`,
  shortName: 'CDKTF',
  environment,
  domain,
  tags: {
    service: name,
    environment,
  },
};
