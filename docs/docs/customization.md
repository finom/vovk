---
sidebar_position: 7
---

# Customization

## vovk.config.js

```ts
/** @type {import('vovk').VovkConfig} */
const vovkConfig = {
    out: './node_modules/.vovk',
    route: './src/app/api/[[...vovk]]/route.ts',
    fetcher: 'vovk/client/defaultFetcher',
    prefix: '/api',
    validateOnClient: '',
};

module.exports = vovkConfig;
```

## Customize fetcher and default options

## Customize client validation library