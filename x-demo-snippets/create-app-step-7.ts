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
          healthCheck: {
            command: [
              'CMD-SHELL',
              'printf "GET / HTTP/1.1\\n\\n" > /dev/tcp/127.0.0.1/80 || exit 1',
            ],
            interval: 15,
            retries: 3,
            timeout: 5,
            startPeriod: 0,
          },
        },
      ],
    });
  }
}
