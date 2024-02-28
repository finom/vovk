import puppeteer, { type Page } from 'puppeteer';
import { it, expect, describe, beforeAll, afterAll } from '@jest/globals';
import type { _WorkerPromiseInstance as WorkerPromiseInstance } from '../../../src/worker/types';
import type MyWorker from './MyWorker';

// const worker = promisifyWorker(MyWorker);
describe('Worker API', () => {
  let page: Page;
  beforeAll(async () => {
    const browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();
    await page.goto('http://localhost:' + process.env.PORT);
    // eslint-disable-next-line no-console, @typescript-eslint/no-misused-promises
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
      const { metadataWorker } = window as unknown as { metadataWorker: WorkerPromiseInstance<typeof MyWorker> };
      return metadataWorker.findLargestPrimeBelow(100000);
    });

    expect(result).toEqual(99991);
  });

  it('Should work as standalone', async () => {
    const result = await page.evaluate(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      // eslint-disable-next-line no-undef
      const { standaloneWorker } = window as unknown as { standaloneWorker: WorkerPromiseInstance<typeof MyWorker> };
      return standaloneWorker.findLargestPrimeBelow(100000);
    });

    expect(result).toEqual(99991);
  });

  it('Can call other workers', async () => {
    const result = await page.evaluate(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      // eslint-disable-next-line no-undef
      const { metadataWorker } = window as unknown as { metadataWorker: WorkerPromiseInstance<typeof MyWorker> };
      return metadataWorker.calculateFibonacci(10);
    });

    expect(result).toEqual(55);
  });

  it('Can use clientized controllers', async () => {
    const result = await page.evaluate(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      // eslint-disable-next-line no-undef
      const { metadataWorker } = window as unknown as { metadataWorker: WorkerPromiseInstance<typeof MyWorker> };
      return metadataWorker.getHetClientizeHelloWorld();
    });

    expect(result).toEqual({ hello: 'world' });
  });

  it('Implements generator', async () => {
    const result = await page.evaluate(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      // eslint-disable-next-line no-undef
      const { metadataWorker } = window as unknown as { metadataWorker: WorkerPromiseInstance<typeof MyWorker> };
      const numbers: number[] = [];

      for await (const number of metadataWorker.generator()) {
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
      const { metadataWorker } = window as unknown as { metadataWorker: WorkerPromiseInstance<typeof MyWorker> };
      const numbers: number[] = [];

      for await (const number of metadataWorker.asyncGenerator()) {
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
      const { metadataWorker } = window as unknown as { metadataWorker: WorkerPromiseInstance<typeof MyWorker> };
      const numbers: number[] = [];

      let error: string | undefined;

      try {
        for await (const number of metadataWorker.generatorWithError()) {
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
      const { metadataWorker } = window as unknown as { metadataWorker: WorkerPromiseInstance<typeof MyWorker> };
      const numbers: number[] = [];

      let error: string | undefined;

      try {
        for await (const number of metadataWorker.asyncGeneratorWithError()) {
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

  it('Terminates', async () => {
    const result = await page.evaluate(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      // eslint-disable-next-line no-undef
      const { isTerminated } = window as unknown as {
        isTerminated: boolean;
      };

      return { isTerminated };
    });

    expect(result.isTerminated).toEqual(true);
  });
});
