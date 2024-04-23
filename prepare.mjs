import "zx/globals";
import { repos } from "./config.mjs";

const tasks = Object.values(repos).map(async (repo) => {
  const dir = `./${repo}`;
  if (await fs.exists(dir)) {
    await $`cd ${dir} && git pull`;
  } else {
    await $`git clone https://github.com/zwoo-hq/${repo}.git`;
  }
});

await Promise.all(tasks);
