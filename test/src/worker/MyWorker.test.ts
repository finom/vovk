import puppeteer, { type Page } from 'puppeteer';
import { it, expect, describe, beforeAll, afterAll } from '@jest/globals';
import type { _WorkerPromiseInstance as WorkerPromiseInstance } from '../../../src/worker/types';
import type MyWorker from './MyWorker';

// const worker = promisifyWorker(MyWorker);
describe('Worker', () => {
  let page: Page;
  beforeAll(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    page = await browser.newPage();
    await page.goto('http://localhost:' + process.env.PORT);
    page.on('console', (consoleObj) => console.log(consoleObj.text()));
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
});
