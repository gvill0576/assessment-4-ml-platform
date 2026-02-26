# Assessment IV - Internal ML Platform

## Business Scenario
You are on a platform engineering team supporting three internal business units, each running their own machine learning model on AWS SageMaker. The Fraud Detection team runs an XGBoost model that classifies transactions as fraudulent or legitimate. The Recommendations team runs a Linear Learner model that generates product recommendations. The Forecasting team runs a Random Cut Forest model that detects anomalies in demand data. Each team owns their own SageMaker endpoint and FastAPI service, but all deployment operations, routing, and operational visibility are managed through this shared internal platform.

## Architecture
```
GitHub Actions CI/CD
        |
        v
GHCR Container Registry
        |
        v
AWS EKS (k8s-training-cluster)
        |
   _____|_____
  |     |     |
team- team- team-
fraud reco  fore
  |     |     |
  v     v     v
SageMaker Endpoints
george-fraud-endpoint
george-recommendations-endpoint
george-forecasting-endpoint
```

## Services

| Service | Namespace | Endpoint |
|---------|-----------|----------|
| Fraud Detection | team-fraud | george-fraud-endpoint |
| Recommendations | team-recommendations | george-recommendations-endpoint |
| Forecasting | team-forecasting | george-forecasting-endpoint |

## Prerequisites
- AWS CLI configured
- kubectl installed
- Terraform 1.0+
- Docker installed
- Node.js 18+
- GitHub CLI

## Setup Instructions

### 1. Clone the repo
```bash
git clone https://github.com/gvill0576/assessment-4-ml-platform
cd assessment-4-ml-platform
./start.sh
```

### 2. Connect to EKS
```bash
aws eks update-kubeconfig --region us-east-1 --name k8s-training-cluster
kubectl get nodes
```

### 3. Provision Terraform Infrastructure
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

### 4. Create Kubernetes Secrets
```bash
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=<your-github-username> \
  --docker-password=<your-ghcr-token> \
  -n team-fraud

kubectl create secret generic aws-credentials \
  --from-literal=AWS_ACCESS_KEY_ID=<your-key> \
  --from-literal=AWS_SECRET_ACCESS_KEY=<your-secret> \
  -n team-fraud
```
Repeat for team-recommendations and team-forecasting namespaces.

### 5. Deploy All Services
```bash
kubectl apply -f k8s/fraud/
kubectl apply -f k8s/recommendations/
kubectl apply -f k8s/forecasting/
```

### 6. Verify Deployment
```bash
kubectl get pods -n team-fraud
kubectl get pods -n team-recommendations
kubectl get pods -n team-forecasting
kubectl get services -n team-fraud
```

### 7. Run the Dashboard Locally
```bash
cd dashboard
npm install
npm run dev
```
Open http://localhost:3000

## CI/CD Pipeline
Push to main branch triggers automatic build, push, and deploy of all three services via GitHub Actions.

## Verify Services
```bash
curl http://<fraud-external-ip>/health
curl http://<fraud-external-ip>/ready
curl -X POST http://<fraud-external-ip>/predict \
  -H "Content-Type: application/json" \
  -d '{"feature1": 500.0, "feature2": 2, "feature3": 1, "feature4": 1}'
```

## Teardown
```bash
kubectl delete -f k8s/fraud/
kubectl delete -f k8s/recommendations/
kubectl delete -f k8s/forecasting/
cd terraform
terraform destroy
```
