import { z } from 'zod';

export interface PaginationParams {
  page: number;
  size: number;
}

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(
  itemSchema: T
) =>
  z.object({
    page: z.number().min(1),
    size: z.number().min(0),
    total_results: z.number().min(0),
    total_pages: z.number().min(0),
    results: z.array(itemSchema),
  });

export type PaginatedResponse<T> = z.infer<
  ReturnType<typeof PaginatedResponseSchema>
> & {
  results: T[];
};
