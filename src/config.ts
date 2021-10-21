const name = 'HashicorpPocketCdktf';
const environment = 'Dev';

export const config = {
  name,
  prefix: `${name}-${environment}`,
  shortName: 'CDKTF',
  environment,
  domain: 'cdktf-unleash.getpocket.dev',
  unleashPort: 4242,
  vpcConfig: {
    id: '',
    privateSubnets: [],
    publicSubnets: [],
  },
  tags: {
    service: name,
    environment,
  },
};
