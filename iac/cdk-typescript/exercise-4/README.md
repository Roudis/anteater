# Exercise 4 — CDK (TypeScript)

A new resource, not the same as exercises 1-3: an RDS instance,
`acmehealth-policyholders`, that's publicly accessible, unencrypted, and
has no backups configured. See `../../../book/src/06_exercise_four.md`
for what to build and why.

```bash
source ../../../env.sh
pnpm install
pnpm exec cdk bootstrap aws://000000000000/us-east-1
pnpm exec cdk deploy --require-approval never
```

RDS instances can take longer to provision on Floci than the S3 bucket or
IAM role in earlier exercises. Timing varies here more than it did in
earlier exercises, too: this can finish fast or take close to a minute
depending on the run — either is normal, and the flaw isn't visible from
the CLI's own success/timing either way, so don't read a quick or a slow
`deploy` as a signal about whether anything's wrong.
