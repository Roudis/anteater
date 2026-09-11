# SEEDED FLAW 1 — public bucket. (Unchanged from exercise 1 — this is the
# same bucket, still carrying its exercise-1 flaw. Fix-it happens per
# exercise; a student doing both exercises in sequence fixes flaw 1 during
# exercise 1's own "Fix it" step, then re-breaks nothing here — this file
# ships with flaw 1 still present so exercise 2 can be worked standalone.)
#
# S3 has blocked public access BY DEFAULT for new buckets since April 2023,
# so making a bucket public now requires actively disabling two protections.
# That is the teaching point: something had to actively fight the default to
# create this exposure, which is exactly why a tool that catches it matters.
resource "aws_s3_bucket" "raw_claims" {
  bucket = "${var.project}-raw-claims"
}

resource "aws_s3_bucket_public_access_block" "raw_claims" {
  bucket                  = aws_s3_bucket.raw_claims.id
  block_public_acls       = false # SEEDED FLAW 1
  block_public_policy     = false # SEEDED FLAW 1
  ignore_public_acls      = false # SEEDED FLAW 1
  restrict_public_buckets = false # SEEDED FLAW 1
}

resource "aws_s3_bucket_ownership_controls" "raw_claims" {
  bucket = aws_s3_bucket.raw_claims.id
  rule { object_ownership = "BucketOwnerPreferred" } # re-enables ACLs
}

resource "aws_s3_bucket_acl" "raw_claims" {
  depends_on = [
    aws_s3_bucket_ownership_controls.raw_claims,
    aws_s3_bucket_public_access_block.raw_claims,
  ]
  bucket = aws_s3_bucket.raw_claims.id
  acl    = "public-read" # SEEDED FLAW 1
}

# SEEDED FLAW 2 — encrypted, but with the AWS-managed key, not a
# customer-managed one. Looks fine on a shallow "is encryption on?" check;
# Acme Health cannot rotate this key independently or revoke access to it
# by destroying it, and there's no separate audit trail for key usage.
# Verified 2026-09-02: omitting this resource entirely would NOT produce an
# "unencrypted" bucket — Floci (matching real AWS since Jan 2023) applies
# SSE-S3 automatically by default. This resource has to exist, explicitly
# choosing the wrong kind of encryption, to make the flaw real.
resource "aws_s3_bucket_server_side_encryption_configuration" "raw_claims" {
  bucket = aws_s3_bucket.raw_claims.id

  rule {
    apply_server_side_encryption_by_default {
      # SEEDED FLAW 2 — no kms_master_key_id set, so this resolves to the
      # AWS-managed aws/s3 key, not a customer-managed one.
      sse_algorithm = "aws:kms"
    }
  }
}

# No aws_s3_bucket_versioning resource -> SEEDED FLAW 2 (no versioning).
