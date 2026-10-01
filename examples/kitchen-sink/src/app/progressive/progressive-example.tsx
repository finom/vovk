'use client';
import { useState } from 'react';
import { progressive, type VovkIteration } from 'vovk';
import { ProgressiveRPC } from '@/client';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function ProgressiveExample() {
  type Iteration = VovkIteration<typeof ProgressiveRPC.streamProgressiveResponse>;
  const [users, setUsers] = useState<Extract<Iteration, { users: unknown }>['users'] | null>(null);
  const [tasks, setTasks] = useState<Extract<Iteration, { tasks: unknown }>['tasks'] | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean | null>(null);

  const load = () => {
    setUsers(null);
    setTasks(null);
    const { users: usersPromise, tasks: tasksPromise } = progressive(ProgressiveRPC.streamProgressiveResponse);
    setIsLoaded(false);
    Promise.all([usersPromise.then(setUsers), tasksPromise.then(setTasks)]).finally(() => setIsLoaded(true));
  };

  return (
    <>
      <button type="button" onClick={load} disabled={isLoaded === false}>
        Load Users and Tasks Progressively {isLoaded ? 'Again' : ''}
      </button>
      {isLoaded !== null && <h2>Users</h2>}
      {isLoaded !== null && !users && <ListSkeleton />}
      {!!users?.length &&
        users?.map((user) => (
          <ul key={user.id}>
            <li>{user.name}</li>
          </ul>
        ))}

      {isLoaded !== null && <h2>Tasks</h2>}
      {isLoaded !== null && !tasks && <ListSkeleton />}
      {!!tasks?.length &&
        tasks?.map((task) => (
          <ul key={task.id}>
            <li>
              {task.title} {task.completed ? '✅' : ''}
            </li>
          </ul>
        ))}
    </>
  );
}

const ListSkeleton = () => (
  <ul>
    {Array(5)
      .fill(0)
      .map((_, index) => (
        <li key={index}>
          <Skeleton width={150} />
        </li>
      ))}
  </ul>
);
