import { ok, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import { createCodeSamples } from 'vovk/internal';

const samplesFor = (pkg: { name: string; py_name?: string; rs_name?: string }) =>
  createCodeSamples({
    handlerName: 'getUser',
    handlerSchema: { httpMethod: 'GET', path: '{id}', validation: {} },
    controllerSchema: { rpcModuleName: 'UserRPC', prefix: 'users', handlers: {} },
    package: pkg,
    config: {},
  });

const firstLine = (code: string) => code.split('\n')[0];

describe('The package names the Python and Rust code samples import', () => {
  it('Imports a py_name Python can import as it is', () => {
    strictEqual(firstLine(samplesFor({ name: 'app', py_name: 'acme_py' }).py), 'from acme_py import UserRPC');
    // a Rust keyword is a name Python can import
    strictEqual(firstLine(samplesFor({ name: 'app', py_name: 'match' }).py), 'from match import UserRPC');
  });

  it('Imports a py_name Python cannot import by the name the generated folder has', () => {
    for (const [py_name, importName] of [
      ['acme-client', 'acme_client'],
      ['acme.client', 'acme_client'],
      ['@acme/client', 'acme_client'],
      ['3d-client', 'pkg_3d_client'],
      ['class', 'class_pkg'],
    ]) {
      strictEqual(firstLine(samplesFor({ name: 'app', py_name }).py), `from ${importName} import UserRPC`, py_name);
    }
  });

  it('Imports a crate with a dash in its rs_name by its library name', () => {
    const { rs } = samplesFor({ name: 'app', rs_name: 'acme-client' });
    strictEqual(firstLine(rs), 'use acme_client::user_rpc;');
    ok(!rs.includes('acme-client'), rs);
    strictEqual(firstLine(samplesFor({ name: 'app', rs_name: 'acme_rs' }).rs), 'use acme_rs::user_rpc;');
  });

  it('Falls back to the npm name made valid for both languages', () => {
    const { py, rs } = samplesFor({ name: '@acme/web-app' });
    strictEqual(firstLine(py), 'from acme_web_app import UserRPC');
    strictEqual(firstLine(rs), 'use acme_web_app::user_rpc;');
  });
});
