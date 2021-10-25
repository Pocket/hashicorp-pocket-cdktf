const name = 'HashicorpPocketCdktf';
const environment = 'Mathijs';

export const config = {
  name,
  prefix: `${name}-${environment}`,
  shortName: 'CDKTF',
  environment,
  domain: 'unleash.miermans.link',
  unleashPort: 4242,
  vpcConfig: {
    vpcId: 'vpc-0ea1f3f6ab6272fc8',
    privateSubnetIds: ['subnet-058de54c802df982b', 'subnet-07aa4361d3e6005e3', 'subnet-0036bd34549112361'],
    publicSubnetIds: ['subnet-08fceeadd4658476d', 'subnet-0257a22a4431ddd54', 'subnet-082b7797f6b2ba8d9'],
  },
  tags: {
    service: name,
    environment,
  },
  pagerDutyEscalationPolicy: 'PQNGU1N',
};
