const name = 'HashicorpPocketCdktf';
const environment = 'Dev';

export const config = {
  name,
  prefix: `${name}-${environment}`,
  shortName: 'CDKTF',
  environment,
  domain: 'unleash.miermans.link',
  vpcConfig: {
    vpcId: 'vpc-0ff0d70e1db478359',
    privateSubnetIds: ['subnet-0c7766b4458f1b146', 'subnet-0703a4245726c2a1f', 'subnet-00160a9efd9d6e7c1'],
    publicSubnetIds: ['subnet-07db169acaab3948d', 'subnet-0dd3afa78940c0080', 'subnet-04482cf15ef3a9850'],
  },
  tags: {
    service: name,
    environment,
  },
  unleashPort: 4242,
  pagerDutyEscalationPolicy: 'PQNGU1N',
};
