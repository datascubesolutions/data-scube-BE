#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE=${NAMESPACE:-default}
IMAGE_TAG=${IMAGE_TAG:-latest}
REGISTRY=${REGISTRY:-ghcr.io}
REPO_NAME=${REPO_NAME:-datascubesolutions/data-scube-be}

echo -e "${YELLOW}Starting deployment to Kubernetes...${NC}"

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}kubectl is not installed or not in PATH${NC}"
    exit 1
fi

# Check if we can connect to cluster
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}Cannot connect to Kubernetes cluster${NC}"
    exit 1
fi

# Create namespace if it doesn't exist
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# Apply secrets and configmaps
echo -e "${YELLOW}Applying secrets and configmaps...${NC}"
kubectl apply -f k8s/secrets.yaml -n $NAMESPACE

# Update deployment with new image
echo -e "${YELLOW}Updating deployment with image: $REGISTRY/$REPO_NAME:$IMAGE_TAG${NC}"
kubectl set image deployment/datascube-api datascube-api=$REGISTRY/$REPO_NAME:$IMAGE_TAG -n $NAMESPACE

# Apply all Kubernetes manifests
echo -e "${YELLOW}Applying Kubernetes manifests...${NC}"
kubectl apply -f k8s/ -n $NAMESPACE

# Wait for rollout to complete
echo -e "${YELLOW}Waiting for deployment to complete...${NC}"
kubectl rollout status deployment/datascube-api -n $NAMESPACE --timeout=300s

# Check if deployment is ready
if kubectl get deployment datascube-api -n $NAMESPACE -o jsonpath='{.status.readyReplicas}' | grep -q "3"; then
    echo -e "${GREEN}Deployment successful! All replicas are ready.${NC}"
else
    echo -e "${RED}Deployment may have issues. Check pod status:${NC}"
    kubectl get pods -n $NAMESPACE -l app=datascube-api
    exit 1
fi

# Show service information
echo -e "${YELLOW}Service information:${NC}"
kubectl get svc datascube-api-service -n $NAMESPACE

echo -e "${GREEN}Deployment completed successfully!${NC}"