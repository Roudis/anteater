# Exercise 2 — CDK (TypeScript)

Same bucket as exercise 1 (`acmehealth-raw-claims`), still public, now also
encrypted with the wrong kind of key and carrying no versioning. See
`../../../book/src/04_exercise_two.md` for what to build and why.

```bash
source ../../../env.sh
pnpm install
pnpm exec cdk bootstrap aws://000000000000/us-east-1
pnpm exec cdk deploy
```
