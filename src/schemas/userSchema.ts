import { z } from 'zod';

export const USER_ROLES = ['ADMIN', 'MANAGER', 'MEMBER'] as const;
export const USER_STATUSES = ['ACTIVE', 'INACTIVE'] as const;

export const createUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, 'Tên tài khoản (username) là bắt buộc.')
    .min(3, 'Tên tài khoản phải có ít nhất 3 ký tự.')
    .max(60, 'Tên tài khoản không được vượt quá 60 ký tự.'),
  email: z
    .string()
    .trim()
    .min(1, 'Email là bắt buộc.')
    .email('Định dạng email không hợp lệ.'),
  fullName: z
    .string()
    .max(120, 'Họ và tên không được vượt quá 120 ký tự.'),
  password: z
    .string()
    .min(1, 'Mật khẩu là bắt buộc.')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự.'),
  role: z.enum(USER_ROLES),
  status: z.enum(USER_STATUSES),
});

export const updateUserSchema = z.object({
  username: createUserSchema.shape.username,
  email: createUserSchema.shape.email,
  fullName: createUserSchema.shape.fullName,
  password: z
    .string()
    .refine((val) => val === '' || val.length >= 6, {
      message: 'Mật khẩu mới nếu thay đổi phải có ít nhất 6 ký tự.',
    }),
});

export type CreateUserForm = z.infer<typeof createUserSchema>;
export type UpdateUserForm = z.infer<typeof updateUserSchema>;