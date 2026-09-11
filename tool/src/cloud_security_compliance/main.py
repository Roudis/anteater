from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json

app = FastAPI(title="Cloud Security Compliance Scanner")

# Allow CORS for local webapp development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import boto3
import botocore.exceptions
import os

def get_s3_client():
    # Rely on environment variables (like AWS_ENDPOINT_URL from env.sh)
    # If they aren't set, default to localhost for Floci.
    endpoint_url = os.environ.get("AWS_ENDPOINT_URL", "http://localhost:4566")
    return boto3.client(
        "s3",
        endpoint_url=endpoint_url,
        region_name=os.environ.get("AWS_DEFAULT_REGION", "us-east-1"),
        aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID", "test"),
        aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY", "test"),
    )

def scan_s3_bucket(bucket_name: str, s3_client):
    """
    Checks if an S3 bucket is publicly accessible by evaluating both
    its Public Access Block configuration and its ACLs.
    Returns (is_public: bool, reason: str).
    """
    is_public = False
    reasons = []

    # 1. Check Public Access Block
    try:
        pab = s3_client.get_public_access_block(Bucket=bucket_name)
        config = pab.get("PublicAccessBlockConfiguration", {})
        # If block_public_acls or block_public_policy is False, it's a risk.
        if not config.get("BlockPublicAcls") or not config.get("BlockPublicPolicy"):
            is_public = True
            reasons.append("Public Access Block is disabled or incomplete.")
    except botocore.exceptions.ClientError as e:
        if e.response["Error"]["Code"] == "NoSuchPublicAccessBlockConfiguration":
            is_public = True
            reasons.append("No Public Access Block configuration exists.")
        else:
            raise

    # 2. Check ACLs
    try:
        acl = s3_client.get_bucket_acl(Bucket=bucket_name)
        for grant in acl.get("Grants", []):
            grantee = grant.get("Grantee", {})
            uri = grantee.get("URI", "")
            if "AllUsers" in uri or "AuthenticatedUsers" in uri:
                is_public = True
                reasons.append(f"ACL grants access to {uri}.")
    except Exception as e:
        print(f"Error checking ACL for {bucket_name}: {e}")

    return is_public, " ".join(reasons)


@app.get("/api/scan")
def run_scan():
    """
    Run the compliance scan and return a SARIF report dynamically.
    """
    s3_client = get_s3_client()
    target_bucket = "acmehealth-raw-claims"
    results = []

    try:
        # Check if bucket exists
        s3_client.head_bucket(Bucket=target_bucket)
        
        is_public, reason = scan_s3_bucket(target_bucket, s3_client)
        
        if is_public:
            results.append({
                "ruleId": "AH-S3-001",
                "ruleIndex": 0,
                "level": "error",
                "message": {
                    "text": f"The S3 bucket '{target_bucket}' is publicly accessible. {reason}"
                },
                "locations": [
                    {
                        "physicalLocation": {
                            "artifactLocation": {
                                "uri": f"arn:aws:s3:::{target_bucket}"
                            }
                        }
                    }
                ]
            })
        else:
            # We can output a "pass" result in SARIF, or simply omit it.
            # Omitting means no issues found. We will omit it for a clean report.
            pass
            
    except botocore.exceptions.ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == '404':
             print(f"Bucket {target_bucket} not found. Is infrastructure deployed?")
        else:
             print(f"Error connecting to Floci: {e}")

    sarif_report = {
        "version": "2.1.0",
        "$schema": "https://json.schemastore.org/sarif-2.1.0-rtm.5.json",
        "runs": [
            {
                "tool": {
                    "driver": {
                        "name": "Acme Health Compliance Scanner",
                        "informationUri": "https://acmehealth.example.com",
                        "rules": [
                            {
                                "id": "AH-S3-001",
                                "name": "S3BucketPublicAccessBlocked",
                                "shortDescription": {
                                    "text": "S3 buckets must not be publicly accessible."
                                },
                                "fullDescription": {
                                    "text": "S3 buckets containing Acme Health data must block all public access to comply with HIPAA and GDPR requirements (Article 32(1)(b))."
                                },
                                "help": {
                                    "text": "Ensure that the S3 bucket has public access blocked and that its ACLs do not grant public read access."
                                },
                                "defaultConfiguration": {
                                    "level": "error"
                                }
                            }
                        ]
                    }
                },
                "results": results
            }
        ]
    }
    return sarif_report

def main():
    """CLI entrypoint."""
    print("Starting Cloud Security Compliance API Server on http://0.0.0.0:8000")
    uvicorn.run("cloud_security_compliance.main:app", host="0.0.0.0", port=8000, reload=True)

if __name__ == "__main__":
    main()
