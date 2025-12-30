DOCKER_COMPOSE = docker compose -f docker/docker-compose.yml

.PHONY: all build up down ps logs clean re front-modules front-install front-restart

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

front-modules:
	$(DOCKER_COMPOSE) cp front:/app/node_modules/react ./srcs/front/node_modules/
	$(DOCKER_COMPOSE) cp front:/app/node_modules/react-dom ./srcs/front/node_modules/
	$(DOCKER_COMPOSE) cp front:/app/node_modules/@types ./srcs/front/node_modules/

front-install:
	cat srcs/front/package.json | $(DOCKER_COMPOSE) exec -T front sh -c 'cat > /app/package.json'
	$(DOCKER_COMPOSE) exec front npm install

front-restart:
	$(DOCKER_COMPOSE) restart front

re: down up