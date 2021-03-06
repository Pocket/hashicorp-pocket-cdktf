import { Construct } from 'constructs';
import { RemoteBackend, TerraformStack } from 'cdktf';
import { AwsProvider } from '@cdktf/provider-aws';
import { PocketALBApplication } from '@pocket-tools/terraform-modules';

const name = 'HashicorpPocketCdktf';
const environment = 'Dev';

const config = {
  name,
  prefix: `${name}-${environment}`,
  shortName: 'CDKTF',
  environment,
  domain: 'cdktf.getpocket.dev',
  tags: {
    service: name,
    environment,
  },
};

class HashicorpPocketCdktf extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    new AwsProvider(this, 'aws', { region: 'us-east-1' });

    new RemoteBackend(this, {
      hostname: 'app.terraform.io',
      organization: 'Pocket',
      workspaces: [{ prefix: 'HashicorpPocketCdktf-' }],
    });

    this.createPocketAlbApplication();
  }

  private createPocketAlbApplication(): PocketALBApplication {
    return new PocketALBApplication(this, 'application', {
      internal: false,
      prefix: config.prefix,
      alb6CharacterPrefix: config.shortName,
      tags: config.tags,
      cdn: false,
      domain: config.domain,

      containerConfigs: [
        {
          name: 'app',
          containerImage: 'httpd',
          portMappings: [
            {
              hostPort: 80,
              containerPort: 80,
            },
          ],
        },
      ],

      exposedContainer: {
        name: 'app',
        port: 80,
        healthCheckPath: '/', // alb health check
      },

      ecsIamConfig: {
        prefix: config.prefix,
        taskExecutionRolePolicyStatements: [],
        taskRolePolicyStatements: [],
        taskExecutionDefaultAttachmentArn:
          'arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy',
      },
    });
  }
}
