# Exercise 3 — CDK (TypeScript)

A new resource, not the same bucket as exercises 1-2: an IAM role,
`acmehealth-data-platform-admin`, with a wildcard inline policy. See
`../../../book/src/05_exercise_three.md` for what to build and why.

```bash
source ../../../env.sh
pnpm install
pnpm exec cdk bootstrap aws://000000000000/us-east-1
pnpm exec cdk deploy
```
