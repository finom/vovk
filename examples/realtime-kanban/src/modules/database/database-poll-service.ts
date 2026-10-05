import { forEach, groupBy } from 'lodash';
import type { JSONLinesResponder, VovkIteration } from 'vovk';
import DatabaseEventsService, {
  type DBChange,
} from './database-events-service';
import type DatabasePollController from './database-poll-controller';
import DatabaseService from './database-service';

export default class PollService {
  static poll(
    responder: JSONLinesResponder<
      VovkIteration<typeof DatabasePollController.poll>
    >,
  ) {
    let asOldAs = new Date();
    // 10 minutes ago; TODO: use latest update date from registry
    asOldAs.setMinutes(asOldAs.getMinutes() - 10);

    const onChanges = (changes: DBChange[]) => {
      // the client left before the timeout
      if (responder.isClosed) {
        DatabaseEventsService.emitter.off(
          DatabaseEventsService.DB_KEY,
          onChanges,
        );
        return;
      }
      const deleted = changes.filter((change) => change.type === 'delete');
      const createdOrUpdated = changes.filter(
        (change) => change.type === 'create' || change.type === 'update',
      );

      for (const deletedEntity of deleted) {
        void responder.send({
          id: deletedEntity.id,
          entityType: deletedEntity.entityType,
          __isDeleted: true,
        });
      }
      // group by entityType and date, so the date is maximum date for the given entity: { entityType: string, date: string }[]
      forEach(groupBy(createdOrUpdated, 'entityType'), (changes) => {
        const maxDateItem = changes.reduce(
          (max, change) => {
            const changeDate = new Date(change.date);
            return changeDate.getTime() > new Date(max.date).getTime()
              ? change
              : max;
          },
          { date: new Date(0) } as unknown as DBChange,
        );

        if (new Date(maxDateItem.date).getTime() > asOldAs.getTime()) {
          void DatabaseService.prisma[maxDateItem.entityType as 'user']
            .findMany({
              where: {
                updatedAt: {
                  gt: asOldAs,
                },
              },
            })
            .then((entities) => {
              for (const entity of entities) {
                void responder.send(entity);
              }
            });
          asOldAs = new Date(maxDateItem.date);
        }
      });
    };

    DatabaseEventsService.emitter.on(DatabaseEventsService.DB_KEY, onChanges);

    setTimeout(() => {
      DatabaseEventsService.emitter.off(
        DatabaseEventsService.DB_KEY,
        onChanges,
      );
      responder.close();
    }, 30_000);
  }
}
