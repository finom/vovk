'use client';
import Link from 'next/link';
import useDatabasePolling from '@/hooks/use-database-polling';
import { Label } from './ui/label';
import { Switch } from './ui/switch';

const AppHeader = () => {
  const [isPollingEnabled, setIsPollingEnabled, pollingHasError] =
    useDatabasePolling(false);

  return (
    <header className="space-y-4 w-full bg-background/50 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-2 min-h-16 flex items-center gap-12">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-foreground">
            🪣&nbsp;&nbsp;Realtime Kanban
          </h1>
          <div className="flex items-center justify-between">
            <Link
              href="https://vovk.dev"
              className="opacity-60 hover:underline text-xs"
            >
              by Vovk.ts
            </Link>
            <Link
              href="/openapi"
              className="opacity-60 hover:underline text-xs"
            >
              OpenAPI Spec
              <svg
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
                viewBox="0 0 24 24"
                height="1.1em"
                className="inline"
              >
                <title>OpenAPI Spec</title>
                <path d="M7 17L17 7"></path>
                <path d="M7 7h10v10"></path>
              </svg>
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="poll-mode"
            checked={isPollingEnabled}
            onCheckedChange={setIsPollingEnabled}
          />
          <Label
            htmlFor="poll-mode"
            className={pollingHasError ? 'text-red-500' : ''}
          >
            Database Polling
          </Label>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
