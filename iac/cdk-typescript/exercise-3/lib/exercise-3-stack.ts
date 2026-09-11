import * as cdk from 'aws-cdk-lib/core';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class Exercise3Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // SEEDED FLAW 3 — a single role with a wildcard inline policy. For
    // this role and its single inline-policy statement, verified
    // 2026-09-02: a live `aws iam get-role-policy` call against this
    // CDK-deployed role shows the exact same policy document CDK
    // synthesized — no gap found for this specific shape, unlike
    // exercises 1-2's S3 flaws. Both IaC tracks are checked the same
    // way: a live API call, not a synthesized-template scan.
    const role = new iam.Role(this, 'DataPlatformAdminRole', {
      roleName: 'acmehealth-data-platform-admin',
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    });

    role.addToPolicy(new iam.PolicyStatement({
      actions: ['*'],   // SEEDED FLAW 3
      resources: ['*'], // SEEDED FLAW 3
    }));
  }
}
