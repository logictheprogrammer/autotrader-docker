FROM node:20.4.0

WORKDIR /app

RUN corepack enable

COPY . .

RUN pnpm install

# RUN pnpm run build

# RUN rm -rf src

EXPOSE 3000

CMD [ "pnpm","run","dev" ]

# CMD [ "node","dist/index.js" ]