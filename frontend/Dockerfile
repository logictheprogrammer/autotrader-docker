FROM node:20.4.0-slim as home-copy

# RUN npm install -g npm@9.8.0

WORKDIR /app

ARG UID=1000
ARG GID=1000

RUN groupmod -g "${GID}" node && usermod -u "${UID}" -g "${GID}" node \
    && chown node:node -R ../app

USER node

COPY --chown=node:node ./home/node_modules ./node_modules

COPY --chown=node:node ./home/package.json ./

RUN npm install && mv -f ./node_modules ./temp_modules

COPY --chown=node:node ./home .

RUN rm -rf ./node_modules && mv -f ./temp_modules ./node_modules

###############################################################################

FROM node:20.4.0 as home-dev

# RUN npm install -g npm@9.8.0

WORKDIR /app

ARG UID=1000
ARG GID=1000

RUN groupmod -g "${GID}" node && usermod -u "${UID}" -g "${GID}" node \
    && chown node:node -R ../app

USER node

COPY --from=home-copy /app .

EXPOSE 5173

CMD [ "npm","run","dev" ]

###############################################################################

FROM node:20.4.0-slim as home-prod

# RUN npm install -g npm@9.8.0

WORKDIR /app

ARG UID=1000
ARG GID=1000

RUN groupmod -g "${GID}" node && usermod -u "${UID}" -g "${GID}" node \
    && chown node:node -R ../app

USER node

COPY --from=home-copy /app .

RUN npm run build && rm -rf src && rm -f tsconfig.json \
    && rm -f package-lock.json \
    && rm -f .eslintrc.js && rm -f .prettierrc.js \
    && rm -f auto-imports.d.ts && rm -f components.d.ts \
    && rm -f env.d.ts && rm -f tsconfig.config.json \
    && rm -f types.d.ts && rm -f vite.config.ts 

###############################################################################
###############################################################################

FROM node:20.4.0-slim as user-copy

# RUN npm install -g npm@9.8.0

WORKDIR /app

ARG UID=1000
ARG GID=1000

RUN groupmod -g "${GID}" node && usermod -u "${UID}" -g "${GID}" node \
    && chown node:node -R ../app

USER node

COPY --chown=node:node ./user/node_modules ./node_modules

COPY --chown=node:node ./user/package.json ./

RUN npm install && mv -f ./node_modules ./temp_modules

COPY --chown=node:node ./user .

RUN rm -rf ./node_modules && mv -f ./temp_modules ./node_modules

###############################################################################

FROM node:20.4.0 as user-dev

# RUN npm install -g npm@9.8.0

WORKDIR /app

ARG UID=1000
ARG GID=1000

RUN groupmod -g "${GID}" node && usermod -u "${UID}" -g "${GID}" node \
    && chown node:node -R ../app

USER node

COPY --from=user-copy /app .

EXPOSE 5174

CMD [ "npm","run","dev" ]

###############################################################################

FROM node:20.4.0-slim as user-prod

# RUN npm install -g npm@9.8.0

WORKDIR /app

ARG UID=1000
ARG GID=1000

RUN groupmod -g "${GID}" node && usermod -u "${UID}" -g "${GID}" node \
    && chown node:node -R ../app

USER node

COPY --from=user-copy /app .

RUN npm run build && rm -rf src && rm -f tsconfig.json \
    && rm -f package-lock.json \
    && rm -f .eslintrc.js && rm -f .prettierrc.js \
    && rm -f auto-imports.d.ts && rm -f components.d.ts \
    && rm -f env.d.ts && rm -f tsconfig.config.json \
    && rm -f types.d.ts && rm -f vite.config.ts 

###############################################################################
###############################################################################

FROM node:20.4.0-slim as admin-copy

# RUN npm install -g npm@9.8.0

WORKDIR /app

ARG UID=1000
ARG GID=1000

RUN groupmod -g "${GID}" node && usermod -u "${UID}" -g "${GID}" node \
    && chown node:node -R ../app

USER node

COPY --chown=node:node ./admin/node_modules ./node_modules

COPY --chown=node:node ./admin/package.json ./

RUN npm install && mv -f ./node_modules ./temp_modules

COPY --chown=node:node ./admin .

RUN rm -rf ./node_modules && mv -f ./temp_modules ./node_modules

###############################################################################

FROM node:20.4.0 as admin-dev

# RUN npm install -g npm@9.8.0

WORKDIR /app

ARG UID=1000
ARG GID=1000

RUN groupmod -g "${GID}" node && usermod -u "${UID}" -g "${GID}" node \
    && chown node:node -R ../app

USER node

COPY --from=admin-copy /app .

EXPOSE 5175

CMD [ "npm","run","dev" ]

###############################################################################

FROM node:20.4.0-slim as admin-prod

# RUN npm install -g npm@9.8.0

WORKDIR /app

ARG UID=1000
ARG GID=1000

RUN groupmod -g "${GID}" node && usermod -u "${UID}" -g "${GID}" node \
    && chown node:node -R ../app

USER node

COPY --from=admin-copy /app .

RUN npm run build && rm -rf src && rm -f tsconfig.json \
    && rm -f package-lock.json \
    && rm -f .eslintrc.js && rm -f .prettierrc.js \
    && rm -f auto-imports.d.ts && rm -f components.d.ts \
    && rm -f env.d.ts && rm -f tsconfig.config.json \
    && rm -f types.d.ts && rm -f vite.config.ts 

###############################################################################
###############################################################################

FROM nginx:1.25.1 as server

WORKDIR /etc/nginx/conf.d

COPY ./nginx.conf ./default.conf

WORKDIR /usr/share/nginx/html

RUN rm ./*

COPY --from=home-prod /app/home ./home

# COPY --from=user-prod ./user ./user

# COPY --from=admin-prod ./admin ./admin

EXPOSE 80