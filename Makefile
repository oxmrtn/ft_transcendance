DOCKER_COMPOSE = docker compose -f docker/docker-compose.yml

.PHONY: all build up down ps logs restart clean re front-install front-restart

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

front-install:
	$(DOCKER_COMPOSE) run --rm front npm install

front-restart:
	$(DOCKER_COMPOSE) restart front

restart: down up

re: clean up