import { worker } from '../../../src/worker';

@worker()
export default class MyInnerWorker {
  static workerName = 'MyInnerWorker';
  static calculateFibonacci(n: number): number {
    if (n <= 1) {
      return n;
    }
    return this.calculateFibonacci(n - 1) + this.calculateFibonacci(n - 2);
  }
}
