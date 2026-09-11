FROM python:3.11-slim

# Install uv for fast package management
RUN pip install uv

WORKDIR /app

# Copy all files
COPY . .

# Install dependencies and the package itself
RUN uv sync --no-dev

EXPOSE 8000

# Run the FastAPI server using the uv virtual environment
CMD ["uv", "run", "uvicorn", "cloud_security_compliance.main:app", "--host", "0.0.0.0", "--port", "8000"]
