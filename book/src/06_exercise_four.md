# Exercise Four — The Uninsured Database

## Deploy it

This exercise leaves S3 and IAM behind. Deploy `iac/*/exercise-4/` in
whichever IaC flavor you've been using — it's a brand-new, independent
resource, an RDS instance called `acmehealth-policyholders`, not another
copy of the `acmehealth-raw-claims` bucket or the
`acmehealth-data-platform-admin` role. There's no teardown-ordering warning
here either: this instance doesn't share a name with anything exercises one
through three created. (The usual within-exercise rule still applies —
Terraform's and CDK's versions of exercise four both create an instance
with this same identifier, so work in one `iac/*/exercise-4/` directory at
a time, per `02_setup.md`.)

One thing that will feel different: this deploy can take noticeably longer
than the S3 and IAM exercises did. Those finished in seconds. An RDS
instance is a heavier resource even on Floci — on the Terraform track,
expect something closer to a minute of "still creating" output before it
settles (the CDK track's own creation call can return much faster, so
don't read a quick CDK deploy as a sign something didn't happen — check
the flaw statically either way, as covered below). If Terraform seems to
sit at "still creating" for a while, that's normal; don't assume something's
stuck.

## Why this matters

`acmehealth-policyholders` holds exactly what its name says: Acme Health's
policyholder records — health data (diagnoses, treatment and claims
history) and the personal/contact information tied to it. This instance
ships with three separate properties set the wrong way, and each one is
its own failure mode if this were a real database instead of a training
one:

- **`publicly_accessible = true`** — reachable from the open internet, not
  just from Acme Health's own network. Anyone who finds the endpoint can
  attempt to connect.
- **`storage_encrypted = false`** — the underlying storage volume is not
  encrypted at rest. A copy of the disk, a snapshot, or a decommissioned
  volume that isn't properly wiped exposes the data in the clear.
- **`backup_retention_period = 0`** — no automated backups at all. If this
  database were corrupted, ransomed, or accidentally dropped, there is
  nothing to restore from. The data is simply gone.

The first two properties repeat, on a database, the same GDPR Article 32(1)
provisions exercises one and two already introduced: public reachability
is a confidentiality failure under **Article 32(1)(b)** ("the ability to
ensure the ongoing confidentiality... of processing systems"), and
disabled storage encryption is the same encryption obligation exercise
two's chapter quoted from **Article 32(1)(a)**. Nothing new to verify
there — same clauses, same regulation, a different resource this time.

The third property, zero backup retention, is new, and it maps to a GDPR
sub-clause none of the earlier exercises needed: **Article 32(1)(c)**,
which requires "the ability to restore the availability and access to
personal data in a timely manner in the event of a physical or technical
incident." (Checked directly against the Article 32 text itself, not
assumed from the word "backups" sounding like a plausible fit — (a) covers
encryption/pseudonymisation and (b) covers confidentiality/integrity/
availability/resilience of the *processing systems*; (c) is the one that
specifically names the *ability to restore* data after an incident, which
is exactly what a zero backup-retention window removes. No `UNVERIFIED`
marker needed — the clause text is unambiguous.)

A note on scope, worth stating plainly rather than reaching for a citation
that doesn't actually fit: Acme Health does process card payments
elsewhere (premiums collected by card, reimbursements with IBAN details),
and that does bring PCI-DSS into scope *somewhere* in this environment.
But it isn't in scope for *this instance*. `acmehealth-policyholders`
holds health records and policyholder PII, not cardholder data — the
card-payment data lives in a separate table, in a database this exercise
doesn't touch.
Bolting a PCI-DSS citation onto a database that holds no card data would
be exactly the kind of imprecise compliance reasoning this course is
trying to train you out of. What *does* apply a second time here, on top
of GDPR Article 32(1)(c), is **ISO/IEC 27001:2022 Annex A control 8.13,
"Information backup"**, which states: "Backup copies of information,
software and systems should be maintained and regularly tested in
accordance with the agreed topic-specific policy on backup." (ISO/IEC
27002:2022 restates this identical control statement and then adds a
Purpose, Guidance, and Other-information section beyond it — Annex A's own
entry is not just a bare title, it carries this one-sentence statement
itself, the same statement both standards share for this control.) A
database with backups switched off entirely isn't falling short of
"maintained and regularly tested" backups — it isn't attempting them.
(Checked directly against the current 2022 Annex A control list and its
own control-statement text via web search — no `UNVERIFIED` marker
needed.)

## Build

Extend the same tool one more time — same package, same
`tool/src/cloud_security_compliance/` layout, additive to what exercises
one through three's checks already report.

Here's the structural point this exercise is actually built around: on
exercises one and two, only the CDK track had a live-detection gap
(Floci's CloudFormation path didn't reproduce the flaw; Terraform's direct
API calls did). On exercise three, neither track had one — a live call
against the deployed role told the truth either way. This exercise is
different from both: **the live-detection gap here affects the Terraform
track and the CDK track identically.**

Deploy this instance either way, then call `describe-db-instances` against
it. You'll get back `PubliclyAccessible: false`, no `StorageEncrypted` key
at all, and no `BackupRetentionPeriod` key at all — regardless of which
tool created the instance, and regardless of what the IaC actually
requested. This isn't a CloudFormation-specific gap the way exercises
one and two's was. It's Floci's RDS emulation itself not persisting or
surfacing these three fields reliably, full stop.

That makes this a more realistic lesson than the CDK-vs-Terraform framing
the last three exercises taught, not a less realistic one. In the real
world, a live API can be wrong for reasons that have nothing to do with
which IaC tool wrote the resource: eventual consistency between a
control plane and its data plane, a caching layer serving stale reads, or
a plain control-plane bug in the provider itself. A compliance tool that
only ever trusts "ask the live API" inherits every one of those failure
modes, on every IaC tool equally. The fix is the same one exercise one's
CDK track already taught you, just no longer tied to which tool you
picked: **check this exercise's flaw from the IaC source or the
synthesized template, not from a live call.**

**Hint, not an answer:** on the Terraform track, the three property names
you're looking for in `rds.tf` are exactly the argument names in the
`aws_db_instance` resource block. On the CDK track, run
`pnpm exec cdk synth --json` and look inside the resulting
`AWS::RDS::DBInstance` resource's `Properties` — the field names there are
close to, but not identical in casing to, the Terraform argument names.
Extend your tool to parse one of those two sources — the same approach
exercise one's CDK track had to use, reading the source or synthesized
template instead of a live call. If you've been on the Terraform track
through exercises 1-3, this is the first time you'll need it too: every
live call you've written so far has told the truth, so there's been no
reason to reach for the source/template until now.

## If you're using CDK: read this before you build

This RDS construct needs a VPC to attach to, unlike the S3 buckets and IAM
role from earlier exercises. The exercise's stack wires it up against
Floci's actual default VPC and subnets rather than a placeholder — nothing
you need to change, just don't be surprised to see VPC/subnet IDs
hard-coded in `lib/exercise-4-stack.ts` where earlier stacks had none.

On detection, there's nothing track-specific to add beyond what the Build
section above already said: this is the one exercise so far where CDK
doesn't need a different technique than Terraform. Both tracks are
live-blind on all three properties, in the same way, for the same reason.
Read `cdk synth --json`'s output the same way the Terraform track reads
`rds.tf` — that's the whole adjustment.

## Fix it

Once your tool reports the flaw, fix the IaC: set `publicly_accessible`
(or `publiclyAccessible`) to `false`, `storage_encrypted`
(`storageEncrypted`) to `true`, and give `backup_retention_period`
(`backupRetention`) a real, non-zero retention window. Redeploy.

Here's the part worth being deliberate about, and it's been checked
directly rather than assumed: a throwaway Terraform deploy with the fixed
values (`publicly_accessible = false`, `storage_encrypted = true`,
`backup_retention_period = 7`), re-checked live against Floci via an
independent `aws rds describe-db-instances` call and then destroyed,
turns up a more precise — and more interesting — result than "just as
unreliable, in the opposite direction." `PubliclyAccessible` correctly
reads `false` after the fix, but coincidentally: Floci's RDS emulation
always reports `false` for this field regardless of what's requested, and
`false` happens to also be the fixed value, so a live re-check gets the
right answer for the wrong reason. `StorageEncrypted` and
`BackupRetentionPeriod`, by contrast, remain absent from the live response
entirely, even set to `true`/`7` — not flipped to a wrong-but-compliant-
looking value, just still missing, exactly as before the fix. A live
re-check on those two properties is genuinely uninformative in either
direction: it won't falsely confirm the fix, but it won't falsely deny it
either. None of this makes a live call a substitute for re-reading the
source. Confirm the fix the same way you confirmed the flaw: re-read the
Terraform source or re-run `cdk synth --json` and check the same fields
your tool already knows to look for. If your tool's report changes when
you re-run it against the source/template, the fix worked — regardless of
what a live call would or wouldn't tell you.

No answer key here. If your tool says this instance is compliant and you
can't point to which line of `rds.tf` or which field of the synthesized
template told it that, that's worth sitting with before moving on.

Exercise five moves to Module B — a leaked credential, and a permission
boundary that has to actually hold under live testing.
