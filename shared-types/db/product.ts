import { z } from 'zod';

export const DBProductSchema = z.object({
  id: z.number().optional(),
  barcode: z.string().nullable(),
  product_name: z.string(),
  product_brand: z.string(),
  current_price: z.preprocess(
    (value) => (typeof value === 'string' ? parseFloat(value) : value),
    z.number()
  ),
  product_size: z.string(),
  url: z.string(),
  image_url: z.string().nullable(),
  last_updated: z.preprocess((value) => {
    if (typeof value === 'string') {
      return new Date(value);
    }
    return value;
  }, z.date()),
});

export type DBProduct = z.infer<typeof DBProductSchema>;
