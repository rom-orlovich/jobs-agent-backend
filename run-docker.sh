docker stop $(docker ps -aq) && docker rm $(docker ps -aq)
docker compose -f docker-compose.pro.yaml up -d
