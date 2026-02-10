DOCKER_COMPOSE = docker compose -f docker/docker-compose.yml

.PHONY: all build up down ps logs clean re front-install front-re

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
	$(DOCKER_COMPOSE) down -v --remove-orphans --rmi all

back-install:
	$(DOCKER_COMPOSE) exec backend npm install

front-install:
	$(DOCKER_COMPOSE) exec front npm install

front-re:
	$(DOCKER_COMPOSE) restart front

re: down up