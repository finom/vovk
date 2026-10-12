'use server';

import crypto from 'node:crypto';
import { redirect } from 'next/navigation';
import { createSession, SESSION_USER_ID } from '@/lib/session';

export async function login(
  _state: { message?: string } | undefined,
  formData: FormData,
) {
  'use server';
  const password = formData.get('password');

  if (!process.env.PASSWORD) {
    return { message: 'PASSWORD environment variable is not set.' };
  }

  // 2. Prepare data
  // timingSafeEqual takes buffers of one length, scrypt gives both the same
  const salt = crypto.randomBytes(16);
  if (
    typeof password !== 'string' ||
    !crypto.timingSafeEqual(
      crypto.scryptSync(password, salt, 32),
      crypto.scryptSync(process.env.PASSWORD, salt, 32),
    )
  ) {
    return { message: 'Invalid credentials.' };
  }

  await createSession(SESSION_USER_ID);

  redirect('/');
}
