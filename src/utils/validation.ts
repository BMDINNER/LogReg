import { z } from 'zod';

export const validateWithZod = (
  schema: z.ZodType,
  data: any
): { isValid: boolean; errors: Record<string, string> } => {
  const result = schema.safeParse(data);

  if (result.success) {
    return { isValid: true, errors: {} };
  }

  const errors: Record<string, string> = {};

  const rawIssues: any[] =
    (result.error as any).issues ??
    (result.error as any).errors ??
    [];

  rawIssues.forEach((issue: any) => {
    const path = issue.path?.[0] as string | undefined;
    if (path && !errors[path]) {
      errors[path] = issue.message;
    }
  });

  return { isValid: false, errors };
};