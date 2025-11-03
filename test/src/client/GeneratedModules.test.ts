import { it, describe } from 'node:test';
import { deepStrictEqual, ok, strictEqual } from 'node:assert';
import {
  NoValidationControllerOnlyEntityRPC,
  NoValidationControllerAndServiceEntityRPC,
  ZodControllerOnlyEntityRPC,
  ZodControllerAndServiceEntityRPC,
  YupControllerOnlyEntityRPC,
  YupControllerAndServiceEntityRPC,
  DtoControllerOnlyEntityRPC,
  DtoControllerAndServiceEntityRPC,
  ValibotControllerOnlyEntityRPC,
  ValibotControllerAndServiceEntityRPC,
  ArktypeControllerOnlyEntityRPC,
  ArktypeControllerAndServiceEntityRPC,
} from 'vovk-client';

const rpcs = {
  NoValidationControllerOnlyEntityRPC: {
    get: NoValidationControllerOnlyEntityRPC.getNoValidationControllerOnlyEntities,
    getSingle: NoValidationControllerOnlyEntityRPC.getSingleNoValidationControllerOnlyEntity,
    create: NoValidationControllerOnlyEntityRPC.createNoValidationControllerOnlyEntity,
    update: NoValidationControllerOnlyEntityRPC.updateNoValidationControllerOnlyEntity,
    delete: NoValidationControllerOnlyEntityRPC.deleteNoValidationControllerOnlyEntity,
  },
  NoValidationControllerAndServiceEntityRPC: {
    get: NoValidationControllerAndServiceEntityRPC.getNoValidationControllerAndServiceEntities,
    getSingle: NoValidationControllerAndServiceEntityRPC.getSingleNoValidationControllerAndServiceEntity,
    create: NoValidationControllerAndServiceEntityRPC.createNoValidationControllerAndServiceEntity,
    update: NoValidationControllerAndServiceEntityRPC.updateNoValidationControllerAndServiceEntity,
    delete: NoValidationControllerAndServiceEntityRPC.deleteNoValidationControllerAndServiceEntity,
  },
  ZodControllerOnlyEntityRPC: {
    get: ZodControllerOnlyEntityRPC.getZodControllerOnlyEntities,
    getSingle: ZodControllerOnlyEntityRPC.getSingleZodControllerOnlyEntity,
    create: ZodControllerOnlyEntityRPC.createZodControllerOnlyEntity,
    update: ZodControllerOnlyEntityRPC.updateZodControllerOnlyEntity,
    delete: ZodControllerOnlyEntityRPC.deleteZodControllerOnlyEntity,
  },
  ZodControllerAndServiceEntityRPC: {
    get: ZodControllerAndServiceEntityRPC.getZodControllerAndServiceEntities,
    getSingle: ZodControllerAndServiceEntityRPC.getSingleZodControllerAndServiceEntity,
    create: ZodControllerAndServiceEntityRPC.createZodControllerAndServiceEntity,
    update: ZodControllerAndServiceEntityRPC.updateZodControllerAndServiceEntity,
    delete: ZodControllerAndServiceEntityRPC.deleteZodControllerAndServiceEntity,
  },
  YupControllerOnlyEntityRPC: {
    get: YupControllerOnlyEntityRPC.getYupControllerOnlyEntities,
    getSingle: YupControllerOnlyEntityRPC.getSingleYupControllerOnlyEntity,
    create: YupControllerOnlyEntityRPC.createYupControllerOnlyEntity,
    update: YupControllerOnlyEntityRPC.updateYupControllerOnlyEntity,
    delete: YupControllerOnlyEntityRPC.deleteYupControllerOnlyEntity,
  },
  YupControllerAndServiceEntityRPC: {
    get: YupControllerAndServiceEntityRPC.getYupControllerAndServiceEntities,
    getSingle: YupControllerAndServiceEntityRPC.getSingleYupControllerAndServiceEntity,
    create: YupControllerAndServiceEntityRPC.createYupControllerAndServiceEntity,
    update: YupControllerAndServiceEntityRPC.updateYupControllerAndServiceEntity,
    delete: YupControllerAndServiceEntityRPC.deleteYupControllerAndServiceEntity,
  },

  DtoControllerOnlyEntityRPC: {
    get: DtoControllerOnlyEntityRPC.getDtoControllerOnlyEntities,
    getSingle: DtoControllerOnlyEntityRPC.getSingleDtoControllerOnlyEntity,
    create: DtoControllerOnlyEntityRPC.createDtoControllerOnlyEntity,
    update: DtoControllerOnlyEntityRPC.updateDtoControllerOnlyEntity,
    delete: DtoControllerOnlyEntityRPC.deleteDtoControllerOnlyEntity,
  },
  DtoControllerAndServiceEntityRPC: {
    get: DtoControllerAndServiceEntityRPC.getDtoControllerAndServiceEntities,
    getSingle: DtoControllerAndServiceEntityRPC.getSingleDtoControllerAndServiceEntity,
    create: DtoControllerAndServiceEntityRPC.createDtoControllerAndServiceEntity,
    update: DtoControllerAndServiceEntityRPC.updateDtoControllerAndServiceEntity,
    delete: DtoControllerAndServiceEntityRPC.deleteDtoControllerAndServiceEntity,
  },
  ValibotControllerOnlyEntityRPC: {
    get: ValibotControllerOnlyEntityRPC.getValibotControllerOnlyEntities,
    getSingle: ValibotControllerOnlyEntityRPC.getSingleValibotControllerOnlyEntity,
    create: ValibotControllerOnlyEntityRPC.createValibotControllerOnlyEntity,
    update: ValibotControllerOnlyEntityRPC.updateValibotControllerOnlyEntity,
    delete: ValibotControllerOnlyEntityRPC.deleteValibotControllerOnlyEntity,
  },
  ValibotControllerAndServiceEntityRPC: {
    get: ValibotControllerAndServiceEntityRPC.getValibotControllerAndServiceEntities,
    getSingle: ValibotControllerAndServiceEntityRPC.getSingleValibotControllerAndServiceEntity,
    create: ValibotControllerAndServiceEntityRPC.createValibotControllerAndServiceEntity,
    update: ValibotControllerAndServiceEntityRPC.updateValibotControllerAndServiceEntity,
    delete: ValibotControllerAndServiceEntityRPC.deleteValibotControllerAndServiceEntity,
  },
  ArktypeControllerOnlyEntityRPC: {
    get: ArktypeControllerOnlyEntityRPC.getArktypeControllerOnlyEntities,
    getSingle: ArktypeControllerOnlyEntityRPC.getSingleArktypeControllerOnlyEntity,
    create: ArktypeControllerOnlyEntityRPC.createArktypeControllerOnlyEntity,
    update: ArktypeControllerOnlyEntityRPC.updateArktypeControllerOnlyEntity,
    delete: ArktypeControllerOnlyEntityRPC.deleteArktypeControllerOnlyEntity,
  },
  ArktypeControllerAndServiceEntityRPC: {
    get: ArktypeControllerAndServiceEntityRPC.getArktypeControllerAndServiceEntities,
    getSingle: ArktypeControllerAndServiceEntityRPC.getSingleArktypeControllerAndServiceEntity,
    create: ArktypeControllerAndServiceEntityRPC.createArktypeControllerAndServiceEntity,
    update: ArktypeControllerAndServiceEntityRPC.updateArktypeControllerAndServiceEntity,
    delete: ArktypeControllerAndServiceEntityRPC.deleteArktypeControllerAndServiceEntity,
  },
};

describe('Modules generated via CLI', () => {
  for (const [name, rpc] of Object.entries(rpcs)) {
    describe(name, () => {
      it('Should get', async () => {
        const res = await rpc.get();
        ok(res.message.startsWith('TODO: get'));
      });
      it('Should get single', async () => {
        const res = await rpc.getSingle({
          params: { id: '123' },
        });
        ok(res.message.startsWith('TODO: get single'));
        strictEqual(res.id, '123');
      });
      it('Should create', async () => {
        const res = await rpc.create({
          body: { todo: true },
        });
        ok(res.message.startsWith('TODO: create'));
        deepStrictEqual(res.body, { todo: true });
      });
      it('Should update', async () => {
        const res = await rpc.update({
          params: { id: '123' },
          body: { todo: true },
        });
        ok(res.message.startsWith('TODO: update'));
        strictEqual(res.id, '123');
        deepStrictEqual(res.body, { todo: true });
      });
      it('Should delete', async () => {
        const res = await rpc.delete({
          params: { id: '123' },
        });
        ok(res.message.startsWith('TODO: delete'));
        strictEqual(res.id, '123');
      });
    });
  }
});
