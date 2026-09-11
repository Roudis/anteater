# Exercise Three — The All-Access Role

## Deploy it

This exercise leaves S3 behind. Deploy `iac/*/exercise-3/` in whichever IaC
flavor you've been using — it's a brand-new, independent resource, an IAM
role called `acmehealth-data-platform-admin`, not another copy of the
`acmehealth-raw-claims` bucket. There's no teardown-ordering warning to give you here, unlike exercise
two: this role doesn't share a name with anything exercise one or two
created, so there's no cross-exercise collision to worry about. (The usual
rule still applies within this exercise itself — Terraform's and CDK's
versions of exercise three both create a role with the same name, so work
in one `iac/*/exercise-3/` directory at a time, per `02_setup.md`.)

## Why this matters

The role has exactly one policy statement attached, and it's about as wide
as a policy statement can get:

```json
{
  "Effect": "Allow",
  "Action": "*",
  "Resource": "*"
}
```

Concretely, that means anything that can assume this role — right now,
any EC2 instance, since that's who the trust policy allows — isn't limited
to whatever narrow data-platform task it was presumably created for. It
can read every object in every bucket in the account, delete every table,
create and delete other IAM roles (including granting itself more access,
or granting access to something else entirely), tear down infrastructure,
change billing settings — everything the account's API surface allows,
because the policy places no boundary on which actions or which resources
it can touch. A role like this doesn't fail safely: whatever component ends
up assuming it inherits the blast radius of the entire account, not the
blast radius of its actual job.

Two frameworks name this directly, and they're both worth citing here
because they converge on the same underlying idea rather than saying two
different things:

- **SOC 2 CC6.1** (AICPA 2017 Trust Services Criteria, the "Common
  Criteria" covering logical and physical access) states: "The entity
  implements logical access security software, infrastructure, and
  architectures over protected information assets to protect them from
  security events to meet the entity's objectives." Its "Restricts
  Logical Access" point of focus — a point of focus, not the criterion
  text itself — sharpens that into exactly what a wildcard policy
  violates: logical access "is restricted through the use of access
  control software and rule sets."
- **NIST SP 800-53 AC-3, "Access Enforcement,"** requires systems to
  "enforce approved authorizations for logical access to information and
  system resources in accordance with applicable access control policies."

Both are pointing at the same principle: access should be granted
according to what's actually needed and enforced as such, not granted
wholesale and left ungoverned. A wildcard `Action`/`Resource` pair is the
opposite of an "approved authorization" in any meaningful sense — there's
nothing left to approve or restrict once everything is already allowed.
Both citations were checked directly against their source material (the
AICPA's published 2017 TSC criterion text and point-of-focus text for
CC6.1, and NIST SP 800-53's own control statement for AC-3) rather than
asserted from memory, and both check out unambiguously — no `UNVERIFIED`
marker needed here, the same way exercise two's ISO 27001 citation didn't
need one once verified.

## Build

Extend the same tool again — same package, same
`tool/src/cloud_security_compliance/` layout, additive to what exercise
one and two's checks already report.

**Hint, not an answer:** an IAM role's permissions can come from more than
one place. A role can have policies attached directly to it (inline), and
it can also have separate, reusable policies attached to it (managed) —
these are two different kinds of attachment, and AWS exposes a separate
listing call for each kind. This role happens to use one of them, but your
tool shouldn't assume in advance which one a given role will use — a role
you check later, in a bigger stack, might use the other, or both. Whichever
kind of policy you find, you'll need to look at what its actual policy
document contains — a `Statement` list, each entry with its own `Effect`,
`Action`, and `Resource` fields — and decide what "too broad" means for the
`Action` and `Resource` fields it declares.

Unlike exercises one and two, there's no CDK-specific detection gap to
work around this time — at least not for this role and its single wildcard
policy statement. Both the Terraform and CDK tracks were verified
independently: a live call against the deployed role — whichever of the
two listing-plus-get call pairs your tool ends up using for this
particular role — returns the identical `"Action": "*"` / `"Resource":
"*"` policy document on both tracks, exactly as declared in the source.
Floci's CloudFormation implementation has a real gap for S3 (you've
already run into it, if you're on the CDK track); for this specific
shape — one role, one policy statement — no equivalent gap was
found, unlike exercises 1-2's S3 flaws, so there's no
synthesized-template workaround to reach for here. Whichever IaC flavor
you're on, your tool can check this role the same way: ask the live API.

## Fix it

Once your tool reports the flaw, fix the IaC yourself. The fix isn't
"remove the policy" — the role presumably exists to do *something* — it's
replacing the wildcard with a scoped set of actions and resources that
match what a data-platform admin role would actually need to do.

**Hint, not an answer:** what would this role actually need to do, and can
you name those specific actions instead of `*`? There isn't one correct
answer here — narrowing a wildcard policy down to the right scope is a
design judgment call, the same kind of call a real platform team has to
make, and reasonable people can draw the line in different places. Pick a
scope you can justify, apply it, redeploy, and re-run your tool to confirm
the report changes — and, if exercise one or two's stack is still deployed,
confirm those checks still run correctly alongside it too.

No answer key here. If you can't articulate why the actions and resources
you chose are the right ones, that's worth sitting with before moving on.

Exercise four moves to RDS — a database with public access, no encryption,
and no backups.
