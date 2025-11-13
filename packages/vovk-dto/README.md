<p align="center">
  <a href="https://vovk.dev">
    <picture>
      <source width="300" media="(prefers-color-scheme: dark)" srcset="https://vovk.dev/vovk-logo-white.svg">
      <source width="300" media="(prefers-color-scheme: light)" srcset="https://vovk.dev/vovk-logo.svg">
      <img width="300" alt="vovk" src="https://vovk.dev/vovk-logo.svg">
    </picture>
  </a>
  <br>
  <strong>Back-end for Next.js</strong>
  <br />
  <a href="https://vovk.dev/about">About Vovk.ts</a>
  &nbsp;
  <a href="https://vovk.dev/quick-install">Quick Start</a>
  &nbsp;
  <a href="https://github.com/finom/vovk">Github Repo</a>
</p>

---

## vovk-dto [![npm version](https://badge.fury.io/js/vovk-dto.svg)](https://www.npmjs.com/package/vovk-dto)

[class-validator](https://www.npmjs.com/package/class-validator) library for Vovk.ts.

```sh
npm install vovk-dto
```

```ts
import { withDto } from 'vovk-dto';
import { post, prefix } from 'vovk';
import { UserBodyDto, UserQueryDto, UserParamsDto } from './UserDtos';

@prefix('users')
export default class UserController {
  @post('{id}')
  static updateUser = withDto({
    body: UserBodyDto,
    query: UserQueryDto,
    params: UserParamsDto,
    handle: (req) => {
      // ...
    },
  });
}
```

Also offers `validateOnClient` function that can be set at [imports config](https://vovk.dev/imports#validateonclient).

```ts
/** @type {import('vovk').VovkConfig} */
const config = {
  outputConfig: {
    imports: {
      validateOnClient: 'vovk-dto/validateOnClient',
    },
  },
};

export default config;
```

For more information, please visit the [documentation](https://vovk.dev/validation/dto).

You might also be interested in the type mapping library for DTOs: [dto-mapped-types](https://github.com/finom/dto-mapped-types).
