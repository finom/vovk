'use client';
import { useQuery } from '@tanstack/react-query';
import { Pencil, Plus } from 'lucide-react';
import { UserRPC } from '@/client';
import { useShallow } from 'zustand/shallow';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRegistry } from '@/hooks/use-registry';
import UserDialog from './user-dialog';
import { Button } from './ui/button';

const UserList = () => {
  const users = useRegistry(useShallow((state) => Object.values(state.user)));

  useQuery({
    queryKey: UserRPC.getUsers.queryKey(),
    queryFn: () => UserRPC.getUsers(),
  });

  return (
    <div className="space-y-4 p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-12">
        <h2 className="text-lg font-semibold text-foreground flex gap-4 items-center">
          Users
          <UserDialog userId={null}>
            <Button variant="outline">
              <Plus className="h-4 w-4" />
              Add a Team Member
            </Button>
          </UserDialog>
        </h2>
      </div>
      <div className="flex flex-wrap gap-4">
        {users.map((user) => (
          <div key={user.id} className="flex items-center gap-2">
            <UserDialog userId={user.id}>
              <div className="h-8 w-8 relative cursor-pointer">
                <div className="w-full h-full absolute z-10 inset-0 bg-violet-500 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Pencil className="h-4 w-4 text-white" />
                </div>
                <Avatar className="h-8 w-8">
                  {user.imageUrl && (
                    <AvatarImage src={user.imageUrl} alt={user.fullName} />
                  )}
                  <AvatarFallback className="text-xs">
                    {user.fullName?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </UserDialog>

            <span className="text-sm font-medium text-foreground flex flex-col">
              {user.fullName}{' '}
              <span className="text-xs text-muted-foreground">
                {user.email}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;
