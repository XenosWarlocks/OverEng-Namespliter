import { z } from 'zod';
import { insertSplitHistorySchema, splitHistory } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  split: {
    process: {
      method: 'POST' as const,
      path: '/api/process',
      input: z.object({
        names: z.string(),
      }),
      responses: {
        200: z.object({
          original: z.string(),
          results: z.array(z.object({
            original: z.string(),
            firstName: z.string(),
            lastName: z.string()
          }))
        }),
        400: errorSchemas.validation,
      },
    },
    history: {
      method: 'GET' as const,
      path: '/api/history',
      responses: {
        200: z.array(z.custom<typeof splitHistory.$inferSelect>()),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type ProcessRequest = z.infer<typeof api.split.process.input>;
export type ProcessResponse = z.infer<typeof api.split.process.responses[200]>;
