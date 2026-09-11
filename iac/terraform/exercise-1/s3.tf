# SEEDED FLAW 1 — public bucket.
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
  block_public_acls       = false   # SEEDED FLAW 1
  block_public_policy     = false   # SEEDED FLAW 1
  ignore_public_acls      = false   # SEEDED FLAW 1
  restrict_public_buckets = false   # SEEDED FLAW 1
}

resource "aws_s3_bucket_ownership_controls" "raw_claims" {
  bucket = aws_s3_bucket.raw_claims.id
  rule { object_ownership = "BucketOwnerPreferred" }  # re-enables ACLs
}

resource "aws_s3_bucket_acl" "raw_claims" {
  depends_on = [
    aws_s3_bucket_ownership_controls.raw_claims,
    aws_s3_bucket_public_access_block.raw_claims,
  ]
  bucket = aws_s3_bucket.raw_claims.id
  acl    = "public-read"   # SEEDED FLAW 1
}
