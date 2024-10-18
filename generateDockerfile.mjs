import "zx/globals";
import { repos } from "./config.mjs";

const Pre = `
FROM node:20-alpine AS prepare-env
RUN corepack enable
`;

const Stage = `
FROM prepare-env AS build-#LANG#

# setup
WORKDIR /src/docs-builder/#DIR#
COPY ./#DIR#/package.json ./
COPY ./#DIR#/pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# copy source
COPY ./#DIR#/api ./api
COPY ./#DIR#/docs ./docs
COPY ./#DIR#/dev ./dev
COPY ./#DIR#/scripts ./scripts
COPY ./#DIR#/commonConfig.mts ./
COPY ./#DIR#/public ./public

# build
RUN pnpm build
`;

const ProductionCopy = `
COPY --from=build-#LANG# /src/docs-builder/#DIR#/docs/.vitepress/dist /app/docs#LANG_DIR#
COPY --from=build-#LANG# /src/docs-builder/#DIR#/api/.vitepress/dist /app/docs#LANG_DIR#/api
COPY --from=build-#LANG# /src/docs-builder/#DIR#/dev/.vitepress/dist /app/docs#LANG_DIR#/dev
`;

const Production = `
### Production Stage
FROM nginx:stable-alpine AS prod
COPY ./nginx.conf /etc/nginx/
`;

const buildDockerfile = () => {
  let content = Pre;
  let copies = "";

  for (const [lang, dir] of Object.entries(repos)) {
    console.log(chalk.green(`repo: ${dir} (${lang})`));
    content += Stage.replace(/#LANG#/g, lang).replace(/#DIR#/g, dir);
    copies += ProductionCopy.replace(/#LANG#/g, lang)
      .replace(/#LANG_DIR#/g, lang === "en" ? "" : "/" + lang)
      .replace(/#DIR#/g, dir);
  }

  const destination = path.resolve("./Dockerfile");
  console.log(chalk.magenta(`\twriting Dockerfile to ${destination}`));
  fs.writeFileSync("./Dockerfile", content + Production + copies);
};

const start = performance.now();
console.log(chalk.cyan("docs-builder: generate dockerfile"));
console.log(chalk.blue("docs-builder: generating dockerfile from given repos"));

buildDockerfile();

const end = performance.now();
console.log(
  chalk.cyan(
    `docs-builder: generate dockerfile finished in ${(
      (end - start) /
      1000
    ).toFixed(3)}s`
  )
);
console.log();
