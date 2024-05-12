// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { VovkDefaultFetcherOptions, clientizeController } from '../../../src/client';
import { promisifyWorker, worker } from '../../../src/worker';
import metadata from '../vovk-metadata.json' assert { type: 'json' };
import type MyInnerWorker from './MyInnerWorker';
import type ClientController from '../client/ClientController';

@worker()
export default class MyWorker {
  static workerName = 'MyWorker';

  private static defaultController = clientizeController<typeof ClientController, VovkDefaultFetcherOptions>(
    metadata.ClientController,
    {
      defaultOptions: { prefix: '/api' },
    }
  );

  static getHetClientizeHelloWorld(prefix?: string) {
    return this.defaultController.getHelloWorldHeaders({
      prefix,
      headers: { 'x-test': 'world' },
    });
  }

  static calculateFibonacci(n: number): Promise<number> {
    const innerWorker = promisifyWorker<typeof MyInnerWorker>(
      new Worker(new URL('./MyInnerWorker.ts', import.meta.url)),
      metadata.workers.MyInnerWorker
    );

    return innerWorker.calculateFibonacci(n);
  }

  static findLargestPrimeBelow(max: number): number {
    function isPrime(number: number): boolean {
      for (let i = 2; i * i <= number; i++) {
        if (number % i === 0) {
          return false;
        }
      }
      return number > 1;
    }

    for (let i = max; i >= 2; i--) {
      if (isPrime(i)) {
        return i;
      }
    }

    return -1;
  }

  static async *asyncGenerator() {
    for (let i = 0; i < 10; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      yield i;
    }
  }

  static async *asyncGeneratorWithError() {
    for (let i = 0; i < 10; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (i === 5) {
        throw new Error('Not good');
      }
      yield i;
    }
  }

  static *generator() {
    for (let i = 0; i < 10; i++) {
      yield i;
    }
  }

  static *generatorWithError() {
    for (let i = 0; i < 10; i++) {
      if (i === 5) {
        throw new Error('Not good');
      }
      yield i;
    }
  }
}
