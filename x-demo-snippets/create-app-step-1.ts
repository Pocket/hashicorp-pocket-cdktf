import { Construct } from 'constructs';
import { TerraformStack } from 'cdktf';

class HashicorpPocketCdktf extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);
  }
}
