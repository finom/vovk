import type { JSONLinesResponder, VovkIteration } from 'vovk';
import type ProgressiveController from './progressive-controller.ts';

export default class ProgressiveService {
  static async getUsers() {
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 10_000));
    return [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' },
      { id: 3, name: 'Alice Johnson' },
      { id: 4, name: 'Bob Brown' },
      { id: 5, name: 'Charlie White' },
    ];
  }

  static async getTasks() {
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 10_000));
    return [
      { id: 1, title: 'Task One', completed: false },
      { id: 2, title: 'Task Two', completed: true },
      { id: 3, title: 'Task Three', completed: false },
      { id: 4, title: 'Task Four', completed: true },
      { id: 5, title: 'Task Five', completed: false },
    ];
  }

  static streamProgressiveResponse(
    responder: JSONLinesResponder<VovkIteration<typeof ProgressiveController.streamProgressiveResponse>>
  ) {
    return Promise.all([
      ProgressiveService.getUsers().then((users) => responder.send({ users })),
      ProgressiveService.getTasks().then((tasks) => responder.send({ tasks })),
    ])
      .then(responder.close)
      .catch(responder.throw);
  }
}
