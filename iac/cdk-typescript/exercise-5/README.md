# Exercise 5 — CDK (TypeScript)

A new resource, not anything from exercises 1-4: an IAM user,
`acmehealth-claims-ingest`, with a broad inline `s3:*` policy and no
permission boundary. See `../../../book/src/07_exercise_five.md` for what
to build and why.

After `cdk deploy`, the stack outputs the generated access key ID and
secret. Capture them into a local `committed-credentials.env` file to
give your tool a file to scan:

```bash
aws cloudformation describe-stacks --stack-name Exercise5Stack \
  --query 'Stacks[0].Outputs' --output json > committed-credentials.env
```

That file is gitignored here and is never actually committed — the teaching
scenario is "imagine your deploy pipeline generated this and it wasn't
gitignored." The book chapter explains what to do with it.

```bash
source ../../../env.sh
pnpm install
pnpm exec cdk bootstrap aws://000000000000/us-east-1
pnpm exec cdk deploy --require-approval never
```

**Known Floci gap, verified 2026-09-10: `cdk destroy` does not actually
remove the IAM user or its access key.** The CloudFormation stack itself
is genuinely deleted (a follow-up `describe-stacks` correctly errors with
"Stack ... does not exist"), and the user's inline policy *is* correctly
removed — but `aws iam get-user --user-name acmehealth-claims-ingest`
still shows the user, and its access key is still listed as `Active`. If
you need to redeploy after destroying (e.g. to re-verify a fix), you must
manually clean up first, or `cdk deploy` will fail on a name collision:

```bash
aws iam list-access-keys --user-name acmehealth-claims-ingest \
  --query 'AccessKeyMetadata[].AccessKeyId' --output text \
  | xargs -n1 aws iam delete-access-key --user-name acmehealth-claims-ingest --access-key-id
aws iam delete-user --user-name acmehealth-claims-ingest
```

This is a real Floci limitation, not something you did wrong — Terraform's
direct API path (exercise 5's Terraform track) does not have this problem;
`terraform destroy` genuinely removes the equivalent user.
