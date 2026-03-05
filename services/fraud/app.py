from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import boto3, os, json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

ENDPOINT_NAME = os.getenv("ENDPOINT_NAME", "")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

def get_sagemaker_client():
    return boto3.client("sagemaker-runtime", region_name=AWS_REGION)

@app.get("/health")
def health():
    return {"status": "healthy", "endpoint": ENDPOINT_NAME, "team": "fraud"}

@app.get("/ready")
def ready():
    if not ENDPOINT_NAME:
        return JSONResponse(
            status_code=503,
            content={"status": "not ready", "error": "ENDPOINT_NAME not set"},
        )
    try:
        get_sagemaker_client()
        return {"status": "ready"}
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={"status": "not ready", "error": str(e)},
        )

@app.post("/predict")
async def predict(data: dict):
    try:
        client = get_sagemaker_client()
        csv_body = f"{data['amount']},{data['hour']},{data['is_foreign']},{data['is_online']}"
        response = client.invoke_endpoint(
            EndpointName=ENDPOINT_NAME,
            ContentType="text/csv",
            Body=csv_body
        )
        result = response["Body"].read().decode("utf-8").strip()
        return {"prediction": float(result), "endpoint": ENDPOINT_NAME}
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))