# Setup

## Prerequisites

- **Docker** — any recent Docker Desktop.
- **Terraform** (~1.9).
- **pnpm ≥ 11** — this repo's `pnpm-workspace.yaml` uses the `allowBuilds`
  key, which pnpm 10 does not understand.
- **AWS CLI ≥ 2.13** — older versions silently ignore `AWS_ENDPOINT_URL`
  and will target real AWS instead of Floci.
- **uv** — any recent version; it fetches Python 3.14 itself per
  `tool/pyproject.toml`'s `requires-python`, no separate Python install
  needed.

## Floci — the local AWS emulator

Everything in this course runs against Floci, a local AWS emulator —
nothing you do here touches a real cloud account.

```bash
docker compose up -d
source env.sh
sleep 5 && aws s3 ls   # smoke test — should exit 0 with no error
```

Running these techniques against systems you do not own and have not
been authorized to test is a crime. Floci exists so you never have to.

## Pick your IaC

Each exercise is provided in two flavors, in its own directory — pick
whichever you'd rather work in (or try both), one exercise directory at a
time:

- **Terraform**: `iac/terraform/exercise-N/` — `terraform init && terraform apply`
- **CDK (TypeScript)**: `iac/cdk-typescript/exercise-N/` — `pnpm install && pnpm exec cdk bootstrap aws://000000000000/us-east-1 && pnpm exec cdk deploy`

Exercise one's `exercise-1/` and exercise two's `exercise-2/` both deploy a
bucket with the same name (`acmehealth-raw-claims`) — destroy one exercise's
stack before deploying the other's, or the second deploy will collide with
the first.

## Your tool's environment

```bash
# from the repo root
cd tool
uv sync
uv run cloud-security-compliance   # currently just a placeholder
```

`boto3` is available and ready to point at Floci — the same
`AWS_ENDPOINT_URL`/credentials you sourced from `env.sh` above work for
`boto3` too, since it reads the same environment variables the AWS CLI
does.
