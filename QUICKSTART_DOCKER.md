# 🚀 TrueNAS Quick Deploy - Grammar Learning App

## One-Command Deployment

```bash
./deploy.sh
```

## Manual Docker Commands

### Build
```bash
docker build -t grammar-learning-app:latest .
```

### Run (Docker Compose)
```bash
docker-compose up -d
docker-compose logs -f
```

### Run (Plain Docker)
```bash
docker run -d \
  --name grammar-learning-app \
  --restart unless-stopped \
  -p 8080:80 \
  grammar-learning-app:latest
```

### Management
```bash
# View logs
docker logs -f grammar-learning-app

# Stop
docker-compose down

# Restart
docker-compose restart

# Check status
docker ps | grep grammar

# Resource usage
docker stats grammar-learning-app
```

## Access URLs
- **Local**: http://localhost:8080
- **Network**: http://your-truenas-ip:8080
- **Health Check**: http://your-truenas-ip:8080/health

## Ports
- Container: 80 (nginx)
- Host: 8080 (configurable in docker-compose.yml)

## File Locations on TrueNAS
```
/mnt/pool/apps/grammar-app/     # App files
/mnt/pool/backups/              # Backups (optional)
```

## Update Process
```bash
cd /mnt/pool/apps/grammar-app
git pull origin main
docker build -t grammar-learning-app:latest .
docker-compose down
docker-compose up -d
```

## Troubleshooting
```bash
# Check container status
docker ps -a | grep grammar

# View recent logs
docker logs --tail 100 grammar-learning-app

# Restart container
docker restart grammar-learning-app

# Rebuild from scratch
docker-compose down -v
docker system prune -a
docker build --no-cache -t grammar-learning-app:latest .
docker-compose up -d
```

## Environment Variables
Build-time variables (baked into image):
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID
- VITE_OPENROUTER_API_KEY

Set in `.env` file before building!

## Resource Requirements
- **CPU**: 0.25-0.5 cores
- **RAM**: 256-512 MB
- **Disk**: ~500 MB for image + built files

## Backup Command
```bash
docker save grammar-learning-app:latest | gzip > grammar-app-backup.tar.gz
```

## Full Documentation
See [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) for complete guide.
