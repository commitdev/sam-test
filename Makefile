run-docker:
	docker build -t docker-sam .
	docker run -p 3000:3000 docker-sam

run-sam:
	sam local invoke -n dev-env.json

run-sam-api:
	sam local start-api -n dev-env.json
