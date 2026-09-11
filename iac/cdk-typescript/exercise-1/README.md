# Exercise 1 — CDK (TypeScript)

Deploys `acmehealth-raw-claims`, deliberately public — the same target
state as `../../terraform/exercise-1/`, expressed in CDK instead. See
`../../../book/src/03_exercise_one.md` for what to build and why, including
why this track's flaw is checked via `cdk synth` rather than a live scan.

```bash
source ../../../env.sh
pnpm install
pnpm exec cdk bootstrap aws://000000000000/us-east-1
pnpm exec cdk deploy
```
