# Exercise Five — The Leaked Key

## Deploy it

This is Module B: a new, independent resource, an IAM user called
`acmehealth-claims-ingest` — not another copy of anything from exercises
one through four. There's no teardown-ordering warning here either: this
user doesn't share a name with anything earlier exercises created. (The
usual within-exercise rule still applies — Terraform's and CDK's versions
of exercise five both create a user with this same identifier, so work in
one `iac/*/exercise-5/` directory at a time, per `02_setup.md`.)

Deploy `iac/*/exercise-5/` in whichever flavor you're using. Once it's up,
you'll have a file — `committed-credentials.env` — sitting in your working
directory, holding a real, working access key ID and secret for this user.
Terraform generates it automatically on `apply`. On the CDK track, run the
one extra command in that exercise's `README.md` to capture it from the
stack's outputs. Either way: this file is gitignored in this repository,
deliberately, so it never becomes a permanently public secret sitting in a
shared GitHub repo. The exercise is "imagine your deploy pipeline
generated this and it wasn't gitignored" — not "here's a secret you should
worry is actually exposed to the internet." It's real, it's Floci-only, it
works nowhere else.

## Why this matters

`acmehealth-claims-ingest` is exactly the kind of identity a real incident
starts with: an automation account, not a person, that some pipeline
somewhere assumes to do its job. Two things are wrong with it.

**First: a real credential sitting in a file.** Anyone who reads
`committed-credentials.env` — because it ended up in a repo, a container
image layer, a backup, a support ticket, wherever — has this identity's
full access for as long as the key stays active. This is the same
starting point as Capital One's 2019 breach: a misconfigured firewall let
a former AWS employee reach an exposed credential and pull data on more
than 100 million customers. The fallout was an $80 million OCC fine, a
$190 million class-action settlement (2022), and a criminal conviction of
the attacker on wire fraud and unauthorized-access charges. (Checked
directly against public reporting on the case, not asserted from memory.)

**Second, and less obvious: even with the key, there's no ceiling.** The
identity's policy allows `s3:*` on `Resource: "*"` — anything S3 allows,
on every bucket in the account, not scoped to whatever this pipeline
actually needs to touch. Nothing about *this* property is about the key
leaking; it's about what happens once someone has it. A credential with a
narrow ceiling limits the blast radius of its own leak. This one doesn't
have one.

Two frameworks name this second half directly:

- **NIST SP 800-53 Rev. 5, AC-6, "Least Privilege,"** requires organizations to "employ the principle of least privilege, allowing only authorized accesses for users (or processes acting on behalf of users) that are necessary to accomplish organizational tasks." A blanket `s3:*` grant to an ingest pipeline is the opposite of this — nothing here was scoped to what the pipeline's actual job requires.
- **SOC 2 CC6.3** requires that "the entity authorizes, modifies, or removes access to data, software, functions, and other protected information assets based on roles, responsibilities, or the system design and changes, giving consideration to the concepts of least privilege and segregation of duties." This is a different criterion from exercise three's CC6.1 (which is about implementing access-control software generally) — CC6.3 is specifically about *how* access gets granted and scoped, which is exactly what's missing here: no permission boundary was ever authorized to cap what this identity's own policy allows.

(Both checked directly against their published text — the AICPA's 2017 Trust Services Criteria for CC6.3, and NIST SP 800-53 Rev. 5's own control statement for AC-6 — rather than asserted from memory. No `UNVERIFIED` marker needed on either.)

**A note on scope, the same discipline exercise four used**: Acme Health
does process card payments elsewhere in its real business (premiums by
card, reimbursements with IBAN details), so PCI-DSS genuinely applies
*somewhere* in this environment. It doesn't apply to *this* resource. This
exercise's user is a pipeline identity with a wildcard S3 grant — it isn't
itself a cardholder-data store, and nothing in this exercise gives it one.
Capital One's own incident had a PCI angle because Capital One is a card
issuer; Acme Health's identical *mechanism* (leaked credential, no
ceiling) doesn't inherit that angle just because the anchor story has one.
Citing PCI-DSS here would be exactly the kind of imprecise reasoning this
course is trying to train you out of.

## Build

Extend the same tool one more time — same package, same
`tool/src/cloud_security_compliance/` layout, additive to what exercises
one through four's checks already report.

**Hint, not an answer, for the first flaw:** AWS access key IDs aren't
random-looking strings — they follow a well-documented, stable, publicly
known format. You don't need to reimplement a general-purpose secret
scanner (that's a much bigger project than this exercise); you need to
know that format exists and look for it in the files sitting in this
exercise's directory. This is a narrower, more precise version of "search
for secrets" — know the specific shape of the thing you're looking for,
rather than guessing at what "looks sensitive."

**Hint, not an answer, for the second flaw:** an IAM user's own
description of itself — the same kind of API response exercise three had
you read to find a wildcard policy — tells you whether it has a
permission boundary attached at all. Present or absent is the check; you
don't need to inspect what the boundary actually restricts to detect that
one is simply missing.

## If you're using CDK: read this before you build

Unlike exercises one, two, and four, there's no live-vs-static detection
gap to design around here — a live check against the deployed user tells
the truth on both tracks, the same way exercise three's IAM role did.

There *is* something else worth knowing before you redeploy, though.
**`cdk destroy` on this exercise does not actually remove the IAM user or
its access key**, even though the CloudFormation stack itself is genuinely
deleted. If you destroy your stack and then try to redeploy — to confirm a
fix, for instance — `cdk deploy` will fail with a name collision on
`acmehealth-claims-ingest`, because the orphaned user from your last
deploy is still sitting there. This exercise's CDK `README.md` has the
exact manual cleanup command. The Terraform track doesn't have this
problem — `terraform destroy` genuinely removes the equivalent user.

## Fix it

Once your tool reports both flaws, fix the IaC. This has two real parts,
not one:

- **The exposed credential**: the fix isn't "delete the file." The
  identity's key is still valid and still works until it's actually
  rotated or deleted — the file was never the vulnerability, the live
  credential is. Rotate or remove the access key as part of your fix, not
  just the file that happened to expose it.
- **The missing boundary**: attach a permission boundary that actually
  scopes what this identity can do. What should a claims-ingest pipeline
  be able to do? Narrower than `s3:*` on every bucket, certainly — but
  there isn't one universally correct answer here, the same kind of design
  judgment call exercise three's wildcard-role fix required. Pick a scope
  you can justify.

Redeploy, re-run your tool, and confirm both checks now pass — and, if any
earlier exercise's stack is still deployed, confirm those checks still run
correctly alongside this one too.

**One more thing worth trying, entirely by hand, not something your tool
needs to do**: this exercise doesn't create a bucket for you to test
against, so make one — with the leaked credential itself, since its
`s3:*` grant allows that too (worth sitting with: this identity can even
create its own attack infrastructure). Set `AWS_ACCESS_KEY_ID`/
`AWS_SECRET_ACCESS_KEY` from `committed-credentials.env` in your shell,
then `aws s3 mb s3://<any-name-you-like>`, then `aws s3 cp` a file up
(`PutObject`) and back down (`GetObject`) — both should succeed. Attach
your boundary, then try the exact same two calls again. If your boundary
is scoped correctly, one of them should now fail. This is the closest
thing in this course to actually being on the other side of an incident:
not reading a report about what a leaked key *could* do, but watching
what it *can* and *can't* do change, live, in front of you.

No answer key here. If you can't say which specific actions and resources
your boundary allows and why, that's worth sitting with before moving on.

Exercise six moves to Module C — a different infrastructure layer
entirely, Kubernetes, and a flaw Kubernetes ships with by default rather
than one someone had to actively create.
