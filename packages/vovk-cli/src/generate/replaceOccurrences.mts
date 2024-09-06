import { camelCase, kebabCase, snakeCase, upperFirst } from 'lodash';
import pluralize from 'pluralize';

export default function replaceOccurrences(code: string, replacementSingular: string): string {
  const replacementPlural = pluralize(replacementSingular);

  // Different cases of the replacement string
  const replacements = {
    camel: camelCase(replacementSingular),
    camelPlural: camelCase(replacementPlural),
    pascal: upperFirst(camelCase(replacementSingular)),
    pascalPlural: upperFirst(camelCase(replacementPlural)),
    kebab: kebabCase(replacementSingular),
    kebabPlural: kebabCase(replacementPlural),
    snake: snakeCase(replacementSingular),
    snakePlural: snakeCase(replacementPlural),
    screamingSnake: snakeCase(replacementSingular).toUpperCase(),
    screamingSnakePlural: snakeCase(replacementPlural).toUpperCase(),
    screamingKebab: kebabCase(replacementSingular).toUpperCase(),
    screamingKebabPlural: kebabCase(replacementPlural).toUpperCase(),
    dot: replacementSingular.toLowerCase().replace(/ /g, '.'),
    dotPlural: replacementPlural.toLowerCase().replace(/ /g, '.'),
    screamingDot: replacementSingular.toUpperCase().replace(/ /g, '.'),
    screamingDotPlural: replacementPlural.toUpperCase().replace(/ /g, '.'),
  };

  // Create a map of original patterns to their replacements
  const originalPatterns = {
    myThingCamel: 'myThing',
    myThingCamelPlural: 'myThings',
    myThingPascal: 'MyThing',
    myThingPascalPlural: 'MyThings',
    myThingKebab: 'my-thing',
    myThingKebabPlural: 'my-things',
    myThingSnake: 'my_thing',
    myThingSnakePlural: 'my_things',
    myThingScreamingSnake: 'MY_THING',
    myThingScreamingSnakePlural: 'MY_THINGS',
    myThingScreamingKebab: 'MY-THING',
    myThingScreamingKebabPlural: 'MY-THINGS',
    myThingDot: 'my.thing',
    myThingDotPlural: 'my.things',
    myThingScreamingDot: 'MY.THING',
    myThingScreamingDotPlural: 'MY.THINGS',
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
