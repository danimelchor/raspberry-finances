.PHONY: dev prod deploy erase-db push

dev:
	docker-compose -f docker-compose.dev.yaml up

prod:
	docker-compose -f docker-compose.yaml up --build

USERNAME=dmelchor
HOST=dmelchorpi.local

deploy:
	@ssh $(USERNAME)@$(HOST) "mkdir -p ~/finances"
	@scp docker-compose.yaml $(USERNAME)@$(HOST):~/finances
	@ssh $(USERNAME)@$(HOST) "cd ~/finances && docker compose down"
	@ssh $(USERNAME)@$(HOST) "cd ~/finances && docker compose pull"
	@ssh $(USERNAME)@$(HOST) "cd ~/finances && docker compose up -d"

erase-db:
	@ssh $(USERNAME)@$(HOST) "cd ~/finances && docker compose down"
	@ssh $(USERNAME)@$(HOST) "cd ~/finances && docker volume rm finances_postgres_data"
	@read -p "Username: " USER; \
	read -p "Password: " -s PASSWORD; \
	echo; \
	read -p "Email: " EMAIL; \
	ssh $(USERNAME)@$(HOST) "docker exec api /cli create-user --username $$USER --password $$PASSWORD --email $$EMAIL"

push:
	@docker compose build
	@docker push dmelchor/finances-api:latest
	@docker push dmelchor/finances-frontend:latest
	@docker push dmelchor/finances-db:latest
