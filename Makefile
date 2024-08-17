USERNAME=dmelchor
HOST=dmelchorpi.local

.PHONY: dev prod deploy erase-db push

dev:
	docker compose -f docker-compose.dev.yaml up -d
	docker compose exec dev-api go run \
		cmd/cli/cli.go \
		create-user \
		--username admin \
		--password admin \
		--email admin@finances.com
	docker compose logs -f

prod:
	docker compose -f docker-compose.yaml up --build

push:
	@docker compose build
	@docker push dmelchor/finances-api:latest
	@docker push dmelchor/finances-frontend:latest
	@docker push dmelchor/finances-db:latest

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
