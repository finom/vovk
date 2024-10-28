/* eslint-disable no-console */
import puppeteer, { type Page } from 'puppeteer';
import { it, expect, describe, beforeAll, afterAll } from '@jest/globals';
import type { MyWorkerWPC } from '../../.vovk-client/client';

describe('Worker', () => {
  let page: Page;
  beforeAll(async () => {
    const browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();
    await page.goto('http://localhost:' + process.env.PORT);

    page.on('console', async (message) => {
      if (message.text() != 'JSHandle@error') {
        console.log(`${message.type().substring(0, 3).toUpperCase()} ${message.text()}`);
        return;
      }
      const messages = await Promise.all(
        message.args().map((arg) => {
          return arg.getProperty('message');
        })
      );

      console.log(`${message.type().substring(0, 3).toUpperCase()} ${messages.filter(Boolean).join(', ')}`);
    });
  });

  afterAll(async () => {
    await page.close();
  });

  it('Should work with schema', async () => {
    const result = await page.evaluate(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const { MyWorkerWPC: MyWorkerWPCFromWindow } = window as unknown as { MyWorkerWPC: typeof MyWorkerWPC };
      return MyWorkerWPCFromWindow.findLargestPrimeBelow(100000);
    });

    expect(result).toEqual(99991);
  });

  it('Can call other workers', async () => {
    const result = await page.evaluate(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const { MyWorkerWPC: MyWorkerWPCFromWindow } = window as unknown as { MyWorkerWPC: typeof MyWorkerWPC };
      return MyWorkerWPCFromWindow.calculateFibonacci(10);
    });

    expect(result).toEqual(55);
  });

  it('Can use clientized controllers', async () => {
    const result = await page.evaluate(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const { MyWorkerWPC: MyWorkerWPCFromWindow } = window as unknown as { MyWorkerWPC: typeof MyWorkerWPC };
      return MyWorkerWPCFromWindow.getClientizeHelloWorld();
    });

    expect(result).toEqual({ hello: 'world' });
  });

  it('Implements generator', async () => {
    const result = await page.evaluate(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const { MyWorkerWPC: MyWorkerWPCFromWindow } = window as unknown as { MyWorkerWPC: typeof MyWorkerWPC };
      const numbers: number[] = [];

      for await (const number of MyWorkerWPCFromWindow.generator()) {
        numbers.push(number);
      }

      return numbers;
    });

    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('Implements async generator', async () => {
    const result = await page.evaluate(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const { MyWorkerWPC: MyWorkerWPCFromWindow } = window as unknown as { MyWorkerWPC: typeof MyWorkerWPC };
      const numbers: number[] = [];

      for await (const number of MyWorkerWPCFromWindow.asyncGenerator()) {
        numbers.push(number);
      }

      return numbers;
    });

    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('Generator throws an error', async () => {
    const result = await page.evaluate(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const { MyWorkerWPC: MyWorkerWPCFromWindow } = window as unknown as { MyWorkerWPC: typeof MyWorkerWPC };
      const numbers: number[] = [];

      let error: string | undefined;

      try {
        for await (const number of MyWorkerWPCFromWindow.generatorWithError()) {
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

      const { MyWorkerWPC: MyWorkerWPCFromWindow } = window as unknown as { MyWorkerWPC: typeof MyWorkerWPC };
      const numbers: number[] = [];

      let error: string | undefined;

      try {
        for await (const number of MyWorkerWPCFromWindow.asyncGeneratorWithError()) {
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
