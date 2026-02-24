import { z } from 'zod';

export const rfpSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
  budget_max: z.number().min(1000, 'Budget must be at least $1,000').optional(),
  deadline: z.date().optional(),
});
