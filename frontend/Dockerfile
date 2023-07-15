FROM node:20.4.0-slim as home

WORKDIR /app/home

RUN corepack enable

COPY ./home .

RUN pnpm install

RUN pnpm run build

FROM nginx:1.25.1

# WORKDIR /etc/nginx/conf.d

# COPY ./server/nginx.conf ./default.conf

# WORKDIR /usr/share/nginx/html

# RUN rm ./*

# COPY ./server/build/ ./

# EXPOSE 80