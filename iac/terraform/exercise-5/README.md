# Exercise 5 — Terraform

A new resource, not anything from exercises 1-4: an IAM user,
`acmehealth-claims-ingest`, with a broad inline `s3:*` policy and no
permission boundary. See `../../../book/src/07_exercise_five.md` for what
to build and why.

On `terraform apply`, Terraform writes a real (Floci-only, harmless) access
key and secret to `committed-credentials.env` in this directory. That file
is gitignored here and is never actually committed — the teaching scenario
is "imagine your deploy pipeline generated this and it wasn't gitignored."
The book chapter explains what to do with it.

```bash
terraform init
terraform apply
```
