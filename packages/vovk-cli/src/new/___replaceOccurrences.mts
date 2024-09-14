import camelCase from 'lodash/camelCase.js';
import kebabCase from 'lodash/kebabCase.js';
import snakeCase from 'lodash/snakeCase.js';
import upperFirst from 'lodash/upperFirst.js';
import pluralize from 'pluralize';
import addCommonTerms from './addCommonTerms';

addCommonTerms();

console.log('WoRD', pluralize('entity'));

export default function replaceOccurrences(code: string, replacementSingular: string): string {
  const replacementPlural = pluralize(replacementSingular);

  // Different cases of the replacement string
  const replacements = {
    camelPlural: camelCase(replacementPlural),
    camel: camelCase(replacementSingular),
    pascalPlural: upperFirst(camelCase(replacementPlural)),
    pascal: upperFirst(camelCase(replacementSingular)),
    kebabPlural: kebabCase(replacementPlural),
    kebab: kebabCase(replacementSingular),
    snakePlural: snakeCase(replacementPlural),
    snake: snakeCase(replacementSingular),
    screamingSnakePlural: snakeCase(replacementPlural).toUpperCase(),
    screamingSnake: snakeCase(replacementSingular).toUpperCase(),
    screamingKebabPlural: kebabCase(replacementPlural).toUpperCase(),
    screamingKebab: kebabCase(replacementSingular).toUpperCase(),
  };

  // Create a map of original patterns to their replacements
  const originalPatterns = {
    camelPlural: 'myThings',
    camel: 'myThing',
    pascalPlural: 'MyThings',
    pascal: 'MyThing',
    kebabPlural: 'my-things',
    kebab: 'my-thing',
    snakePlural: 'my_things',
    snake: 'my_thing',
    screamingSnakePlural: 'MY_THINGS',
    screamingSnake: 'MY_THING',
    screamingKebabPlural: 'MY-THINGS',
    screamingKebab: 'MY-THING',
  };

  // Replace all occurrences in the code
  Object.keys(originalPatterns).forEach((key) => {
    const pattern = originalPatterns[key as keyof typeof originalPatterns];
    const replacementValue = replacements[key as keyof typeof replacements];

    const regex = new RegExp(pattern, 'g');
    code = code.replace(regex, replacementValue);
  });

  return code;
}
