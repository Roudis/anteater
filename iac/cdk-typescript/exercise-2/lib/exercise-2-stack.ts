import * as cdk from 'aws-cdk-lib/core';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class Exercise2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // SEEDED FLAW 1 — public bucket. Unchanged from exercise 1 — same
    // resource, same flaw, ships still-flawed so exercise 2 works standalone.
    //
    // SEEDED FLAW 2 — encrypted, but with the AWS-managed key, not a
    // customer-managed one, and no versioning. Verified 2026-09-02 against
    // aws-cdk-lib's shipped type declarations (aws-s3/lib/bucket.d.ts, the
    // parseEncryption doc table): with props.encryptionKey left undefined,
    // BucketEncryption.KMS_MANAGED resolves to SSE-KMS with encryptionKey
    // (return value) = undefined — i.e. no key is passed to CloudFormation,
    // so AWS resolves it to the account's AWS-managed aws/s3 key. By
    // contrast, BucketEncryption.KMS with encryptionKey left undefined
    // resolves to "new key" — CDK auto-creates and references a new
    // customer-managed KMS key. Confirmed empirically via `cdk synth`: this
    // stack's synthesized BucketEncryption.ServerSideEncryptionConfiguration
    // has SSEAlgorithm "aws:kms" and no KMSMasterKeyID at all (compare a
    // BucketEncryption.KMS synth, which adds a KMSMasterKeyID referencing a
    // new AWS::KMS::Key resource CDK created just for this bucket).
    //
    // KNOWN FLOCI GAP (verified 2026-09-02): once deployed, a live
    // `aws s3api get-bucket-encryption` call against this CDK-created bucket
    // returns SSEAlgorithm "AES256" — a different algorithm than the
    // "aws:kms" this stack's synthesized CloudFormation template actually
    // declares. This is a different (and more severe) manifestation of the
    // same class of gap exercise 1 found in Floci's CloudFormation-to-S3
    // path: there, a property was silently dropped; here, the live API
    // reports an outright wrong value. That's why this exercise's CDK track
    // must check the synthesized template, not the live API, for the
    // encryption flaw specifically — see the book's exercise two chapter.
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
      encryption: s3.BucketEncryption.KMS_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
