'use client';
import { AlertCircle } from 'lucide-react';
import { useActionState } from 'react';
import { login } from '@/app/actions/auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Log In</CardTitle>
          <CardDescription>
            Please enter the password to access the demo. You can request one by
            emailing me your story at{' '}
            <a
              className="text-blue-600 hover:text-blue-800 underline underline-offset-4"
              href="mailto:andrii@gubanov.eu"
            >
              andrii@gubanov.eu
            </a>
            .
          </CardDescription>
        </CardHeader>
        <form action={action}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter the password"
                required
              />
            </div>
            {state?.message && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full mt-4" disabled={pending}>
              {pending ? 'Checking...' : 'Log In'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
