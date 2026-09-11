# SEEDED FLAW 3 — a single role with a wildcard inline policy. For this
# role and its single inline-policy statement, verified 2026-09-02: a
# live aws iam get-role-policy call shows the exact policy document
# declared here, on both the Terraform and CDK tracks — no gap found for
# this specific shape, unlike exercises 1-2's S3 flaws.
resource "aws_iam_role" "data_platform_admin" {
  name = "${var.project}-data-platform-admin"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "data_platform_admin" {
  name = "allow-everything"
  role = aws_iam_role.data_platform_admin.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "*" # SEEDED FLAW 3
      Resource = "*" # SEEDED FLAW 3
    }]
  })
}
