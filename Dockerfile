
FROM prepare-env AS build-en

# setup
WORKDIR /src/docs-builder/docs
COPY ./docs/package.json ./
COPY ./docs/pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# copy source
COPY ./docs/api ./api
COPY ./docs/docs ./docs
COPY ./docs/dev ./dev
COPY ./docs/scripts ./scripts
COPY ./docs/commonConfig.mts ./

# build
RUN pnpm build

FROM prepare-env AS build-de

# setup
WORKDIR /src/docs-builder/docs-de
COPY ./docs-de/package.json ./
COPY ./docs-de/pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# copy source
COPY ./docs-de/api ./api
COPY ./docs-de/docs ./docs
COPY ./docs-de/dev ./dev
COPY ./docs-de/scripts ./scripts
COPY ./docs-de/commonConfig.mts ./

# build
RUN pnpm build

### Production Stage
FROM nginx:stable-alpine AS prod
COPY ./nginx.conf /etc/nginx/

COPY --from=build-en /src/docs-builder/docs/docs/.vitepress/dist /app/docs
COPY --from=build-en /src/docs-builder/docs/api/.vitepress/dist /app/docs/api
COPY --from=build-en /src/docs-builder/docs/dev/.vitepress/dist /app/docs/dev

COPY --from=build-de /src/docs-builder/docs-de/docs/.vitepress/dist /app/docs/de
COPY --from=build-de /src/docs-builder/docs-de/api/.vitepress/dist /app/docs/de/api
COPY --from=build-de /src/docs-builder/docs-de/dev/.vitepress/dist /app/docs/de/dev
