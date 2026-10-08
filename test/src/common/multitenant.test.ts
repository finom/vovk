import assert from 'node:assert';
import { describe, it } from 'node:test';
import { multitenant } from 'vovk';

describe('Multitenant', async () => {
  const testConfig = {
    targetHost: 'example.com',
    overrides: {
      '[customer_name].customer': [
        { from: 'api', to: 'api/customer' },
        { from: '', to: '[customer_name]' },
      ],
      'pro.[customer_name].customer': [
        { from: 'api', to: 'api/customer/pro' },
        { from: '', to: 'pro/[customer_name]' },
      ],
      admin: [
        { from: 'api', to: 'api/admin' },
        { from: '', to: 'admin' },
      ],
    },
  };

  await it('should bypass processing for schema endpoints', async () => {
    const result = multitenant({
      ...testConfig,
      requestUrl: 'https://example.com/api/admin/_schema_',
      requestHost: 'example.com',
    });

    assert.strictEqual(result.action, null);
    assert.strictEqual(result.destination, null);
    assert.match(result.message, /schema endpoint/i);
    assert.strictEqual(result.subdomains, null);
  });

  await it('should redirect when path segment matches a reserved path', async () => {
    const result = multitenant({
      ...testConfig,
      requestUrl: 'https://example.com/admin/dashboard?tab=users',
      requestHost: 'example.com',
    });

    assert.strictEqual(result.action, 'redirect');
    assert.strictEqual(result.destination, 'https://admin.example.com/dashboard?tab=users');
    assert.match(result.message, /redirecting to admin/i);
    assert.strictEqual(result.subdomains, null);
  });

  await it('should match static subdomains correctly', async () => {
    const result = multitenant({
      ...testConfig,
      requestUrl: 'https://admin.example.com/api/users',
      requestHost: 'admin.example.com',
    });

    assert.strictEqual(result.action, 'rewrite');
    assert.strictEqual(result.destination, 'https://admin.example.com/api/admin/users');
    assert.strictEqual(result.subdomains, null);
  });

  await it('should extract wildcard parameters from subdomain', async () => {
    const result = multitenant({
      ...testConfig,
      requestUrl: 'https://acme.customer.example.com/api/orders',
      requestHost: 'acme.customer.example.com',
    });

    assert.strictEqual(result.action, 'rewrite');
    assert.strictEqual(result.destination, 'https://acme.customer.example.com/api/customer/orders');
    assert.deepStrictEqual(result.subdomains, { customer_name: 'acme' });
  });

  await it('should handle multi-level wildcard subdomains', async () => {
    const result = multitenant({
      ...testConfig,
      requestUrl: 'https://pro.acme.customer.example.com/api/stats',
      requestHost: 'pro.acme.customer.example.com',
    });

    assert.strictEqual(result.action, 'rewrite');
    assert.strictEqual(result.destination, 'https://pro.acme.customer.example.com/api/customer/pro/stats');
    assert.deepStrictEqual(result.subdomains, { customer_name: 'acme' });
  });

  await it('should replace path placeholders with values from subdomain', async () => {
    const result = multitenant({
      ...testConfig,
      requestUrl: 'https://acme.customer.example.com/',
      requestHost: 'acme.customer.example.com',
    });

    assert.strictEqual(result.action, 'rewrite');
    assert.strictEqual(result.destination, 'https://acme.customer.example.com/acme');
    assert.deepStrictEqual(result.subdomains, { customer_name: 'acme' });
  });

  await it('should handle root URL rewriting', async () => {
    const result = multitenant({
      ...testConfig,
      requestUrl: 'https://admin.example.com/',
      requestHost: 'admin.example.com',
    });

    assert.strictEqual(result.action, 'rewrite');
    assert.strictEqual(result.destination, 'https://admin.example.com/admin');
    assert.strictEqual(result.subdomains, null);
  });

  await it('should bypass only a _schema_ path segment', async () => {
    const result = multitenant({
      ...testConfig,
      requestUrl: 'https://admin.example.com/secret_schema_',
      requestHost: 'admin.example.com',
    });

    assert.strictEqual(result.action, 'rewrite');
    assert.strictEqual(result.destination, 'https://admin.example.com/admin/secret_schema_');
  });

  await it('should match the host case-insensitively', async () => {
    const result = multitenant({
      ...testConfig,
      requestUrl: 'https://Admin.Example.com/api/users',
      requestHost: 'Admin.Example.com',
    });

    assert.strictEqual(result.action, 'rewrite');
    assert.strictEqual(result.destination, 'https://admin.example.com/api/admin/users');
  });

  await it('should take only a DNS label as a wildcard value', async () => {
    for (const requestHost of ['%2e%2e.customer.example.com', 'a?b#c.customer.example.com']) {
      const result = multitenant({
        ...testConfig,
        requestUrl: 'https://x.customer.example.com/settings',
        requestHost,
      });

      assert.strictEqual(result.action, null, requestHost);
      assert.strictEqual(result.destination, null, requestHost);
    }
  });

  await it('should replace the placeholders of the target path only', async () => {
    const result = multitenant({
      ...testConfig,
      requestUrl: 'https://acme.customer.example.com/api/[customer_name]',
      requestHost: 'acme.customer.example.com',
    });

    assert.strictEqual(result.destination, 'https://acme.customer.example.com/api/customer/[customer_name]');
  });

  await it('should redirect a percent-encoded reserved name', async () => {
    const result = multitenant({
      ...testConfig,
      requestUrl: 'https://example.com/%61dmin/dash%20board',
      requestHost: 'example.com',
    });

    assert.strictEqual(result.action, 'redirect');
    assert.strictEqual(result.destination, 'https://admin.example.com/dash%20board');
  });

  await it('should match a percent-encoded prefix and keep the rest of the path as sent', async () => {
    const encoded = multitenant({
      ...testConfig,
      requestUrl: 'https://admin.example.com/%61pi/us%20ers/',
      requestHost: 'admin.example.com',
    });
    const longer = multitenant({
      ...testConfig,
      requestUrl: 'https://admin.example.com/apix/users',
      requestHost: 'admin.example.com',
    });

    assert.strictEqual(encoded.destination, 'https://admin.example.com/api/admin/us%20ers/');
    assert.strictEqual(longer.destination, 'https://admin.example.com/admin/apix/users');
  });

  await it('should match a host that carries a port when the target host has none', async () => {
    const result = multitenant({
      ...testConfig,
      requestUrl: 'https://admin.example.com/api/users',
      requestHost: 'admin.example.com:443',
    });

    assert.strictEqual(result.action, 'rewrite');
    assert.strictEqual(result.destination, 'https://admin.example.com/api/admin/users');
  });

  await it("should keep the request's port in a redirect when the target host has none", async () => {
    const result = multitenant({
      ...testConfig,
      targetHost: 'localhost',
      requestUrl: 'http://localhost:3000/admin/dashboard',
      requestHost: 'localhost:3000',
    });

    assert.strictEqual(result.action, 'redirect');
    assert.strictEqual(result.destination, 'http://admin.localhost:3000/dashboard');
  });

  await it('should match a target host with a port only on that port', async () => {
    const config = { ...testConfig, targetHost: 'localhost:3000' };
    const onPort = multitenant({
      ...config,
      requestUrl: 'http://admin.localhost:3000/',
      requestHost: 'admin.localhost:3000',
    });
    const otherPort = multitenant({
      ...config,
      requestUrl: 'http://admin.localhost:4000/',
      requestHost: 'admin.localhost:4000',
    });

    assert.strictEqual(onPort.destination, 'http://admin.localhost:3000/admin');
    assert.strictEqual(otherPort.action, null);
  });

  await it('should read every character of the target host and the patterns literally', async () => {
    const config = {
      targetHost: 'a+b.localhost',
      overrides: { 'x+y': [{ from: '', to: 'x' }] },
    };
    const literal = multitenant({
      ...config,
      requestUrl: 'https://x+y.a+b.localhost/',
      requestHost: 'x+y.a+b.localhost',
    });
    const asRegex = multitenant({
      ...config,
      requestUrl: 'https://xxy.aab.localhost/',
      requestHost: 'xxy.aab.localhost',
    });
    const dotAsRegex = multitenant({
      ...config,
      requestUrl: 'https://x+y.a+bxlocalhost/',
      requestHost: 'x+y.a+bxlocalhost',
    });

    assert.strictEqual(literal.action, 'rewrite');
    assert.strictEqual(asRegex.action, null);
    assert.strictEqual(dotAsRegex.action, null);
  });

  await it('should read a pattern of many "[" in linear time', async () => {
    const start = performance.now();
    const result = multitenant({
      targetHost: 'example.com',
      overrides: { ['['.repeat(30_000)]: [{ from: '', to: 'x' }] },
      requestUrl: 'https://example.com/',
      requestHost: 'example.com',
    });

    assert.strictEqual(result.action, null);
    // a quadratic scan takes about 1 s here
    assert.ok(performance.now() - start < 250);
  });

  await it('should return null action when no rules match', async () => {
    const result = multitenant({
      ...testConfig,
      requestUrl: 'https://unknown.example.com/some/path',
      requestHost: 'unknown.example.com',
    });

    assert.strictEqual(result.action, null);
    assert.strictEqual(result.destination, null);
    assert.match(result.message, /no action/i);
    assert.strictEqual(result.subdomains, null);
  });
});
