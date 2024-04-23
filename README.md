# @zwoo-hq/docs-builder

This repository contains the 

## Getting started

1) install dependencies `pnpm i`
2) prepare the build process with `pnpm run prepare:build`
3) run `docker build .` to build a docker image

## How it works

### Preparations

The `prepare:build` scripts does 2 main things:

- clone or update the documentation repositories for all languages
- generate a dockerfile that contains the build definitions for all registered docs

The Dockerfile consists of `n+1` stages:

- `n`: each language has its own build stage
- `+1`: the final stage copies all static files of all preceding stages into the final destination + the actual nginx configuration file 


## Adding a new language

Adding a new language to the build process is as easy as:

0) verify that the docs repository exists in the `zwoo-hq` org and is publicly accessible 
1) edit the `config.mjs` file and add a new entry to the `repos` object:

The object contains a reference to all repositories which should be build. The format is the following: `[lang]`: `<repository name>`.

2) Add the directory of the repository to the `.gitignore`