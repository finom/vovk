import { ErrorMessage } from '@hookform/error-message';
import { TaskStatus } from '@prisma/client';
import type { TaskType } from '@schemas/models/Task.schema';
import { pick } from 'lodash';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { TaskRPC } from '@/client';
import { useShallow } from 'zustand/shallow';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRegistry } from '@/hooks/use-registry';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Textarea } from './ui/textarea';

interface Props {
  taskId: TaskType['id'] | null;
  children: React.ReactNode;
}

const TaskDialog = ({ taskId, children }: Props) => {
  const task = useRegistry(
    useShallow((state) =>
      taskId
        ? pick(state.task[taskId], ['title', 'description', 'status', 'userId'])
        : null,
    ),
  );
  const users = useRegistry(useShallow((state) => Object.values(state.user)));
  const {
    control,
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: task ?? {},
  });
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    reset(task ?? {});
  }, [task, reset]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        asChild
        onMouseDown={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        {children}
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        container={typeof document !== 'undefined' ? document?.body : undefined}
      >
        <form
          onSubmit={handleSubmit(
            async (body) => {
              setIsLoading(true);

              try {
                if (taskId) {
                  await TaskRPC.updateTask({ body, params: { id: taskId } });
                } else {
                  await TaskRPC.createTask({ body });
                }
                setOpen(false); // Close dialog on success
              } catch (error) {
                console.error(error);
              }

              setIsLoading(false);
            },
            (e) => {
              console.error('Form submission error:', e);
              setIsLoading(false);
            },
          )}
        >
          <DialogHeader>
            <DialogTitle>{task ? 'Edit' : 'Create'} Task</DialogTitle>
            <DialogDescription hidden>
              Make changes to the profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 mt-4">
            <div className="grid gap-3">
              <Label htmlFor="title-1">Title</Label>
              <Input
                id="title-1"
                defaultValue={task?.title}
                onPointerDown={(e) => e.stopPropagation()}
                {...register('title')}
              />
              <ErrorMessage errors={errors} name="title" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description-1">Description</Label>
              <Textarea
                id="description-1"
                defaultValue={task?.description}
                onPointerDown={(e) => e.stopPropagation()}
                {...register('description')}
              />
              <ErrorMessage errors={errors} name="description" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="status-1">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ''}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent {...register('status')}>
                      <SelectGroup>
                        <SelectLabel>Statuses</SelectLabel>
                        <SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
                        <SelectItem value={TaskStatus.IN_PROGRESS}>
                          In Progress
                        </SelectItem>
                        <SelectItem value={TaskStatus.IN_REVIEW}>
                          In Review
                        </SelectItem>
                        <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <ErrorMessage errors={errors} name="status" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="assignee-1">Assignee</Label>
              <Controller
                name="userId"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ''}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Users</SelectLabel>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.fullName} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <ErrorMessage errors={errors} name="userId" />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline" onPointerDown={() => setOpen(false)}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className={cn(
                isLoading && 'overflow-hidden',
                'flex items-center relative',
              )}
            >
              {isLoading && <Loader2 className="absolute z-10 animate-spin" />}
              <span className={cn(isLoading && 'opacity-0')}>Save changes</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default TaskDialog;
