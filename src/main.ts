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
  DataAwsCallerIdentity,
} from '@cdktf/provider-aws';
import {
  ApplicationRDSCluster,
  PocketALBApplication,
  PocketPagerDuty,
} from '@pocket-tools/terraform-modules';
import { PagerdutyProvider } from '@cdktf/provider-pagerduty';
import { config } from './config';
import { createUnleashRDS } from './database'

class HashicorpPocketCdktf extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    new AwsProvider(this, 'aws', { region: 'us-east-1' });

    new RemoteBackend(this, {
      hostname: 'app.terraform.io',
      organization: 'Pocket',
      workspaces: [{ prefix: 'HashicorpPocketCdktf-' }],
    });

    new PagerdutyProvider(this, 'pagerduty_provider', {
      token: undefined,
    });

    // Create a PostGreSQL RDS cluster
    const rds = createUnleashRDS(this);

    // Create an ALB and ECS cluster, running Unleash, that uses the above RDS
    this.createPocketAlbApplication(rds);
  }

  private createPocketAlbApplication(rds: ApplicationRDSCluster): PocketALBApplication {
    const region = new DataAwsRegion(this, 'region');
    const caller = new DataAwsCallerIdentity(this, 'caller');
    const pagerDuty = this.createPagerDuty();

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
          containerImage: 'unleashorg/unleash-server:3.1',
          portMappings: [
            {
              hostPort: 80,
              containerPort: 80,
            },
          ],
          envVars: [
            {
              name: 'HTTP_PORT',
              value: '80',
            },
          ],
          secretEnvVars: [
            {
              name: 'DATABASE_HOST',
              valueFrom: `${rds.secretARN}:host::`,
            },
            {
              name: 'CONTENT_DATABASE_PORT',
              valueFrom: `${rds.secretARN}:port::`,
            },
            {
              name: 'DATABASE_USERNAME',
              valueFrom: `${rds.secretARN}:username::`,
            },
            {
              name: 'DATABASE_PASSWORD',
              valueFrom: `${rds.secretARN}:password::`,
            },
            {
              name: 'DATABASE_NAME',
              valueFrom: `${rds.secretARN}:dbname::`,
            },
          ],
        },
      ],

      exposedContainer: {
        name: 'app',
        port: 80,
        healthCheckPath: '/health',
      },

      ecsIamConfig: {
        prefix: config.prefix,
        taskExecutionRolePolicyStatements: [
          {
            actions: ['secretsmanager:GetSecretValue', 'kms:Decrypt'],
            resources: [
              `${rds.secretARN}`,
            ],
            effect: 'Allow',
          },
        ],
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
            config.environment === 'Dev'
              ? []
              : [pagerDuty.snsNonCriticalAlarmTopic.arn],
        },
        httpLatency: {
          evaluationPeriods: 2,
          threshold: 500,
          actions:
            config.environment === 'Dev'
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
