import { z } from 'zod';

export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'COMPLETED'] as const;
export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;

export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Tiêu đề nhiệm vụ là bắt buộc.')
    .max(200, 'Tiêu đề không được vượt quá 200 ký tự.'),
  description: z.string(),
  status: z.enum(TASK_STATUSES),
  priority: z.enum(TASK_PRIORITIES),
  handlerId: z.string(),
  creatorId: z.string(),
});

// Khi tạo mới: nếu không có projectId trên URL thì người dùng nhập tay;
// dùng createTaskSchema mở rộng từ taskSchema với projectId bắt buộc.
export const createTaskSchema = taskSchema.extend({
  projectId: z
    .string()
    .min(1, 'Mã dự án là bắt buộc.')
    .regex(/^\d+$/, 'Mã dự án phải là số.'),
});

export type TaskForm = z.infer<typeof taskSchema>;
export type CreateTaskForm = z.infer<typeof createTaskSchema>;