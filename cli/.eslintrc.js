module.exports = {
    extends: '../.eslintrc.js',
    rules: {
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        'no-console': ['error', { allow: ['info', 'error', 'warn'] }]
    },
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: '../tsconfig.cli.json',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        tsconfigRootDir: __dirname,
        createDefaultProgram: true,
    },
}