<p align="center">
  <a href="https://vovk.dev">
    <picture>
      <source width="300" media="(prefers-color-scheme: dark)" srcset="https://vovk.dev/vovk-logo-white.svg">
      <source width="300" media="(prefers-color-scheme: light)" srcset="https://vovk.dev/vovk-logo.svg">
      <img width="300" alt="vovk" src="https://vovk.dev/vovk-logo.svg">
    </picture>
  </a>
  <br />
  <strong>Back-end Framework for Next.js App Router</strong>
  <br />
  <em>One codebase → type-safe clients, OpenAPI, and AI tools</em>
  <br />
  <a href="https://vovk.dev/">Documentation</a>
  &nbsp;&nbsp;
  <a href="https://vovk.dev/quick-install">Quick Start</a>
  &nbsp;&nbsp;
  <a href="https://vovk.dev/performance">Performance</a>
</p>

---

## Vovk.ts Multitenancy Example

An example of a multi-tenant application built with [Next.js](https://nextjs.org) and [Vovk.ts](https://vovk.dev) that implements the following subdomain cases:

- [example.com](https://multitenant.vovk.dev/) for the root tenant,
- [admin.example.com](https://admin.multitenant.vovk.dev/) for the admin tenant,
- [customer.example.com](https://customer.multitenant.vovk.dev/) for a customer tenant,
- [\*.customer.example.com](https://acme.customer.multitenant.vovk.dev/) for a specific customer tenant, like `acme.customer.example.com`,
- [pro.\*.customer.example.com](https://pro.acme.customer.multitenant.vovk.dev/) for a "pro" version of a customer tenant, like `pro.acme.customer.example.com`.

For more information, please visit the [multitenancy tutorial](https://vovk.dev/multitenant).
