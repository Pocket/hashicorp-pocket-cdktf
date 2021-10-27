import { Construct } from 'constructs';
import { ApplicationRDSCluster } from '@pocket-tools/terraform-modules';
import { config } from './config';

export function createUnleashRDS(scope: Construct) {
  return new ApplicationRDSCluster(scope, 'rds', {
    prefix: `${config.prefix}-database`,
    vpcId: config.vpcConfig.vpcId,
    subnetIds: config.vpcConfig.privateSubnetIds,
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
