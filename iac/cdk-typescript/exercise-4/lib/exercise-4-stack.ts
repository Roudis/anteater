import * as cdk from 'aws-cdk-lib/core';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';

export class Exercise4Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Floci's default VPC and subnets — verified 2026-09-02/03 via
    // `aws ec2 describe-vpcs`/`describe-subnets` against Floci. These are
    // real, stable IDs Floci always provides, not placeholders.
    const vpc = ec2.Vpc.fromVpcAttributes(this, 'DefaultVpc', {
      vpcId: 'vpc-default',
      availabilityZones: ['us-east-1a', 'us-east-1b', 'us-east-1c'],
      privateSubnetIds: ['subnet-default-a', 'subnet-default-b', 'subnet-default-c'],
    });

    // SEEDED FLAW 4 — public, unencrypted, no backups. Verified
    // 2026-09-02/03: Floci's RDS emulation does not persist
    // publiclyAccessible, storageEncrypted, or backupRetention — cdk
    // deploy succeeds with these values, but a live
    // aws rds describe-db-instances call returns the same wrong values
    // this bug produces on the Terraform track (PubliclyAccessible:
    // false, StorageEncrypted: null, BackupRetentionPeriod: null). The
    // storageEncrypted/backupRetention fields are absent from the raw
    // response (a --query projection of an absent field also renders as
    // null, which is why you may see null reported either way). This is
    // a Floci RDS-emulation-wide gap, not a CloudFormation-specific one
    // like exercises 1-2's S3 gaps — your tool must check this
    // exercise's flaw from the synthesized template (`cdk synth --json`),
    // not a live API call, on this track same as the Terraform track.
    new rds.DatabaseInstance(this, 'PolicyholdersDb', {
      instanceIdentifier: 'acmehealth-policyholders',
      engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.VER_16 }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      vpc,
      publiclyAccessible: true, // SEEDED FLAW 4
      storageEncrypted: false, // SEEDED FLAW 4
      backupRetention: cdk.Duration.days(0), // SEEDED FLAW 4
      credentials: rds.Credentials.fromPassword(
        'acmehealth_app',
        cdk.SecretValue.unsafePlainText('TrainingOnly-NotARealSecret-1'),
      ),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      deletionProtection: false,
    });
  }
}
