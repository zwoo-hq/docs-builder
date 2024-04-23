import "zx/globals";
import { repos } from "./config.mjs";

const start = performance.now();
console.log(chalk.cyan("docs-builder: prepare"));
console.log(chalk.blue("docs-builder: enumerating config"));

Object.keys(repos).forEach((lng) => {
  console.log(chalk.magenta(`\tfound language: ${lng}, dir: ${repos[lng]}`));
});

console.log(chalk.blue("docs-builder: preparing repos"));
const tasks = Object.values(repos).map(async (repo) => {
  const dir = `./${repo}`;
  console.log(chalk.green(`repo dir: ${dir}`));
  if (await fs.exists(dir)) {
    console.log(chalk.magenta(`\t${dir} exists, pulling latest changes`));
    await $`cd ${dir} && git pull`;
  } else {
    console.log(chalk.magenta(`\t${dir} does not exist, cloning repo`));
    await $`git clone https://github.com/zwoo-hq/${repo}.git`;
  }
});

await Promise.all(tasks);

const end = performance.now();
console.log(
  chalk.cyan(
    `docs-builder: prepare finished in ${((end - start) / 1000).toFixed(3)}s`
  )
);
console.log();
