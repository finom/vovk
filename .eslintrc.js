/* eslint-disable @typescript-eslint/naming-convention */
module.exports = {
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'eslint:recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['@typescript-eslint'],
  settings: {
    'import/resolver': {
      typescript: {},
    },
    cache: false
  },
  rules: {
    'no-unused-vars': 0, // we use typescript
    'no-console': "warn"
  },
  ignorePatterns: ["dist", "*.d.ts"],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.eslint.json',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    tsconfigRootDir: __dirname,
    createDefaultProgram: true,
  },
  env: {
    node: true,
  },
};
  