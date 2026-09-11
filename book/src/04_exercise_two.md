# Exercise Two — The Wrong Key

## Deploy it

Same bucket name, `acmehealth-raw-claims`, same IaC flavor you picked for
exercise one — but this is a separate exercise directory (`iac/*/exercise-2/`)
with its own state, not a continuation of exercise one's deployment. **If
exercise one's stack is still deployed, destroy it first** (`terraform
destroy` or `cdk destroy`, from exercise one's own directory) — both
exercises create a bucket with this exact name, and having both stacks live
at once means the second deploy will either fail on a name collision or, on
the CDK track, leave two CloudFormation stacks contending for the same
bucket. Once exercise one's stack is down, deploy exercise two fresh. It
ships with exercise one's public-bucket flaw still present (unfixed,
deliberately, so this exercise stands on its own if you're working it in
isolation), plus a second, quieter flaw layered on top.

## Why this matters

Exercise one asked a yes/no question: is the bucket public? This one
doesn't. Encryption on `acmehealth-raw-claims` is genuinely switched on —
a bucket-encryption check against it will not come back empty. Acme
Health's raw claims include diagnoses and treatment history, GDPR Article 9
"special category" data, and GDPR Article 32(1)(a) names "the
pseudonymisation and encryption of personal data" as one of the security
measures a controller must be able to point to. A check that stops at "is
server-side encryption configured: yes/no" will call this bucket compliant.
That's exactly why this is a better check to build than exercise one's —
and a more realistic one. Real audit failures rarely look like "nothing was
turned on"; they look like this.

The problem is *which key* is doing the encrypting. The bucket is
configured for SSE with `aws:kms`, but it's never given a customer-managed
key, so it resolves to the AWS-managed `aws/s3` key instead. Acme Health
can't rotate that key on its own schedule, can't revoke it to cut off
access to data at rest independently of AWS, and gets no separate audit
trail of who used it for this bucket specifically. ISO/IEC 27001:2022
Annex A control 8.24, "Use of cryptography," is precisely about an
organization defining and controlling rules for this — key management
included — and an AWS-managed key that Acme Health never chose and can't
govern is the opposite of that. (Checked directly against the current 2022
Annex A control list for this citation — the control number and title are
unambiguous, so unlike exercise one's ISO citation, this one doesn't carry
an `UNVERIFIED` marker.)

Versioning is the second flaw, and it's simpler to state: this bucket
doesn't have any. Without it, an overwritten or deleted claims document is
gone — no recovery, and no record that a prior version ever existed.

## Build

Extend the same tool you started in exercise one — same package, same
`tool/src/cloud_security_compliance/` layout. This is additive: exercise
one's public-bucket check should still run and still report, alongside
whatever you add here, not get replaced by it.

**Hint, not an answer:** there are two separate things to check, and they
live in two separate API responses.

- For the key: look at what `get-bucket-encryption` returns for the bucket.
  The algorithm field alone won't tell you whether the key behind it is
  customer-managed or AWS-managed — look at what else is (or isn't) present
  in that same response to identify the key itself.
- For versioning: look at what `get-bucket-versioning` returns. Think about
  what the response looks like for a bucket that's never had versioning
  touched at all, versus one where it's been explicitly enabled, versus one
  where it's been explicitly suspended — three different states, not two.

## If you're using CDK: read this before you build

You already know from exercise one that Floci's CloudFormation path doesn't
reproduce the ACL/public-access-block flaw live, and that the fix was to
check the synthesized template (`cdk synth --json`) instead of asking the
live API. Exercise two's CDK track needs the same synth-based approach for
encryption — but the reason is different, and more surprising, than
exercise one's gap.

On the Terraform track, a live `get-bucket-encryption` call against the
deployed bucket does show the flaw — the response is complete and accurate,
the same response shape the Build section above already told you to go
read closely.

On the CDK track, the live API isn't just incomplete — it's actively wrong.
The CloudFormation template CDK synthesizes genuinely declares
`SSEAlgorithm: "aws:kms"`, the same as Terraform. But Floci's live
`get-bucket-encryption` against a CDK-deployed version of this bucket
reports `SSEAlgorithm: "AES256"` — a different algorithm than the one that
was actually requested, not a missing detail about the same one. A tool
that only ever asks the live API here would conclude the bucket is using
plain default encryption and would never see that SSE-KMS-with-the-wrong-key
was requested at all. If you're on the CDK track, this check needs to read
the synthesized template, the same way exercise one's ACL check did —
asking Floci live will actively mislead you here, not just fall short of
the full picture.

Versioning doesn't have this problem on either track: the live API reports
the true state accurately either way.

## Fix it

Once your tool reports the flaw, fix the IaC: give the bucket a
customer-managed KMS key instead of leaving it on the AWS-managed default,
and add versioning. Redeploy, re-run your tool, and confirm both new checks
now pass — and confirm exercise one's public-bucket check still reports the
flaw correctly too, since this directory ships with it unfixed.

No answer key here. If your tool says the key is fine and you can't point
to which field in the response told it that, that's worth sitting with
before moving on.

Exercise three moves off S3 entirely — an IAM role, not a bucket.
