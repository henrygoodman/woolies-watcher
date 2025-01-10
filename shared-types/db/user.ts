import { z } from 'zod';

export const DBUserSchema = z.object({
  id: z.number().optional(),
  name: z.string().nullable(),
  email: z.string().email(),
  destination_email: z.string().nullable(),
  enable_emails: z.boolean(),
  theme_dark: z.boolean(),
});

export const PartialDBUserSchema = DBUserSchema.partial();

export type DBUser = z.infer<typeof DBUserSchema>;
