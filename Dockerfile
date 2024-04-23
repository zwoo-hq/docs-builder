
FROM node:18-alpine as build-en

# setup
WORKDIR /src/docs-builder/docs
COPY ./docs/package.json ./
COPY ./docs/yarn.lock ./

RUN yarn

# copy source
COPY ./docs/api ./api
COPY ./docs/docs ./docs
COPY ./docs/dev ./dev
COPY ./docs/commonConfig.mts ./

# build
RUN yarn build

FROM node:18-alpine as build-de

# setup
WORKDIR /src/docs-builder/docs-de
COPY ./docs-de/package.json ./
COPY ./docs-de/yarn.lock ./

RUN yarn

# copy source
COPY ./docs-de/api ./api
COPY ./docs-de/docs ./docs
COPY ./docs-de/dev ./dev
COPY ./docs-de/commonConfig.mts ./

# build
RUN yarn build

### Production Stage
FROM nginx:stable-alpine as prod
COPY ./nginx.conf /etc/nginx/

COPY --from=build-en /src/docs-builder/docs/docs/.vitepress/dist /app/docs
COPY --from=build-en /src/docs-builder/docs/api/.vitepress/dist /app/docs/api
COPY --from=build-en /src/docs-builder/docs/dev/.vitepress/dist /app/docs/dev

COPY --from=build-de /src/docs-builder/docs-de/docs/.vitepress/dist /app/docs/de
COPY --from=build-de /src/docs-builder/docs-de/api/.vitepress/dist /app/docs/de/api
COPY --from=build-de /src/docs-builder/docs-de/dev/.vitepress/dist /app/docs/de/dev
