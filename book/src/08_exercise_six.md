# Exercise Six — The Open Namespace

## A different layer entirely

Every exercise so far has been AWS infrastructure, in Terraform or CDK.
This one isn't. Module C moves to **Kubernetes** — a different
infrastructure layer, with its own defaults, its own API, and its own
failure modes. There's no Terraform/CDK choice this time; this exercise
ships as plain Kubernetes manifests (`iac/kubernetes/exercise-6/`), the
same way most real Kubernetes work looks day to day.

## Deploy it

`iac/kubernetes/exercise-6/README.md` has the exact commands: create a
k3s cluster via Floci's EKS emulation (this is real k3s under the hood —
verified live, more below), then `kubectl apply -f pods.yaml`. Two pods
come up: `claims-api` and `analytics-worker`.

## Why this matters

Kubernetes' own default, out of the box, is **fully permissive**: with no
`NetworkPolicy` objects in a namespace, every pod can reach every other
pod. This isn't a misconfiguration in the way exercises one through five's
flaws were — nobody had to actively disable a protection, the way S3's
public-access-block or a permission boundary would need to be. Kubernetes
simply doesn't restrict pod-to-pod traffic unless you tell it to.

**NIS2 Article 21(2)(g)** requires "basic cyber hygiene practices" as one
of ten binding cybersecurity risk-management measures essential and
important entities must implement — Acme Health, processing claims for
hospitals and health insurers, sits inside NIS2's healthcare
essential-entity sector for real, the same business fact this book's
intro already named. Network segmentation isn't named as its own letter
in the directive's ten measures (checked directly against the article's
own operative text at EUR-Lex — it isn't there verbatim), but it's a
widely-recognized cyber-hygiene practice that industry guidance
consistently places under (g)'s general category. Cite the letter you can
actually verify, not the specific practice that secondary sources
associate with it — the distinction matters, and this book tries to model
getting it right rather than repeating a plausible-sounding but unverified
claim.

**Tesla, 2018**, is the anchor here, with an honest caveat: Tesla's actual
failure was an *unauthenticated* Kubernetes administrative console, not a
missing NetworkPolicy specifically — that's a different, adjacent problem
(access control, not segmentation). What makes it the right anchor anyway
is the *consequence*, not the mechanism: once inside, the attacker could
"see all running services, access every pod, inspect files," according to
public reporting on the incident, and used that unrestricted reach to
deploy cryptocurrency-mining software across Tesla's cluster. Nothing
about network segmentation would have stopped the initial unauthenticated
access — but a deny-by-default posture between workloads would have
limited what the attacker could reach once inside, which is exactly what
this exercise's fix provides. Two different lessons, worth keeping
separate: authenticate your control plane, *and* don't let a single
compromised pod see the whole cluster.

## Build

New territory for your tool: it needs to talk to a Kubernetes API, not
AWS's. The `kubernetes` Python client is already in
`tool/pyproject.toml`'s dependencies — `from kubernetes import client,
config` is your starting point, the same way `import boto3` was on day
one.

**Hint, not an answer:** Kubernetes has a specific API object type for
network policies, in its own dedicated API group — your tool needs to ask
"does anything of that type exist in this namespace?" The absence of any
such object, for a namespace running more than one pod, is the entire
flaw. You don't need to inspect a policy's contents to detect this one;
you need to detect that there isn't one at all.

## Fix it

Add a `NetworkPolicy`, redeploy, and confirm your tool now reports the
namespace as covered.

**Live proof, the same discipline as every earlier exercise's manual
verification step**: before applying any policy, run a request from
`analytics-worker` to `claims-api` — it succeeds. Apply a deny-all
`NetworkPolicy`, then run the exact same request again. (Verified live,
2026-09-10, against this exact exercise's own pods: before the fix, the
request returns the page content; after, `wget: can't connect to remote
host: Connection refused` — reproducing this project's original POC
finding for k3s NetworkPolicy enforcement on Floci, one month later, with
identical behavior.) This is the closest thing in this course to watching
a real segmentation boundary hold, live, in front of you.

No answer key here. If you can't say which Kubernetes API object your
tool checks for and why its mere absence — not its contents — is the
flaw, that's worth sitting with before moving on.

This is the first exercise outside AWS. Exercise seven stays in the same
cluster, moving from segmentation to admission control.
