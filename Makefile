DOCKER_COMPOSE = docker compose -f docker/docker-compose.yml

.PHONY: all build up down ps logs restart clean re

all: up

build:
	$(DOCKER_COMPOSE) build

up:
	$(DOCKER_COMPOSE) up -d

down:
	$(DOCKER_COMPOSE) down --remove-orphans

ps:
	$(DOCKER_COMPOSE) ps

logs:
	$(DOCKER_COMPOSE) logs -f

clean:
	$(DOCKER_COMPOSE) down --remove-orphans --rmi all

restart: down up

re: clean up