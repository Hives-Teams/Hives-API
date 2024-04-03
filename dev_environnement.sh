#!/bin/bash

docker compose up --build -d dev 
docker exec -it hives-backend-dev sh