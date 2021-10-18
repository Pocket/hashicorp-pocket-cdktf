import { Construct } from 'constructs';
import { ApplicationRDSCluster, PocketVPC } from '@pocket-tools/terraform-modules';
import { config } from './config';

export function createUnleashRDS(scope: Construct) {
  const pocketVpc = new PocketVPC(scope, 'pocket-shared-vpc');

  return new ApplicationRDSCluster(scope, 'rds', {
    prefix: `${config.prefix}-database`,
    vpcId: pocketVpc.vpc.id,
    subnetIds: pocketVpc.privateSubnetIds,
    rdsConfig: {
      databaseName: 'unleash',
      masterUsername: 'demo_user',
      engine: 'aurora-postgresql',
      engineMode: 'serverless',
      scalingConfiguration: [
        {
          minCapacity: 2,
          maxCapacity: 4,
          autoPause: false, // Prevent serverless Aurora from scaling down when there are no requests.
        },
      ],
    },
    tags: config.tags,
  });
}
