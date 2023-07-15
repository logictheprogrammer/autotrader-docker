FROM node:20.4.0-slim as install

WORKDIR /app

ARG UID=1000
ARG GID=1000

RUN groupmod -g "${GID}" node && usermod -u "${UID}" -g "${GID}" node \
    && chown node:node -R ../app

USER node

ARG FRONTEND=home

COPY --chown=node:node ./${FRONTEND}/node_modules ./node_modules

COPY --chown=node:node ./${FRONTEND}/package.json ./

RUN npm install && mv -f ./node_modules ./temp_modules

COPY --chown=node:node ./${FRONTEND} .

RUN rm -rf ./node_modules && mv -f ./temp_modules ./node_modules

###############################################################################

FROM node:20.4.0-slim as dev

WORKDIR /app

COPY --from=install /app .

EXPOSE 5173 5174 5175

CMD [ "npm","run","dev" ]

###############################################################################

FROM node:20.4.0-slim as prod

WORKDIR /app

COPY --from=build /app .

RUN npm run build && rm -rf src && rm -f tsconfig.json \
    && rm -f package-lock.json \
    && rm -f .eslintrc.js && rm -f .prettierrc.js

EXPOSE 3000

CMD [ "node","dist/index.js" ]

###############################################################################

# FROM nginx:1.25.1

# WORKDIR /etc/nginx/conf.d

# COPY ./server/nginx.conf ./default.conf

# WORKDIR /usr/share/nginx/html

# RUN rm ./*

# COPY ./server/build/ ./

# EXPOSE 80