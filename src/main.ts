import { Construct } from 'constructs';
import { App, RemoteBackend, TerraformStack } from 'cdktf';
import { AwsProvider } from '@cdktf/provider-aws';
import { config } from './config';
import { PocketALBApplication } from '@pocket-tools/terraform-modules';

class HashicorpPocketCdktf extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    new AwsProvider(this, 'aws', { region: 'us-east-1' });

    new RemoteBackend(this, {
      hostname: 'app.terraform.io',
      organization: 'Pocket',
      workspaces: [{ prefix: `${config.name}-` }],
    });

    this.createPocketAlbApplication();
  }

  /**
   * Creates an ECS application behind a load balancer
   * @private
   */
  private createPocketAlbApplication(): PocketALBApplication {
    return new PocketALBApplication(this, 'application', {
      internal: false, // explain this prop
      prefix: config.prefix, // prefixing the names all resources for this service
      alb6CharacterPrefix: config.shortName, // joke about AWS (6 character prefix limit)
      tags: config.tags, // good to talk about, briefly
      cdn: false, // explain this prop
      domain: config.domain, // explain this prop
      containerConfigs: [
        // TODO: add container config as a step
        {
          name: 'app',
          containerImage: 'httpd',
          portMappings: [
            {
              hostPort: 80,
              containerPort: 80,
            },
          ],
          // highlight health check
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
      exposedContainer: {
        name: 'app',
        port: 80,
        healthCheckPath: '/', // alb health check
      },
      // Pocket use code deploy to do blue-green deployments
      // of out applications
      codeDeploy: {
        useCodeDeploy: false,
      },
      // TODO: add the iam config as a step
      ecsIamConfig: {
        prefix: config.prefix,
        taskExecutionRolePolicyStatements: [],
        taskRolePolicyStatements: [],
        taskExecutionDefaultAttachmentArn:
          'arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy',
      },
      // TODO: add autoscaling as a step
      autoscalingConfig: {
        targetMinCapacity: 1,
        targetMaxCapacity: 2,
      },
      // TODO: add alarms as a step
      alarms: {
        http5xxErrorPercentage: {
          threshold: 10,
          evaluationPeriods: 2,
          period: 600,
          actions: [],
        },
        httpLatency: {
          evaluationPeriods: 2,
          threshold: 500,
          actions: [],
        },
      },
    });
  }
}

const app = new App();
new HashicorpPocketCdktf(app, 'pocket-cdktf');
app.synth();
