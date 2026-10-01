'use client';
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  MouseSensor,
  rectIntersection,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { TaskStatus } from '@prisma/client';
import type { TaskType } from '@schemas/models/Task.schema';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { pick } from 'lodash';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useId, useMemo, useState } from 'react';
import { TaskRPC } from '@/client';
import { useShallow } from 'zustand/shallow';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRegistry } from '@/hooks/use-registry';
import TaskDialog from './task-dialog';

// Utils function
function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

export type Status = {
  id: string;
  name: string;
  color: string;
};

export type User = {
  id: string;
  name: string;
  image?: string;
};

export type KanbanBoardProps = {
  id: Status['id'];
  children: ReactNode;
  className?: string;
};

export const KanbanBoard = ({ id, children, className }: KanbanBoardProps) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      className={cn(
        'flex h-full min-h-40 flex-1 flex-col gap-2 rounded-md border bg-secondary p-2 text-xs shadow-sm outline transition-all',
        isOver ? 'outline-primary' : 'outline-transparent',
        className,
      )}
      ref={setNodeRef}
    >
      {children}
    </div>
  );
};

export type KanbanCardProps = {
  index: number;
  parent: string;
  task: TaskType;
  className?: string;
};

export const KanbanCard = ({
  index,
  parent,
  task,
  className,
  disableAnimation,
}: KanbanCardProps & { disableAnimation?: boolean }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: { index, parent },
    });
  const assignee = useRegistry(
    useShallow((state) =>
      pick(state.user[task.userId], ['email', 'fullName', 'imageUrl']),
    ),
  );
  return (
    <motion.div
      layout
      {...(!disableAnimation
        ? {
            initial: { opacity: 0, y: 50, scale: 0.8 },
            animate: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, y: -50, scale: 0.8 },
            transition: { duration: 0.3 },
          }
        : {
            // disable enter/exit animation during drag move
            initial: false,
            animate: { opacity: 1, scale: 1, y: 0 },
            exit: { opacity: 0 }, // minimal exit when really removed (e.g. delete)
            transition: { duration: 0 },
          })}
      className={cn(isDragging && 'z-50')}
    >
      <Card
        className={cn(
          'rounded-md p-3 shadow-sm',
          isDragging && 'cursor-grabbing',
          className,
        )}
        style={{
          transform: transform
            ? `translateX(${transform.x}px) translateY(${transform.y}px)`
            : 'none',
        }}
        ref={setNodeRef}
      >
        <div {...listeners} {...attributes} className="cursor-grab">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="m-0 font-medium text-sm">{task.title}</p>
                {task.description && (
                  <p className="m-0 text-xs text-muted-foreground mt-1">
                    {task.description}
                  </p>
                )}
              </div>
              <Avatar className="h-6 w-6 shrink-0">
                {assignee?.imageUrl && (
                  <AvatarImage
                    src={assignee.imageUrl}
                    alt={assignee.fullName}
                  />
                )}
                <AvatarFallback className="text-xs">
                  {assignee?.fullName?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Assigned to {assignee?.fullName}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:text-destructive cursor-pointer"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    TaskRPC.deleteTask({
                      params: { id: task.id },
                    }).catch((error) => {
                      console.error('Error deleting task:', error);
                    });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <TaskDialog taskId={task.id}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 cursor-pointer"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TaskDialog>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export type KanbanCardsProps = {
  children: ReactNode;
  className?: string;
};

export const KanbanCards = ({ children, className }: KanbanCardsProps) => (
  <div className={cn('flex flex-1 flex-col gap-2', className)}>
    <AnimatePresence>{children}</AnimatePresence>
  </div>
);

export const KanbanHeader = ({ status }: { status: TaskStatus }) => {
  const statusConfig = {
    [TaskStatus.TODO]: { name: 'To Do', color: '#6B7280' },
    [TaskStatus.IN_PROGRESS]: {
      name: 'In Progress',
      color: '#F59E0B',
    },
    [TaskStatus.IN_REVIEW]: { name: 'Review', color: '#8B5CF6' },
    [TaskStatus.DONE]: { name: 'Done', color: '#10B981' },
  };

  return (
    <div className={cn('flex shrink-0 items-center gap-2')}>
      <div
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: statusConfig[status].color }}
      />
      <p className="m-0 font-semibold text-sm">{statusConfig[status].name}</p>
    </div>
  );
};

export type KanbanProviderProps = {
  children: ReactNode;
  onDragEnd: (event: DragEndEvent) => void;
  onDragStart?: (event: DragStartEvent) => void;
  className?: string;
};

export const KanbanProvider = ({
  children,
  onDragEnd,
  onDragStart,
  className,
}: KanbanProviderProps) => {
  const id = useId();

  // Configure sensors with activation constraints
  const mouseSensor = useSensor(MouseSensor, {
    // Require the mouse to move by 2 pixels before activating drag
    activationConstraint: {
      distance: 2,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    // Require touch to be held for 200ms before activating drag
    activationConstraint: {
      delay: 200,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      id={id}
    >
      <div className={cn('flex w-full gap-4', className)}>{children}</div>
    </DndContext>
  );
};

const UserKanban = () => {
  const tasks = useRegistry(useShallow((state) => Object.values(state.task)));

  useQuery({
    queryKey: TaskRPC.getTasks.queryKey(),
    queryFn: () => TaskRPC.getTasks(),
  });

  const statuses = useMemo(() => Object.values(TaskStatus), []);

  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [optimisticStatus, setOptimisticStatus] = useState<
    Record<string, TaskStatus>
  >({});

  const handleDragStart = (event: DragStartEvent) => {
    setDraggingTaskId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setDraggingTaskId(null);
      return;
    }
    const targetStatus = statuses.find((s) => s === over.id);
    if (!targetStatus) {
      setDraggingTaskId(null);
      return;
    }
    const taskId = active.id as TaskType['id'];
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === targetStatus) {
      // no status change
      setDraggingTaskId(null);
      return;
    }

    const previousStatus = task.status;

    // Optimistic move
    setOptimisticStatus((prev) => ({ ...prev, [taskId]: targetStatus }));

    TaskRPC.updateTask({
      body: { status: targetStatus },
      params: { id: taskId },
    })
      .then(() => {
        // remove override after success (registry will sync real status)
        setOptimisticStatus((prev) => {
          const copy = { ...prev };
          delete copy[taskId];
          return copy;
        });
      })
      .catch((error) => {
        console.error('Error updating task:', error);
        // revert optimistic change
        setOptimisticStatus((prev) => ({ ...prev, [taskId]: previousStatus }));
        // cleanup revert after short delay to let registry resync
        setTimeout(() => {
          setOptimisticStatus((prev) => {
            if (prev[taskId] === previousStatus) {
              const copy = { ...prev };
              delete copy[taskId];
              return copy;
            }
            return prev;
          });
        }, 300);
      })
      .finally(() => {
        setDraggingTaskId(null);
      });
  };

  // Re-distribute tasks considering optimistic status overrides
  const distributed = useMemo(() => {
    const bucket = statuses.reduce(
      (acc, status) => {
        acc[status] = [];
        return acc;
      },
      {} as Record<string, TaskType[]>,
    );
    tasks.forEach((task) => {
      const effectiveStatus = optimisticStatus[task.id] ?? task.status;
      bucket[effectiveStatus]?.push(task);
    });
    return bucket;
  }, [tasks, optimisticStatus, statuses]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className={cn('w-full space-y-6')}>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Task Board</h2>
          <div className="flex gap-2 mb-4">
            <TaskDialog taskId={null}>
              <Button className="flex items-center gap-1">
                <Plus className="h-4 w-4" /> Add Task
              </Button>
            </TaskDialog>
          </div>
          <KanbanProvider
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {statuses.map((status) => (
              <KanbanBoard key={status} id={status}>
                <KanbanHeader status={status} />
                <KanbanCards>
                  {distributed[status]?.map((task, index) => (
                    <KanbanCard
                      key={task.id}
                      task={task}
                      parent={status}
                      index={index}
                      disableAnimation={
                        draggingTaskId === task.id
                      } /* disable animations only for actively dragged task */
                    />
                  ))}
                </KanbanCards>
              </KanbanBoard>
            ))}
          </KanbanProvider>
        </div>
      </div>
    </div>
  );
};

export default UserKanban;
