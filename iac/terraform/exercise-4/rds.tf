# SEEDED FLAW 4 — public, unencrypted, no backups. Verified 2026-09-02/03:
# Floci's RDS emulation does not persist publicly_accessible,
# storage_encrypted, or backup_retention_period — terraform apply succeeds
# with these values, but a live aws rds describe-db-instances call returns
# PubliclyAccessible: false, StorageEncrypted: null,
# BackupRetentionPeriod: null regardless of what was requested. The
# StorageEncrypted/BackupRetentionPeriod fields are absent from the raw
# response (a --query projection of an absent field also renders as null,
# which is why you may see null reported either way). This is a Floci
# RDS-emulation-wide gap (confirmed identical on the CDK track too), not a
# CloudFormation-specific one like exercises 1-2's S3 gaps — your tool must
# check this exercise's flaw from the IaC source or synthesized template,
# not a live API call.
resource "aws_db_instance" "policyholders" {
  identifier          = "${var.project}-policyholders"
  engine              = "postgres"
  instance_class      = "db.t3.micro"
  allocated_storage   = 20
  username            = "acmehealth_app"
  password            = "TrainingOnly-NotARealSecret-1"
  skip_final_snapshot = true

  publicly_accessible     = true # SEEDED FLAW 4
  storage_encrypted       = false # SEEDED FLAW 4
  backup_retention_period = 0 # SEEDED FLAW 4
}
