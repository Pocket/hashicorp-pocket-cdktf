import { Construct } from 'constructs';
import { RemoteBackend, TerraformStack } from 'cdktf';
import { AwsProvider } from '@cdktf/provider-aws';
import { PocketALBApplication } from '@pocket-tools/terraform-modules';

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

  private createPocketAlbApplication(): PocketALBApplication {}
}
