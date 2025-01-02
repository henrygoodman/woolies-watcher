import { z } from 'zod';

export const DBProductSchema = z.object({
  id: z.number().optional(),
  barcode: z.string().nullable(),
  product_name: z.string(),
  product_brand: z.string().nullable(),
  watch_count: z.number().optional(),
  product_size: z.string().nullable(),
  url: z.string(),
  image_url: z.string().optional().nullable(),
  current_price: z.number(),
  last_updated: z.preprocess(
    (value) => (typeof value === 'string' ? new Date(value) : value),
    z.date()
  ) as z.ZodType<Date, z.ZodTypeDef, Date>,
});

export type DBProduct = z.infer<typeof DBProductSchema>;
