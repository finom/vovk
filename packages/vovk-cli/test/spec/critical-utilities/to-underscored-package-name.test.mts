import assert from 'node:assert';
import { describe, it } from 'node:test';
import { createCodeSamples, toUnderscoredPackageName } from 'vovk/internal';
import { normalizeOutTemplatePath } from '../../../dist/generate/write-one-client-file.mjs';
import { toPythonPackageName } from '../../../dist/utils/python-package-name.mjs';

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

  await it('Keeps a py_name Python can import and makes any other valid', () => {
    // Rust keywords and non-ASCII letters are valid in a Python name
    for (const name of ['acme_py', 'match', 'type', 'café', '_private']) {
      assert.strictEqual(toPythonPackageName(name), name);
    }
    assert.strictEqual(toPythonPackageName('acme-client'), 'acme_client');
    assert.strictEqual(toPythonPackageName('acme.client'), 'acme_client');
    assert.strictEqual(toPythonPackageName('@acme/client'), 'acme_client');
    assert.strictEqual(toPythonPackageName('3d-client'), 'pkg_3d_client');
    assert.strictEqual(toPythonPackageName('class'), 'class_pkg');
    assert.strictEqual(
      normalizeOutTemplatePath('dist_python/src/[package_name]/', { name: 'app', py_name: 'acme-client' }, 'py_name'),
      'dist_python/src/acme_client/'
    );
    // Cargo takes a dash
    assert.strictEqual(
      normalizeOutTemplatePath('dist_rust/[package_name]/', { name: 'app', rs_name: 'acme-client' }, 'rs_name'),
      'dist_rust/acme-client/'
    );
  });

  await it('Names the Python package as the README samples of vovk import it', () => {
    for (const py_name of ['acme_py', 'match', 'café', 'acme-client', 'acme.client', '@acme/client', '3d', 'class']) {
      const { py } = createCodeSamples({
        handlerName: 'getUser',
        handlerSchema: { httpMethod: 'GET', path: '{id}', validation: {} },
        controllerSchema: { rpcModuleName: 'UserRPC', handlers: {} },
        package: { name: 'app', py_name },
        config: {},
      });
      assert.strictEqual(py.split('\n')[0], `from ${toPythonPackageName(py_name)} import UserRPC`, py_name);
    }
  });
});
