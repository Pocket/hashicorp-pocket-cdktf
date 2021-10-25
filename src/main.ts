import { Construct } from 'constructs';
import {
  App,
  DataTerraformRemoteState,
  RemoteBackend,
  TerraformStack,
} from 'cdktf';
import {
  AwsProvider,
  DataAwsRegion,
} from '@cdktf/provider-aws';
import {
  PocketALBApplication,
  PocketPagerDuty,
} from '@pocket-tools/terraform-modules';
import { NullProvider } from '@cdktf/provider-null';
import { PagerdutyProvider } from '@cdktf/provider-pagerduty';

const name = 'HashicorpPocketCdktf';
const environment = 'Dev';

const config = {
  name,
  prefix: `${name}-${environment}`,
  shortName: 'CDKTF',
  environment,
  domain: 'cdktf.getpocket.dev',
  vpcConfig: {
    vpcId: 'vpc-id-goes-here',
    privateSubnetIds: ['first-private-subnet-id-goes-here'],
    publicSubnetIds: ['first-public-subnet-id-goes-here'],
  },
  tags: {
    service: name,
    environment,
  },
};

class HashicorpPocketCdktf extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    new AwsProvider(this, 'aws', { region: 'us-east-1' });
    new NullProvider(this, 'null_provider');

    new RemoteBackend(this, {
      hostname: 'app.terraform.io',
      organization: 'Pocket',
      workspaces: [{ prefix: 'HashicorpPocketCdktf-' }],
    });

    new PagerdutyProvider(this, 'pagerduty_provider', {
      token: undefined,
    });

    this.createPocketAlbApplication();
  }

  private createPocketAlbApplication(): PocketALBApplication {
    const region = new DataAwsRegion(this, 'region');
    const pagerDuty = this.createPagerDuty();

    return new PocketALBApplication(this, 'application', {
      region: region.name,
      internal: false,
      prefix: config.prefix,
      alb6CharacterPrefix: config.shortName,
      tags: config.tags,
      cdn: false,
      domain: config.domain,
      vpcConfig: config.vpcConfig,

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
        healthCheckPath: '/',
      },

      ecsIamConfig: {
        prefix: config.prefix,
        taskExecutionRolePolicyStatements: [],
        taskRolePolicyStatements: [],
        taskExecutionDefaultAttachmentArn:
          'arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy',
      },

      autoscalingConfig: {
        targetMinCapacity: 1,
        targetMaxCapacity: 2,
      },

      alarms: {
        http5xxErrorPercentage: {
          threshold: 10,
          evaluationPeriods: 2,
          period: 600,
          actions:
            environment === 'Dev'
              ? []
              : [pagerDuty.snsNonCriticalAlarmTopic.arn],
        },
        httpLatency: {
          evaluationPeriods: 2,
          threshold: 500,
          actions:
            environment === 'Dev'
              ? []
              : [pagerDuty.snsNonCriticalAlarmTopic.arn],
        },
      },

      codeDeploy: {
        useCodeDeploy: false,
      },
    });
  }

  private createPagerDuty() {
    const incidentManagement = new DataTerraformRemoteState(
      this,
      'incident_management',
      {
        organization: 'Pocket',
        workspaces: {
          name: 'incident-management',
        },
      }
    );

    return new PocketPagerDuty(this, 'pagerduty', {
      prefix: config.prefix,
      service: {
        criticalEscalationPolicyId: incidentManagement.get(
          'policy_backend_critical_id'
        ),
        nonCriticalEscalationPolicyId: incidentManagement.get(
          'policy_backend_non_critical_id'
        ),
      },
    });
  }
}

const app = new App();
new HashicorpPocketCdktf(app, 'pocket-cdktf');
app.synth();
