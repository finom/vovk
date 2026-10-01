'use server';

import crypto from 'node:crypto';
import { redirect } from 'next/navigation';
import { createSession } from '@/lib/session';

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
  if (password !== process.env.PASSWORD) {
    return { message: 'Invalid credentials.' };
  }

  const userId = crypto.createHash('md5').update(password).digest('hex');

  await createSession(userId);

  redirect('/');
}
