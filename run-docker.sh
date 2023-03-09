docker stop $(docker ps -aq) && docker rm $(docker ps -aq)
dokcer build -t romorlovich/jobs-agent-backend .
docker run -d -p 5000:5000 --name jobs-agent --env-file .env romorlovich/jobs-agent-backend