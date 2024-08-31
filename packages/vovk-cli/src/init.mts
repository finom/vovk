#!/usr/bin/env node
/*
npx vovk-cli init
- Check if the project is already initialized
  - Do you want to reinitialize the project?
    - Yes
    - No (exit)
- Check for package.json, if not found, show error and exit
- Check for tsconfig.json, if not found, show error and exit
- Check Next.js installed
- Choose validation library: add to the installation list
    - vovk-zod
        - Further installation notes: install zod
    - vovk-yup
        - Further installation notes: install yup
    - vovk-dto
        - Further installation notes: install class-validator and class-transformer
    - None
- If validation library is not None,
    - Do you want to enable client validation?
        - Yes 
            - Add client validation to the config
        - No
- Do you want to use concurrently? (NO NEED, USE CONCURRENTLY BY DEFAULT)
    - Yes (recommended)
        - Add concurrently to the installation list
    - No
- Do you want to update NPM scripts?
    - Yes
        - Update NPM scripts
    - No
- if experimentalDecorators is not found in tsconfig.json,
    - Do you want to add experimentalDecorators to tsconfig.json?
        - Yes
            - Add experimentalDecorators to tsconfig.json
        - No
- Do you want to create route file with example service and controller? (NO NEED)
    - Yes
        - Create route file with example controller
    - No, I will create it myself
- End
    - If there are any packages to install, install them
    - Show installation notes
    - If there are any files to create, create
    - If there are any config files to update, update
    - If example route file is NOT created, show example route file and controller
    - Show how to run the project
        - If npm scripts are updated
            - npm run dev
        - If npm scripts are NOT updated
            - If concurrently is installed
                - concurrently "vovk dev" "next dev"
            - If concurrently is NOT installed
                - vovk dev --next-dev
        - Open http://localhost:3000/api/hello-world
        - Show how to make a request to the example route
    - Show success message
*/

import { confirm } from '@inquirer/prompts';
// Or
// import confirm from '@inquirer/confirm';

// eslint-disable-next-line no-console
void confirm({ message: 'Continue?' }).then(console.info);

/*
const wizard = [
  {
    description: 'Check if the project is already initialized',
    type: 'check',
    choices: {
      type: 'choice',
      choices: [
        {
          label: 'Yes',
          action: 'continue',
        },
        {
          label: 'No',
          action: 'exit',
          exitMessage: 'Exiting...',
        },
      ],
    },
  },
  {
    description: 'Check for package.json',
    type: 'check',
    handleCheck: () => {
      // Check if the project is already initialized
    },
    yes: {
      action: 'continue',
    },
    no: {
      action: 'exit',
      exitMessage: 'Exiting...',
    },
  },
  {
    description: 'Check for tsconfig.json',
    type: 'check',
    handleCheck: () => {
      // Check for package.json
    },
    yes: {
      action: 'continue',
    },
    no: {
      action: 'exit',
      exitMessage: 'Exiting...',
    },
  },
  {
    description: 'Check Next.js installed with app router',
    type: 'check',
    handleCheck: () => {
      // Check for tsconfig.json
    },
    yes: {
      action: 'continue',
    },
    no: {
      action: 'exit',
      exitMessage: 'Exiting...',
    },
  },
  {
    description: 'Choose validation library',
    type: 'install',
    choices: {
      type: 'choice',
      choices: [
        {
          package: 'vovk-zod',
          action: 'install',
          notes: 'Further installation notes: install zod',
        },
        {
          package: 'vovk-yup',
          action: 'install',
          notes: 'Further installation notes: install yup',
        },
        {
          package: 'vovk-dto',
          action: 'install',
          notes: 'Further installation notes: install class-validator and class-transformer',
        },
        {
          package: null,
          action: 'continue',
        },
      ],
    },
  },
  {
    description: 'Do you want to enable client validation?',
    type: 'choice',
    choices: [
      {
        label: 'Yes',
        action: 'updateConfig',
      },
      {
        label: 'No',
        action: 'updateConfig',
      },
    ],
  },
];

// export default console.info(wizard);
*/
