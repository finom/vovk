import assert from 'node:assert';
import { describe, it } from 'node:test';
import { normalizeOutTemplatePath, toUnderscoredPackageName } from '../../../dist/generate/write-one-client-file.mjs';

await describe('toUnderscoredPackageName', async () => {
  await it('Turns an npm name into a Python and Cargo package name', () => {
    assert.strictEqual(toUnderscoredPackageName('web-app'), 'web_app');
    assert.strictEqual(toUnderscoredPackageName('@acme/web-app'), 'acme_web_app');
    assert.strictEqual(toUnderscoredPackageName('socket.io-client'), 'socket_io_client');
    assert.strictEqual(toUnderscoredPackageName('vovk_hello_world'), 'vovk_hello_world');
  });

  await it('Keeps a name that starts with a digit or is a keyword valid in Python and Rust', () => {
    assert.strictEqual(toUnderscoredPackageName('3d-viewer'), 'pkg_3d_viewer');
    assert.strictEqual(toUnderscoredPackageName('@3d/viewer'), 'pkg_3d_viewer');
    assert.strictEqual(toUnderscoredPackageName('class'), 'class_pkg');
    assert.strictEqual(toUnderscoredPackageName('import'), 'import_pkg');
    assert.strictEqual(toUnderscoredPackageName('fn'), 'fn_pkg');
    assert.strictEqual(toUnderscoredPackageName('crate'), 'crate_pkg');
    assert.strictEqual(toUnderscoredPackageName('classes'), 'classes');
  });

  await it('Falls back when package.json has no name', () => {
    assert.strictEqual(toUnderscoredPackageName(undefined), 'my_package_name');
    assert.strictEqual(toUnderscoredPackageName(''), 'my_package_name');
  });

  await it('Names the Python import directory the same way', () => {
    assert.strictEqual(
      normalizeOutTemplatePath('dist_python/src/[package_name]/__init__.py', { name: '@acme/web-app' }),
      'dist_python/src/acme_web_app/__init__.py'
    );
    assert.strictEqual(
      normalizeOutTemplatePath('dist_python/src/[package_name]/__init__.py', {}),
      'dist_python/src/my_package_name/__init__.py'
    );
  });
});
