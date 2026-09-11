import * as cdk from 'aws-cdk-lib/core';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class Exercise5Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // SEEDED FLAW 5 — a broad-access IAM user with no permission boundary,
    // whose real access key secret is exposed via a stack output. Verified
    // 2026-09-10: Floci enforces permission boundaries as a genuine
    // intersection with identity policy — PutObject is denied and GetObject
    // succeeds when the boundary only grants GetObject, even though the
    // identity policy allows s3:*. See Task 1 Step 1 report for live evidence.
    // CDK's own guardrails require an explicit unsafeUnwrap() call to expose
    // a SecretValue in a CfnOutput — the method name was verified against
    // the installed aws-cdk-lib/aws-iam/lib/access-key.d.ts and
    // aws-cdk-lib/core/lib/secret-value.d.ts before use.
    const user = new iam.User(this, 'ClaimsIngestUser', {
      userName: 'acmehealth-claims-ingest',
      // No permissionsBoundary prop -> SEEDED FLAW 5 (no permission boundary).
    });

    user.addToPolicy(new iam.PolicyStatement({
      actions: ['s3:*'],   // SEEDED FLAW 5 — no scoping
      resources: ['*'],    // SEEDED FLAW 5 — no scoping
    }));

    const accessKey = new iam.AccessKey(this, 'ClaimsIngestAccessKey', {
      user,
    });

    // SEEDED FLAW 5 — the access key ID and secret are written to stack
    // outputs. The secretAccessKey property returns a SecretValue; CDK
    // requires an explicit unsafeUnwrap() call here, which is the same
    // pattern of defensive friction CDK uses for any plaintext-secret
    // exposure (cf. exercise 4's SecretValue.unsafePlainText for a DB
    // password). The unsafeUnwrap() method name was verified from the
    // installed .d.ts file.
    new cdk.CfnOutput(this, 'AccessKeyId', {
      value: accessKey.accessKeyId,
    });
    new cdk.CfnOutput(this, 'SecretAccessKey', {
      value: accessKey.secretAccessKey.unsafeUnwrap(), // SEEDED FLAW 5
    });

    // KNOWN FLOCI GAP (verified 2026-09-10): `cdk destroy` on this stack
    // does not actually remove the IAM user or its access key, even
    // though the CloudFormation stack itself is genuinely deleted (a
    // follow-up describe-stacks correctly errors "does not exist") and
    // the user's inline policy IS correctly removed. A live get-user call
    // after destroy still shows the user with an Active access key. This
    // is a different manifestation than exercises 1-2's S3 gaps (there, a
    // property was silently dropped at creation time) — here, deletion
    // itself doesn't propagate for these two specific resource types.
    // Terraform's direct API path (this exercise's Terraform track) does
    // not have this problem — see this exercise's README for the manual
    // cleanup workaround required before any redeploy on the CDK track.
  }
}
