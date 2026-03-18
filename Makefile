DOCKER_COMPOSE = docker compose -f docker/docker-compose.yml

.PHONY: all build up down ps logs clean re front-install front-re build-prod up-prod re-prod

all: up

build:
	NODE_ENV=development COMPOSE_PARALLEL_LIMIT=1 $(DOCKER_COMPOSE) build

up:
	NODE_ENV=development COMPOSE_PARALLEL_LIMIT=1 $(DOCKER_COMPOSE) up -d

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

build-prod:
	NODE_ENV=production COMPOSE_PARALLEL_LIMIT=1 $(DOCKER_COMPOSE) build

up-prod:
	NODE_ENV=production COMPOSE_PARALLEL_LIMIT=1 $(DOCKER_COMPOSE) up -d

re-prod: down up-prod