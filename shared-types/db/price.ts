import { z } from 'zod';

export const DBPriceUpdateSchema = z.object({
  id: z.number(),
  product_id: z.number(),
  old_price: z.number(),
  new_price: z.number(),
  updated_at: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
});

export type DBPriceUpdate = z.infer<typeof DBPriceUpdateSchema>;
