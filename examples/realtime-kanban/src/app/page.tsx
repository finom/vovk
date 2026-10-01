import type { TaskType } from '@schemas/models/Task.schema';
import type { UserType } from '@schemas/models/User.schema';
import AppHeader from '@/components/app-header';
import { ExpandableChatDemo } from '@/components/expandable-chat-demo';
import UserKanban from '@/components/user-kanban';
import UserList from '@/components/user-list';
import { RegistryProvider } from '@/hooks/use-registry';
import { verifySession } from '@/lib/dal';
import TaskController from '@/modules/task/task-controller';
import UserController from '@/modules/user/user-controller';

export const runtime = 'nodejs';

export const revalidate = 0;

export default async function Home() {
  await verifySession();
  const [users, tasks] = await Promise.all([
    UserController.getUsers.fn<UserType[]>(),
    TaskController.getTasks.fn<TaskType[]>(),
  ]);

  return (
    <RegistryProvider initialData={{ users, tasks }}>
      <AppHeader />
      <UserList />
      <UserKanban />
      <ExpandableChatDemo />
    </RegistryProvider>
  );
}
