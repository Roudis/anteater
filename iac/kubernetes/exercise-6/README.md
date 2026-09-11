# Exercise 6 — Kubernetes

A new resource, and a new infrastructure layer entirely — not AWS,
Terraform, or CDK. Two pods, `claims-api` and `analytics-worker`, with no
`NetworkPolicy` restricting traffic between them. See
`../../../book/src/08_exercise_six.md` for what to build and why.

```bash
source ../../../env.sh

# Create a k3s cluster via Floci's EKS emulation (this is real k3s under
# the hood, not a mock):
aws eks create-cluster --name exercise-6 --role-arn arn:aws:iam::000000000000:role/eks-role \
  --resources-vpc-config subnetIds=subnet-default-a

# Wait for it to become ACTIVE (usually within a few seconds on Floci):
aws eks describe-cluster --name exercise-6 --query 'cluster.status'

aws eks update-kubeconfig --name exercise-6
kubectl apply -f pods.yaml
kubectl wait --for=condition=Ready pod/claims-api pod/analytics-worker --timeout=60s
```

To tear down:

```bash
kubectl delete -f pods.yaml
aws eks delete-cluster --name exercise-6
kubectl config delete-context arn:aws:eks:us-east-1:000000000000:cluster/exercise-6
kubectl config delete-cluster arn:aws:eks:us-east-1:000000000000:cluster/exercise-6
kubectl config delete-user arn:aws:eks:us-east-1:000000000000:cluster/exercise-6
```

Your tool will need the `kubernetes` Python client to talk to this
cluster — it's already in `tool/pyproject.toml`'s dependencies.
