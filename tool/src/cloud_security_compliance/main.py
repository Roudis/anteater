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

@app.get("/api/scan")
def run_scan():
    """
    Run the compliance scan and return a SARIF report.
    For now, this returns a dummy SARIF report to fulfill the UI integration requirements.
    """
    # In the future, this is where we'd invoke the boto3/localstack checks.
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
                                    "text": "S3 buckets containing Acme Health data must block all public access to comply with HIPAA and GDPR requirements."
                                },
                                "help": {
                                    "text": "Ensure that the S3 bucket has public access blocked. You can do this by navigating to the bucket settings and enabling 'Block all public access'."
                                },
                                "defaultConfiguration": {
                                    "level": "error"
                                }
                            }
                        ]
                    }
                },
                "results": [
                    {
                        "ruleId": "AH-S3-001",
                        "ruleIndex": 0,
                        "level": "error",
                        "message": {
                            "text": "The S3 bucket 'acmehealth-raw-claims' does not have public access blocked."
                        },
                        "locations": [
                            {
                                "physicalLocation": {
                                    "artifactLocation": {
                                        "uri": "arn:aws:s3:::acmehealth-raw-claims"
                                    }
                                }
                            }
                        ]
                    }
                ]
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
