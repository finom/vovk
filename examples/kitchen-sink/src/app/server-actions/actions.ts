'use server';

import FormZodController from '@/modules/form/form-zod-controller.js';

export async function submitFormAction(_prevState: unknown, formData: FormData) {
  try {
    return {
      data: await FormZodController.submitForm.fn({
        body: formData,
        params: { id: '5a279068-35d6-4d67-94e0-c21ef4052eea' },
      }),
    };
  } catch (e) {
    return { error: String(e) };
  }
}
