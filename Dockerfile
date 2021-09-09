FROM node:14-alpine as base
WORKDIR /app
COPY hello-world .

RUN touch .env
RUN npm i --no-optional --production

FROM node:14-alpine
WORKDIR /app
COPY --from=base /app /app

CMD ["node", "app-docker.js"]
