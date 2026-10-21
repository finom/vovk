import { z } from 'zod';

export const TaskSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1).max(200).describe('What needs doing'),
  done: z.boolean(),
  createdAt: z.iso.datetime(),
});

export type Task = z.infer<typeof TaskSchema>;
