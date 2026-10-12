import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { decrypt, SESSION_USER_ID } from './session';

const getSession = async () => {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);

  return session;
};

export const isLoggedIn = async () => {
  if (!process.env.PASSWORD) return true;
  const session = await getSession();
  return session?.userId === SESSION_USER_ID;
};

export const verifySession = cache(async () => {
  if (!(await isLoggedIn())) {
    redirect('/login');
  }
});
