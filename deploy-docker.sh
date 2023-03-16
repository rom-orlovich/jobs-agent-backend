#!/bin/bash 
git push origin main
docker build -t romorlovich/jobs-agent-backend -f src/Dockerfile.pro .
docker push romorlovich/jobs-agent-backend
