FROM node:20.4.0-slim as build

WORKDIR /app

ARG UID=1000
ARG GID=1000

RUN groupmod -g "${GID}" node && usermod -u "${UID}" -g "${GID}" node \
    && chown node:node -R ../app

USER node

COPY --chown=node:node ./node_modules ./node_modules

COPY --chown=node:node ./package.json ./

RUN npm install && mv -f ./node_modules ./temp_modules

COPY --chown=node:node . .

RUN rm -rf ./node_modules && mv -f ./temp_modules ./node_modules

###############################################################################

FROM node:20.4.0 as dev

WORKDIR /app

COPY --from=build /app .

EXPOSE 3000

CMD [ "npm","run","dev" ]

###############################################################################

FROM node:20.4.0 as prod

WORKDIR /app

COPY --from=build /app .

RUN npm run build && rm -rf src && rm -f tsconfig.json \
    && rm -f package-lock.json \
    && rm -f .eslintrc.js && rm -f .prettierrc.js

EXPOSE 3000

CMD [ "node","dist/index.js" ]