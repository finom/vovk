<p align="center">
  <a href="https://vovk.dev">
    <picture>
      <source width="300" media="(prefers-color-scheme: dark)" srcset="https://vovk.dev/vovk-logo-white.svg">
      <source width="300" media="(prefers-color-scheme: light)" srcset="https://vovk.dev/vovk-logo.svg">
      <img width="300" alt="vovk" src="https://vovk.dev/vovk-logo.svg">
    </picture>
  </a>
  <br>
  <strong>Back-end Framework for Next.js App Router</strong>
  <br />
  <a href="https://vovk.dev/">Documentation</a>
  &nbsp;&nbsp;
  <a href="https://vovk.dev/quick-install">Quick Start</a>
  &nbsp;&nbsp;
  <a href="https://vovk.dev/performance">Performance</a>
</p>

---

## Overhead Performance Measurements for Vovk.ts

This folder contains tests measuring the performance overhead introduced by using [Vovk.ts](https://vovk.dev/) as a back-end framework for [Next.js](https://nextjs.org/) applications. For detailed information, please refer to the [performance testing article](https://vovk.dev/performance).

```sh
git clone https://github.com/finom/vovk.git
cd vovk
npm ci
npm run build
cd perf
npm run perf-test
```
