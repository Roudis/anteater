# Exercise Seven — The Rejected Manifest

## Deploy it

Same cluster technology as exercise six, a different mechanism: not
segmentation, **admission control**. `iac/kubernetes/exercise-7/README.md`
has the exact commands — install Gatekeeper (the upstream official
manifest, unmodified), then apply this exercise's own
`constraint-template.yaml`.

No pods ship with this exercise. Once it's deployed, try creating one with
no labels at all — `kubectl run test --image=nginx:alpine`. It succeeds.
That's the flaw, and it's worth actually running before you build
anything: nothing you just deployed stops it.

## Why this matters

A `ConstraintTemplate` defines a *rule* — Gatekeeper's admission webhook
knows how to check whether a resource satisfies it, once something tells
it to. It doesn't enforce anything on its own. Enforcement comes from a
separate object, a `Constraint`, that says "apply this rule, to these
kinds of resources, with these parameters." Ship the template without a
constraint, and you've built a rule nobody's using — every resource, no
matter how far from compliant, gets admitted.

This is a subtler flaw than exercise six's, worth naming directly: the
absence isn't "no security tooling exists" — Gatekeeper is fully
installed and running — it's "the tooling that exists isn't actually
wired to anything." A cluster can look secured in an inventory (Gatekeeper:
✓ installed) and still admit anything, because installed and
enforcing are different facts.

**NIS2 Article 21(2)(g)**, "basic cyber hygiene practices" — the same
letter exercise six cited, for a related reason: admission control is a
baseline hygiene practice for what's allowed to run in a cluster at all,
the same category segmentation falls under for what's allowed to talk to
what. (See the regulatory background chapter for why this book cites the
letter, not a specific named practice, and why NIS2 is a directive, not a
regulation — what actually binds Acme Health is whichever EU member
state's transposition applies, not the directive text directly.)

Tesla's 2018 incident is the same anchor exercise six used, and the same
caveat applies doubly here: the root failure was unauthenticated console
access, not a missing admission policy. What connects it to this exercise
specifically is the "installed but not actually stopping anything"
pattern — an org can have security tooling in its stack and still have a
live gap, because tooling that exists and tooling that's actually
configured to act are not the same thing.

## Build

Extend the same tool again. New API surface: Gatekeeper's constraints are
their own Kubernetes custom resources, in their own API group — your tool
needs to ask whether one exists for the specific `ConstraintTemplate` this
exercise ships, the same "does this thing exist at all" pattern as
exercise six's NetworkPolicy check.

**Hint, not an answer:** a `ConstraintTemplate`'s presence and a
`Constraint`'s presence are two different facts, and only one of them
means anything is actually enforced. Your tool needs to check for the
second one specifically — checking only for the template would report
this cluster as "protected" when it demonstrably isn't, which you can
prove yourself with the one `kubectl run` command above.

## Fix it

Write and apply a `Constraint` object that references this exercise's
`ConstraintTemplate` and actually requires something — you decide what
label makes sense to require and for which resource kinds, the same kind
of scoping judgment call exercise three's boundary and exercise five's
permission-boundary fixes both asked for. You're writing YAML that
configures an existing rule, not Rego — the policy logic itself is given,
prior art the same way this course treats OPA/Rego everywhere else.

**Live proof** (verified live, 2026-09-10, against this exact exercise):
before any `Constraint` exists, `kubectl run flaw-evidence --image=nginx:alpine`
succeeds with no resistance. After applying a `Constraint` requiring a
`data-classification` label, the identical command — no label — is
rejected: `admission webhook "validation.gatekeeper.sh" denied the
request: missing required label`. The same command with the label
attached succeeds. Redeploy, re-run your tool, confirm it now reports the
constraint as active.

No answer key here. If you can't explain the difference between "a
ConstraintTemplate exists" and "a Constraint exists," in your own words,
that's worth sitting with before moving on.

This closes out Module C's NetworkPolicy-and-admission-control pair —
Module D, "the flaw policy can't fix" (an architecturally unfixable
compliance gap that no scanner rule closes on its own), is designed in
this course's own notes but not yet built.
