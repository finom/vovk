import { describe, test } from 'node:test';
import assert from 'node:assert';
import replaceOccurrences from '../src/generate/replaceOccurrences.mjs';

const testCode = `
class MyThing {
  myThingKebab = 'my-thing-kebab';
  myThingScreamingKebab = 'MY-THING-SCREAMING-KEBAB';
  myThingSnake = 'my_thing_snake';
  myThingScreamingSnake = 'MY_THING_SCREAMING_SNAKE';
  myThingCamel = 'myThingCamel';
  myThingPascal = 'MyThingPascal';

  myThingKebabPlural = 'my-things-kebab';
  myThingScreamingKebabPlural = 'MY-THINGS-SCREAMING-KEBAB';
  myThingSnakePlural = 'my_things_snake';
  myThingScreamingSnakePlural = 'MY_THINGS_SCREAMING_SNAKE';
  myThingCamelPlural = 'myThingsCamel';
  myThingPascalPlural = 'MyThingsPascal';
}`;
void describe('replaceOccurrences', async () => {
  await test('with "userList"', () => {
    const expected = `
class UserList {
  userListKebab = 'user-list-kebab';
  userListScreamingKebab = 'USER-LIST-SCREAMING-KEBAB';
  userListSnake = 'user_list_snake';
  userListScreamingSnake = 'USER_LIST_SCREAMING_SNAKE';
  userListCamel = 'userListCamel';
  userListPascal = 'UserListPascal';

  userListKebabPlural = 'user-lists-kebab';
  userListScreamingKebabPlural = 'USER-LISTS-SCREAMING-KEBAB';
  userListSnakePlural = 'user_lists_snake';
  userListScreamingSnakePlural = 'USER_LISTS_SCREAMING_SNAKE';
  userListCamelPlural = 'userListsCamel';
  userListPascalPlural = 'UserListsPascal';
}`;

    assert.strictEqual(replaceOccurrences(testCode, 'userList'), expected);
  });

  await test('with "entity"', () => {
    const expected = `
class Entity {
  entityKebab = 'entity-kebab';
  entityScreamingKebab = 'ENTITY-SCREAMING-KEBAB';
  entitySnake = 'entity_snake';
  entityScreamingSnake = 'ENTITY_SCREAMING_SNAKE';
  entityCamel = 'entityCamel';
  entityPascal = 'EntityPascal';

  entityKebabPlural = 'entities-kebab';
  entityScreamingKebabPlural = 'ENTITIES-SCREAMING-KEBAB';
  entitySnakePlural = 'entities_snake';
  entityScreamingSnakePlural = 'ENTITIES_SCREAMING_SNAKE';
  entityCamelPlural = 'entitiesCamel';
  entityPascalPlural = 'EntitiesPascal';
}`;

    assert.strictEqual(replaceOccurrences(testCode, 'entity'), expected);
  });

  await test('with "myRegex"', () => {
    const expected = `
class MyRegex {
  myRegexKebab = 'my-regex-kebab';
  myRegexScreamingKebab = 'MY-REGEX-SCREAMING-KEBAB';
  myRegexSnake = 'my_regex_snake';
  myRegexScreamingSnake = 'MY_REGEX_SCREAMING_SNAKE';
  myRegexCamel = 'myRegexCamel';
  myRegexPascal = 'MyRegexPascal';

  myRegexKebabPlural = 'my-regexes-kebab';
  myRegexScreamingKebabPlural = 'MY-REGEXES-SCREAMING-KEBAB';
  myRegexSnakePlural = 'my_regexes_snake';
  myRegexScreamingSnakePlural = 'MY_REGEXES_SCREAMING_SNAKE';
  myRegexCamelPlural = 'myRegexesCamel';
  myRegexPascalPlural = 'MyRegexesPascal';
}`;

    assert.strictEqual(replaceOccurrences(testCode, 'myRegex'), expected);
  });

  await test('should return empty string when code is empty', () => {
    const code = '';
    const expected = '';
    assert.strictEqual(replaceOccurrences(code, 'userList'), expected);
  });

  await test('should return the same code when there is no "MyThing" occurrence', () => {
    const code = `
class OtherClass {
  someProperty = 'some_value';
}`;
    const expected = `
class OtherClass {
  someProperty = 'some_value';
}`;

    assert.strictEqual(replaceOccurrences(code, 'userList'), expected);
  });
});
