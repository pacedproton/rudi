# Lern-Rudi Kubernetes Deployment Guide

## Prerequisites
- Docker installed
- Kubernetes cluster (minikube, GKE, EKS, AKS, etc.)
- kubectl configured
- Nginx ingress controller installed

## Step 1: Install Dependencies & Build

Since npm wasn't available in the terminal, run these commands manually:

```bash
cd "/Users/mike/Library/Mobile Documents/com~apple~CloudDocs/GDriveUSC/src2/rudi/poldi-app"

# Install adapter-static
npm install -D @sveltejs/adapter-static

# Test build
npm run build
```

## Step 2: Build Docker Image

```bash
# Build with OpenAI API key (if needed)
docker build \
  --build-arg VITE_OPENAI_API_KEY="your-key-here" \
  -t lern-rudi:latest .

# Or without API key (storytelling won't work)
docker build -t lern-rudi:latest .

# Test locally
docker run -p 8080:80 lern-rudi:latest
# Visit: http://localhost:8080
```

## Step 3: Push to Registry

```bash
# Tag for your registry
docker tag lern-rudi:latest your-registry.com/lern-rudi:v1.0.0

# Push
docker push your-registry.com/lern-rudi:v1.0.0
```

## Step 4: Update K8s Manifests

Edit `k8s/deployment.yaml`:
- Replace `image: lern-rudi:latest` with your registry image
- Adjust resource limits if needed

Edit `k8s/ingress.yaml`:
- Replace `lern-rudi.example.com` with your domain
- Uncomment TLS section if using HTTPS

## Step 5: Deploy to Kubernetes

```bash
# Create namespace (optional)
kubectl create namespace lern-rudi

# Apply manifests
kubectl apply -f k8s/deployment.yaml -n lern-rudi
kubectl apply -f k8s/ingress.yaml -n lern-rudi

# Check status
kubectl get pods -n lern-rudi
kubectl get svc -n lern-rudi
kubectl get ingress -n lern-rudi
```

## Step 6: Verify

```bash
# Check logs
kubectl logs -f deployment/lern-rudi -n lern-rudi

# Port forward for testing (if ingress not ready)
kubectl port-forward svc/lern-rudi 8080:80 -n lern-rudi
# Visit: http://localhost:8080

# Test health endpoint
kubectl exec deployment/lern-rudi -n lern-rudi -- wget -O- http://localhost/health
```

## Scaling

```bash
# Scale up
kubectl scale deployment/lern-rudi --replicas=5 -n lern-rudi

# Scale down
kubectl scale deployment/lern-rudi --replicas=1 -n lern-rudi

# Auto-scaling (optional)
kubectl autoscale deployment lern-rudi --cpu-percent=70 --min=2 --max=10 -n lern-rudi
```

## Troubleshooting

### Pods not starting
```bash
kubectl describe pod <pod-name> -n lern-rudi
kubectl logs <pod-name> -n lern-rudi
```

### 404 errors
- Check nginx.conf is copied correctly
- Verify SPA routing (try_files)

### API key not working
- Rebuild image with `--build-arg VITE_OPENAI_API_KEY`
- Remember: Key is embedded at build time, not runtime

## Clean Up

```bash
kubectl delete -f k8s/ -n lern-rudi
kubectl delete namespace lern-rudi
```

## Notes

- **Stateless**: App uses localStorage (client-side), no persistent volumes needed
- **Security**: OpenAI API key is in client bundle (acceptable for demo/educational)
- **Updates**: `docker build` → `docker push` → `kubectl rollout restart deployment/lern-rudi`
