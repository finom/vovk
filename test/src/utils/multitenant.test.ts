import { it, describe } from 'node:test';
import { multitenant } from 'vovk';
import assert from 'node:assert';

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
      requestUrl: 'https://example.com/api/something_schema_',
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
