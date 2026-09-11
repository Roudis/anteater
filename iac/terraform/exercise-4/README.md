# Exercise 4 — Terraform

A new resource, not the same as exercises 1-3: an RDS instance,
`acmehealth-policyholders`, that's publicly accessible, unencrypted, and
has no backups configured. See `../../../book/src/06_exercise_four.md`
for what to build and why.

```bash
terraform init
terraform apply
```

RDS instances take noticeably longer to provision on Floci than the S3
bucket or IAM role in earlier exercises — expect `apply` to take roughly
a minute, not seconds.
