import "zx/globals";
import { repos } from "./config.mjs";

const Stage = `
FROM node:18-alpine as build-#LANG#

# setup
WORKDIR /src/docs-builder/#DIR#
COPY ./#DIR#/package.json ./
COPY ./#DIR#/yarn.lock ./

RUN yarn

# copy source
COPY ./#DIR#/api ./api
COPY ./#DIR#/docs ./docs
COPY ./#DIR#/dev ./dev
COPY ./#DIR#/commonConfig.mts ./

# build
RUN yarn build
`;

const ProductionCopy = `
COPY --from=build-#LANG# /src/docs-builder/#DIR#/docs/.vitepress/dist /app/docs#LANG_DIR#
COPY --from=build-#LANG# /src/docs-builder/#DIR#/api/.vitepress/dist /app/docs#LANG_DIR#/api
COPY --from=build-#LANG# /src/docs-builder/#DIR#/dev/.vitepress/dist /app/docs#LANG_DIR#/dev
`;

const Production = `
### Production Stage
FROM nginx:stable-alpine as prod
COPY ./nginx.conf /etc/nginx/
`;

const buildDockerfile = () => {
  let content = "";
  let copies = "";

  for (const [lang, dir] of Object.entries(repos)) {
    console.log(lang, dir);
    content += Stage.replace(/#LANG#/g, lang).replace(/#DIR#/g, dir);
    copies += ProductionCopy.replace(/#LANG#/g, lang)
      .replace(/#LANG_DIR#/g, lang === "en" ? "" : "/" + lang)
      .replace(/#DIR#/g, dir);
  }

  fs.writeFileSync("./Dockerfile", content + Production + copies);
};

buildDockerfile();
