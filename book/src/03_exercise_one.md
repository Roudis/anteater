# Exercise One — The Public Bucket

## Deploy it

Pick one IaC flavor from the setup chapter and deploy `acmehealth-raw-claims`.
It's deliberately public — Acme Health's incoming claims documents,
sitting in a bucket anyone on the internet can read.

## Why this matters

Acme Health's raw claims include diagnoses and treatment history —
GDPR Article 9 "special category" data. Article 32(1)(b) requires
"the ability to ensure the ongoing confidentiality" of personal data;
a bucket anyone can read has none. (ISO 27001 also has a relevant
access-control clause here — *UNVERIFIED*: check the current Annex A
text yourself before citing a specific clause number to anyone who'd
rely on it. Getting a citation wrong is worse than not citing one.)

## Build

Extend your tool (`tool/src/cloud_security_compliance/`) to:

1. Connect to the bucket (`boto3`'s `s3` client, pointed at Floci via
   `AWS_ENDPOINT_URL`)
2. Determine whether it's publicly accessible
3. Produce a report — pass or fail, which rule, why it matters — for
   at least this one bucket

**Hint, not an answer:** the AWS API surface for "is this bucket public"
has more than one relevant call. A bucket's access-block settings and its
ACL are two different things, and either one alone being wrong is enough
to expose the data. Read both.

## If you're using CDK: read this before you build

Floci has a real, verified gap: infrastructure deployed via CDK's
CloudFormation path does **not** show this flaw in a live API scan.
Calling `get_public_access_block` against the deployed bucket raises a
`NoSuchPublicAccessBlockConfiguration` error rather than returning clean
flags, and the ACL comes back owner-only — the `PublicRead` the CDK source
declares never actually lands. That's not "nothing to see": it's a live
picture that's genuinely different from, and incomplete relative to, what
the template declares. This isn't a bug in your tool. It's a Floci
limitation specific to how it implements CloudFormation for S3.

This means the CDK track needs a **different kind of check**: not "ask
the live infrastructure," but "read the IaC itself." Run
`pnpm exec cdk synth --json` in the CDK exercise directory and look at
what it produces — your tool can parse that output directly instead of
calling `boto3`. This is a legitimate, real pattern (it's how tools like
Checkov work) — you're not working around a limitation, you're using a
different, equally valid technique.

If you're on the Terraform track, your tool really can just ask Floci
live, and it'll get the right answer.

## Fix it

Once your tool reports the flaw, fix the IaC (both flavors need the
access-block settings and the ACL actually locked down — you saw the
exact fields your tool needs to check; lock those down).
Re-deploy, re-run your tool, confirm the report changes.

No answer key here. If your tool says "compliant" and you're not sure
it's actually checking the right thing, that uncertainty is worth sitting
with before moving on.

Exercise two builds on this one — same bucket, a second flaw.
