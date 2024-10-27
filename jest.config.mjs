/** @type {import('jest').Config} */
const config = {
  roots: ['<rootDir>/test'],
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsConfig: 'test/tsconfig.json',
      },
    ],
  },
  modulePathIgnorePatterns: ['dist'],
  testTimeout: 10000,
};

export default config;
