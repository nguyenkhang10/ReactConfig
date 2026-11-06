import { z } from 'zod';

export const PROJECT_STATUSES = ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'] as const;

export const projectSchema = z
  .object({
    name: z.string().trim().min(1, 'Project name is required.').max(120, 'Name cannot exceed 120 characters.'),
    description: z.string(),
    status: z.enum(PROJECT_STATUSES),
    owner: z.string().min(1, 'Please choose a project owner.'),
    startDate: z.string(),
    dueDate: z.string(),
  })
  .refine((d) => !d.startDate || !d.dueDate || d.dueDate >= d.startDate, {
    message: 'Deadline cannot be before the start date.',
    path: ['dueDate'],
  });

export type ProjectForm = z.infer<typeof projectSchema>;