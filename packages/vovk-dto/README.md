Description is coming soon.


## Mapped types

You can install [@nestjs/mapped-types](https://github.com/nestjs/mapped-types) to get essential utilities such as `PartialType`, `OmitType`, `PickType` and `IntersectionType`. 

```ts
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['email'] as const)
) {}
```

Since **@nestjs/mapped-types** has backward compatibility code that attempts to support older versions of **class-transformer**, it includes a `require` call for module `class-transformer/storage` that does not exists in the latest version of **class-transformer**. Webpack (used by Next.js internally) tries to compile this module and introduces compilation errors. To address this problem, you can modify Next.js Webpack configuration to ignore this import completely by aliasing it to `false`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.resolve.alias['class-transformer/storage'] = false;
        return config;
    },
};

module.exports = nextConfig;
```

You can also use `webpack.IgnorePlugin` if needed:

```ts
const webpack = require('webpack');

module.exports = {
  webpack: (config) => {
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /class-transformer\/storage/,
      })
    );
    return config;
  },
};
```