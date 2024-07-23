module.exports = {
  "extends": "../.eslintrc.js",
  "rules": {
    "@typescript-eslint/no-unnecessary-type-assertion": "off",
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    tsconfigRootDir: __dirname,
    createDefaultProgram: true,
  },
}
