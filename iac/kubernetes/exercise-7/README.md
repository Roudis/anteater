# Exercise 7 — Kubernetes (Gatekeeper admission control)

A new resource type in the same cluster technology as exercise six, but a
different mechanism: not network segmentation, admission control. See
`../../../book/src/09_exercise_seven.md` for what to build and why.

```bash
source ../../../env.sh

# Reuse (or recreate) the same k3s cluster exercise six used:
aws eks create-cluster --name exercise-7 --role-arn arn:aws:iam::000000000000:role/eks-role \
  --resources-vpc-config subnetIds=subnet-default-a
aws eks describe-cluster --name exercise-7 --query 'cluster.status'   # wait for ACTIVE
aws eks update-kubeconfig --name exercise-7

# Install Gatekeeper (official upstream manifest — not something this
# exercise vendors or modifies):
kubectl apply -f https://raw.githubusercontent.com/open-policy-agent/gatekeeper/master/deploy/gatekeeper.yaml
kubectl wait --for=condition=Available deployment/gatekeeper-controller-manager -n gatekeeper-system --timeout=120s

# Apply the given ConstraintTemplate:
kubectl apply -f constraint-template.yaml
```

To tear down:

```bash
aws eks delete-cluster --name exercise-7
kubectl config delete-context arn:aws:eks:us-east-1:000000000000:cluster/exercise-7
kubectl config delete-cluster arn:aws:eks:us-east-1:000000000000:cluster/exercise-7
kubectl config delete-user arn:aws:eks:us-east-1:000000000000:cluster/exercise-7
```

No pods ship with this exercise. Once it's deployed, try creating one —
`kubectl run test --image=nginx:alpine` — with no labels at all. It
succeeds. That's the flaw: a `ConstraintTemplate` defines a rule, but
nothing activates it yet.
