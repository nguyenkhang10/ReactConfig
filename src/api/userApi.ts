import apiClient from './ConfigAxios';

export type UserRole = 'ADMIN' | 'MANAGER' | 'MEMBER';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

/**
 * User model tương ứng với UserResponse DTO từ Spring Boot Backend:
 * {
 *   id,
 *   username,
 *   email,
 *   fullName,
 *   createdAt,
 *   updatedAt,
 *   role,
 *   status,
 *   deletedAt
 * }
 */
export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  createdAt?: string;
  updatedAt?: string;
  role: UserRole;
  status: UserStatus;
  deletedAt?: string | null;
}

/**
 * DTO tạo User mới gửi lên Spring Boot (POST /api/users)
 */
export interface CreateUserRequest {
  username: string;
  email: string;
  fullName?: string;
  password: string;
  role: UserRole;
  status: UserStatus;
}

/**
 * DTO cập nhật User gửi lên Spring Boot (PUT /api/users/{id})
 * Backend UserUpdateRequest chỉ cho phép username, email, fullName, password
 */
export interface UpdateUserRequest {
  username: string;
  email: string;
  fullName?: string;
  password?: string;
}

/**
 * Filter tìm kiếm người dùng
 */
export interface UserSearchFilters {
  keyword?: string;
  role?: string;
}

/**
 * Helper unwrap data an toàn từ Axios response
 */
const unwrapData = <T>(res: any): T => {
  return res && res.data !== undefined && res.status !== undefined ? res.data : res;
};

/**
 * GET /api/users
 * Lấy toàn bộ danh sách người dùng
 */
export const getUsers = async (): Promise<User[]> => {
  const res = await apiClient.get('/api/users');
  const data = unwrapData<any>(res);
  return Array.isArray(data) ? data : data?.data || [];
};

/**
 * GET /api/users/{id}
 * Lấy thông tin chi tiết một người dùng theo id
 */
export const getUserById = async (id: number | string): Promise<User> => {
  const res = await apiClient.get(`/api/users/${id}`);
  return unwrapData<User>(res);
};

/**
 * POST /api/users
 * Tạo người dùng mới
 */
export const createUser = async (user: CreateUserRequest): Promise<User> => {
  const res = await apiClient.post('/api/users', user);
  return unwrapData<User>(res);
};

/**
 * PUT /api/users/{id}
 * Cập nhật thông tin người dùng
 */
export const updateUser = async (
  id: number | string,
  user: UpdateUserRequest
): Promise<User> => {
  const res = await apiClient.put(`/api/users/${id}`, user);
  return unwrapData<User>(res);
};

/**
 * PATCH /api/users/{id}
 * Cập nhật một phần thông tin người dùng
 */
export const patchUser = async (
  id: number | string,
  user: Partial<UpdateUserRequest>
): Promise<User> => {
  const res = await apiClient.patch(`/api/users/${id}`, user);
  return unwrapData<User>(res);
};

/**
 * DELETE /api/users/{id}
 * Xóa người dùng theo id
 */
export const deleteUser = async (id: number | string): Promise<void> => {
  await apiClient.delete(`/api/users/${id}`);
};

/**
 * GET /api/users?keyword=...&role=...
 * Lọc và tìm kiếm người dùng (không sử dụng projectId)
 */
export const searchUsers = async (filters: UserSearchFilters): Promise<User[]> => {
  const params: Record<string, string> = {};

  if (filters.keyword && filters.keyword.trim()) {
    params.keyword = filters.keyword.trim();
  }
  if (filters.role && filters.role.trim()) {
    params.role = filters.role.trim();
  }

  const res = await apiClient.get('/api/users', { params });
  const data = unwrapData<any>(res);
  return Array.isArray(data) ? data : data?.data || [];
};

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  patchUser,
  deleteUser,
  searchUsers,
};
