import * as cdk from 'aws-cdk-lib/core';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class Exercise1Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // SEEDED FLAW 1 — public bucket.
    // Real AWS blocks public access by default; this stack actively disables it,
    // exactly like the Terraform equivalent in ../../terraform/exercise-1/.
    //
    // KNOWN FLOCI GAP (verified 2026-09-02): Floci's CloudFormation path for
    // AWS::S3::Bucket does not apply AccessControl / PublicAccessBlockConfiguration
    // live, even though calling the same S3 API directly does (which is why the
    // Terraform track's equivalent flaw IS live-visible). That's why this
    // exercise's CDK track is checked via `cdk synth`'s template, not a live API
    // scan — see the book's exercise chapter for what that means for your tool.
    new s3.Bucket(this, 'RawClaimsBucket', {
      bucketName: 'acmehealth-raw-claims',
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }),
      accessControl: s3.BucketAccessControl.PUBLIC_READ,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_PREFERRED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
