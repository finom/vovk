import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { decrypt } from './session';

const getSession = async () => {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);

  return session;
};

export const isLoggedIn = async () => {
  if (!process.env.PASSWORD) return true;
  const session = await getSession();
  const userId = crypto
    .createHash('md5')
    .update(process.env.PASSWORD)
    .digest('hex');
  return session?.userId === userId;
};

export const verifySession = cache(async () => {
  if (!(await isLoggedIn())) {
    redirect('/login');
  }
});
