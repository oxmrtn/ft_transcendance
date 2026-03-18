DOCKER_COMPOSE = docker compose -f docker/docker-compose.yml

.PHONY: all build up down ps logs clean re \
	build-dev up-dev re-dev \
	build-prod up-prod re-prod \
	back-install front-install front-re

all: up

build:
	NODE_ENV=production COMPOSE_PARALLEL_LIMIT=1 $(DOCKER_COMPOSE) build

up:
	NODE_ENV=production COMPOSE_PARALLEL_LIMIT=1 $(DOCKER_COMPOSE) up -d

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

build-dev:
	NODE_ENV=development COMPOSE_PARALLEL_LIMIT=1 $(DOCKER_COMPOSE) build

up-dev:
	NODE_ENV=development COMPOSE_PARALLEL_LIMIT=1 $(DOCKER_COMPOSE) up -d

re-dev: down up-dev

build-prod:
	$(MAKE) build

up-prod:
	$(MAKE) up

re-prod: down up-prod