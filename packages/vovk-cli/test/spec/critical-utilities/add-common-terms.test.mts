import assert from 'node:assert';
import fs from 'node:fs/promises';
import path from 'node:path';
import { describe, it } from 'node:test';
import pluralize from 'pluralize';
import { addCommonTerms } from '../../../dist/new/add-common-terms.mjs';
import { render } from '../../../dist/new/render.mjs';

addCommonTerms();

await describe('addCommonTerms', async () => {
  await it('Leaves words that merely end with a term to the default rules', () => {
    const expected = {
      inbox: 'inboxes',
      mailbox: 'mailboxes',
      sandbox: 'sandboxes',
      checkbox: 'checkboxes',
      box: 'boxes',
      fox: 'foxes',
      foodie: 'foodies',
      cookie: 'cookies',
      human: 'humans',
      premium: 'premiums',
      userInbox: 'userInboxes',
      UserInbox: 'UserInboxes',
      INBOX: 'INBOXES',
      user_inbox: 'user_inboxes',
    };

    for (const [singular, plural] of Object.entries(expected)) {
      assert.strictEqual(pluralize(singular), plural, singular);
    }
  });

  await it('Applies the terms to whole words in any case', () => {
    const expected = {
      index: 'indexes',
      Index: 'Indexes',
      INDEX: 'INDEXES',
      person: 'people',
      child: 'children',
      ox: 'oxen',
      die: 'dice',
      medium: 'media',
      woman: 'women',
      entry: 'entries',
    };

    for (const [singular, plural] of Object.entries(expected)) {
      assert.strictEqual(pluralize(singular), plural, singular);
    }
  });

  await it('Renders the controller prefix of "vovk new c inbox" in plural', async () => {
    const templateFileName = path.join(import.meta.dirname, '../../../module-templates/type/controller.ts.ejs');
    const { code } = await render(await fs.readFile(templateFileName, 'utf-8'), {
      cwd: process.cwd(),
      config: { modulesDir: 'src/modules', rootSegmentModulesDirName: '' } as unknown as Parameters<
        typeof render
      >[1]['config'],
      withService: false,
      segmentName: '',
      moduleName: 'inbox',
      templateFileName,
      isNodeNextResolution: false,
      srcRoot: 'src',
    });

    assert.match(code, /@prefix\('inboxes'\)/);
    assert.match(code, /static getInboxes = /);
  });
});
