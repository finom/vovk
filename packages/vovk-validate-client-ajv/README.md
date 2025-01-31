<p align="center"> 
  <picture>
    <source width="300" media="(prefers-color-scheme: dark)" srcset="https://vovk.dev/vovk-logo-white.svg">
    <source width="300" media="(prefers-color-scheme: light)" srcset="https://vovk.dev/vovk-logo.svg">
    <img width="300" alt="vovk" src="https://vovk.dev/vovk-logo.svg">
  </picture><br>
  <strong>REST + RPC = ♥️</strong>
</p>

<p align="center">
  Back-end meta-framework for <a href="https://nextjs.org/docs/app">Next.js</a>
</p>

---

## vovk-validate-client-ajv [![npm version](https://badge.fury.io/js/vovk-validate-client-ajv.svg)](https://www.npmjs.com/package/vovk-validate-client-ajv)

A library that is re-exported from [vovk-zod/validateOnClient](https://vovk.dev/validation/vovk-zod) and [vovk-yup/validateOnClient](https://vovk.dev/validation/vovk-yup) that provides client-side validation for JSON schemas emitted by these libraries. If you build a custom validation library that also emits JSON schemas, you can use this package to create your `validateOnClient` function.

```ts
export { default } from 'vovk-validate-client-ajv';
```