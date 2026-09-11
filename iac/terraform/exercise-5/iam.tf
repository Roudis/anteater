# SEEDED FLAW 5 — a real IAM access key, generated for a broad-access user
# with no permission boundary, written to a plaintext file next to this
# exercise's own Terraform state. Verified 2026-09-10: a real IAM user with
# a permission boundary genuinely has that boundary enforced as an
# intersection with its identity policy (PutObject denied, GetObject allowed,
# when the boundary only grants GetObject) — see this exercise's Task 1
# Step 1 report for the live evidence.
resource "aws_iam_user" "claims_ingest" {
  name = "${var.project}-claims-ingest"
}

resource "aws_iam_user_policy" "claims_ingest" {
  name = "broad-s3-access"
  user = aws_iam_user.claims_ingest.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "s3:*" # SEEDED FLAW 5 — no scoping
      Resource = "*"    # SEEDED FLAW 5 — no scoping
    }]
  })
}

resource "aws_iam_access_key" "claims_ingest" {
  user = aws_iam_user.claims_ingest.name
}

# SEEDED FLAW 5 — the access key's real secret, written to a plaintext
# file. This is what a student's tool must learn to detect: a real AWS
# access-key-shaped string sitting in a file in this directory. Gitignored
# in THIS repository deliberately (see this exercise's .gitignore) — the
# teaching scenario is "imagine your deploy pipeline generated this and it
# WASN'T gitignored," not "here is a permanently public secret."
resource "local_file" "leaked_credentials" {
  filename = "${path.module}/committed-credentials.env"
  content  = <<-EOT
    # Acme Health claims-ingest pipeline credentials
    AWS_ACCESS_KEY_ID=${aws_iam_access_key.claims_ingest.id}
    AWS_SECRET_ACCESS_KEY=${aws_iam_access_key.claims_ingest.secret}
  EOT
}

# No permissions_boundary argument set on aws_iam_user.claims_ingest ->
# SEEDED FLAW 5 (no permission boundary).
