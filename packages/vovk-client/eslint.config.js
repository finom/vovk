import rootConfig from '../../eslint.config.js';

export default [
  ...rootConfig,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.cjs', '*.cts'],
        },
      },
    },
  },
];
