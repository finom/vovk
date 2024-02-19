---
sidebar_position: 7
---

# Customization

## vovk.config.js

```ts
/** @type {import('vovk').VovkConfig} */
const vovkConfig = {
    clientOut: './node_modules/.vovk',
    route: './src/app/api/[[...vovk]]/route.ts',
    fetcher: 'vovk/client/defaultFetcher',
    prefix: '/api',
    validateOnClient: '',
};

module.exports = vovkConfig;
```

## Customize fetcher and default options

Soon...

## Customize client validation library

Soon...