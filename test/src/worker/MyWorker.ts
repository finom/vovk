import { worker } from '../../../src/worker';

@worker()
export default class MyWorker {
  static workerName = 'MyWorker';

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
}
