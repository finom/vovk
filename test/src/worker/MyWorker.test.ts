import puppeteer, { type Page } from 'puppeteer';
import { it, expect, describe, beforeAll, afterAll } from '@jest/globals';
import type { MyWorker } from '../../.vovk/client';

describe('Worker', () => {
  let page: Page;
  beforeAll(async () => {
    const browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();
    await page.goto('http://localhost:' + process.env.PORT);
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    page.on('console', async (message) => {
      if (message.text() != 'JSHandle@error') {
        // eslint-disable-next-line no-console
        console.log(`${message.type().substring(0, 3).toUpperCase()} ${message.text()}`);
        return;
      }
      const messages = await Promise.all(
        message.args().map((arg) => {
          return arg.getProperty('message');
        })
      );

      // eslint-disable-next-line no-console
      console.log(`${message.type().substring(0, 3).toUpperCase()} ${messages.filter(Boolean).join(', ')}`);
    });
  });

  afterAll(async () => {
    await page.close();
  });

  it('Should work with metadata', async () => {
    const result = await page.evaluate(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      // eslint-disable-next-line no-undef
      const { MyWorkerPromisified } = window as unknown as { MyWorkerPromisified: typeof MyWorker };
      return MyWorkerPromisified.findLargestPrimeBelow(100000);
    });

    expect(result).toEqual(99991);
  });

  it('Can call other workers', async () => {
    const result = await page.evaluate(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      // eslint-disable-next-line no-undef
      const { MyWorkerPromisified } = window as unknown as { MyWorkerPromisified: typeof MyWorker };
      return MyWorkerPromisified.calculateFibonacci(10);
    });

    expect(result).toEqual(55);
  });

  it('Can use clientized controllers', async () => {
    const result = await page.evaluate(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      // eslint-disable-next-line no-undef
      const { MyWorkerPromisified } = window as unknown as { MyWorkerPromisified: typeof MyWorker };
      return MyWorkerPromisified.getClientizeHelloWorld();
    });

    expect(result).toEqual({ hello: 'world' });
  });

  it('Implements generator', async () => {
    const result = await page.evaluate(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      // eslint-disable-next-line no-undef
      const { MyWorkerPromisified } = window as unknown as { MyWorkerPromisified: typeof MyWorker };
      const numbers: number[] = [];

      for await (const number of MyWorkerPromisified.generator()) {
        numbers.push(number);
      }

      return numbers;
    });

    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('Implements async generator', async () => {
    const result = await page.evaluate(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      // eslint-disable-next-line no-undef
      const { MyWorkerPromisified } = window as unknown as { MyWorkerPromisified: typeof MyWorker };
      const numbers: number[] = [];

      for await (const number of MyWorkerPromisified.asyncGenerator()) {
        numbers.push(number);
      }

      return numbers;
    });

    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('Generator throws an error', async () => {
    const result = await page.evaluate(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      // eslint-disable-next-line no-undef
      const { MyWorkerPromisified } = window as unknown as { MyWorkerPromisified: typeof MyWorker };
      const numbers: number[] = [];

      let error: string | undefined;

      try {
        for await (const number of MyWorkerPromisified.generatorWithError()) {
          numbers.push(number);
        }
      } catch (e) {
        error = (e as Error).message;
      }

      return { numbers, error };
    });

    expect(result.numbers).toEqual([0, 1, 2, 3, 4]);
    expect(result.error).toEqual('Not good');
  });

  it('Async generator throws an error', async () => {
    const result = await page.evaluate(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      // eslint-disable-next-line no-undef
      const { MyWorkerPromisified } = window as unknown as { MyWorkerPromisified: typeof MyWorker };
      const numbers: number[] = [];

      let error: string | undefined;

      try {
        for await (const number of MyWorkerPromisified.asyncGeneratorWithError()) {
          numbers.push(number);
        }
      } catch (e) {
        error = (e as Error).message;
      }

      return { numbers, error };
    });

    expect(result.numbers).toEqual([0, 1, 2, 3, 4]);
    expect(result.error).toEqual('Not good');
  });
});
