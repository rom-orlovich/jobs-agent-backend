#!/bin/bash 
git push origin main
docker build -t romorlovich/jobs-agent-backend .
docker push romorlovich/jobs-agent-backend
