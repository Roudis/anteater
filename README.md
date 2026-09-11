# Compliance as Code — Acme Health

Start with the book: `book/src/SUMMARY.md` (readable directly on
GitHub) or, locally:

```bash
cd book
mdbook serve --open
```

(No `mdbook`? `cargo install mdbook` — see
https://rust-lang.github.io/mdbook/guide/installation.html)

## Layout

```
book/                — the course itself; start here
iac/terraform/       — seeded AWS infrastructure, Terraform
iac/cdk-typescript/  — same AWS infrastructure, CDK
iac/kubernetes/      — a different infrastructure layer, plain manifests
tool/                — your compliance-scanning tool, currently blank
docker-compose.yml   — Floci (local AWS/Kubernetes emulator)
env.sh               — source this before running Terraform, CDK, or your tool
```

Everything runs against Floci — no cloud account, no billing, no real
credentials, ever. See `book/src/02_setup.md` for the full setup walkthrough.
