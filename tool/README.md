# Tool

This is where you build the scanner. Nothing here yet but a working
Python environment — see `../book/src/01_intro.md` onward for what to
build and why.

```bash
uv sync
uv run cloud-security-compliance   # currently just prints a placeholder
```

Available: `boto3`, pointed at Floci once you set `AWS_ENDPOINT_URL` (see
`../env.sh`).
