# Vovk Installation

## 1. Install Next.js

Follow [this instruction](https://nextjs.org/docs/getting-started/installation) to install Next.js. Use TypeScript, App Router and `src/` directory.

## 2. Install Vovk

```sh
npm i vovk
# yarn add vovk
```

```
npx create-next-app@latest
cd my-app
cp -Rv node_modules/vovk/examples/api/* src/app/api
cp -Rv node_modules/vovk/examples/vovk/* src/app/vovk
```