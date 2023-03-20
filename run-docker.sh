docker stop $(docker ps -aq) && docker rm $(docker ps -aq)
docker compose -f docker-compose.dev.yaml up -d
