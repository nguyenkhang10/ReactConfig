import apiClient from './ConfigAxios';

// Base API URL configuration
export const TASK_API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : 'http://localhost:8080/api';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

/**
 * Task model tương ứng với TaskResponse DTO từ Spring Boot Backend
 */
export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: number;
  creatorId?: number | null;
  handlerId?: number | null;
  assignee?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * TaskRequest DTO gửi lên Spring Boot Backend
 */
export interface TaskRequestInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: number | string;
  creatorId?: number | string | null;
  handlerId?: number | string | null;
  assignee?: string;
  dueDate?: string;
}

export interface TaskSearchFilters {
  keyword?: string;
  status?: string;
  priority?: string;
  projectId?: number | string;
  creatorId?: number | string;
  handlerId?: number | string;
  assignee?: string;
  assigner?: string;
}

/**
 * Helper unwrap response an toàn
 */
const unwrapData = <T>(res: any): T => {
  return res && res.data !== undefined && res.status !== undefined ? res.data : res;
};

/**
 * Parse giá trị sang number (Long) hoặc undefined để tránh lỗi kiểu dữ liệu với Spring Boot
 */
const parseToLong = (val: any): number | undefined => {
  if (val === undefined || val === null || val === '') return undefined;
  const num = Number(val);
  return isNaN(num) ? undefined : num;
};

/**
 * Chuẩn hóa request payload phù hợp với Spring Boot TaskRequest DTO
 */
const prepareTaskPayload = (task: TaskRequestInput, defaultProjectId?: number | string) => {
  const pId = parseToLong(task.projectId ?? defaultProjectId);
  const cId = parseToLong(task.creatorId);
  const hId = parseToLong(task.handlerId ?? task.assignee);

  return {
    title: task.title,
    description: task.description ?? '',
    status: task.status ?? 'TODO',
    priority: task.priority ?? 'MEDIUM',
    ...(pId !== undefined ? { projectId: pId } : {}),
    ...(cId !== undefined ? { creatorId: cId } : {}),
    ...(hId !== undefined ? { handlerId: hId } : {}),
  };
};

/**
 * GET /api/tasks
 * Lấy toàn bộ danh sách task
 */
export const getTasks = async (): Promise<Task[]> => {
  const res = await apiClient.get('/api/tasks');
  const data = unwrapData<any>(res);
  return Array.isArray(data) ? data : data?.data || [];
};

/**
 * GET /api/tasks/{id}
 * Lấy chi tiết một task theo id (Long). Trả về 404 nếu không tìm thấy.
 */
export const getTaskById = async (id: number | string): Promise<Task> => {
  const res = await apiClient.get(`/api/tasks/${id}`);
  return unwrapData<Task>(res);
};

/**
 * GET /api/projects/{projectId}/tasks
 * Lấy danh sách task của một dự án
 */
export const getTasksByProject = async (projectId: number | string): Promise<Task[]> => {
  const res = await apiClient.get(`/api/projects/${projectId}/tasks`);
  const data = unwrapData<any>(res);
  return Array.isArray(data) ? data : data?.data || [];
};

/**
 * POST /api/projects/{projectId}/tasks
 * Tạo task mới gắn liền với project theo path variable
 */
export const createTask = async (
  projectId: number | string,
  task: TaskRequestInput
): Promise<Task> => {
  const payload = prepareTaskPayload(task, projectId);
  const res = await apiClient.post(`/api/projects/${projectId}/tasks`, payload);
  return unwrapData<Task>(res);
};

/**
 * POST /api/tasks
 * Tạo task mới trực tiếp với projectId được chỉ định trong body
 */
export const createTaskDirect = async (task: TaskRequestInput): Promise<Task> => {
  const payload = prepareTaskPayload(task);
  const res = await apiClient.post('/api/tasks', payload);
  return unwrapData<Task>(res);
};

/**
 * PUT /api/tasks/{id}
 * Cập nhật task theo id bằng PUT
 */
export const updateTask = async (
  id: number | string,
  task: TaskRequestInput
): Promise<Task> => {
  const payload = prepareTaskPayload(task);
  const res = await apiClient.put(`/api/tasks/${id}`, payload);
  return unwrapData<Task>(res);
};

/**
 * PATCH /api/tasks/{id}
 * Cập nhật một phần task theo id bằng PATCH
 */
export const patchTask = async (
  id: number | string,
  task: Partial<TaskRequestInput>
): Promise<Task> => {
  const res = await apiClient.patch(`/api/tasks/${id}`, task);
  return unwrapData<Task>(res);
};

/**
 * DELETE /api/tasks/{id}
 * Xóa task theo id (Trả về 204 No Content)
 */
export const deleteTask = async (id: number | string): Promise<void> => {
  await apiClient.delete(`/api/tasks/${id}`);
};

/**
 * GET /api/tasks?keyword=...&status=...&priority=...&projectId=...&creatorId=...&handlerId=...
 * Lọc và tìm kiếm task
 */
export const searchTasks = async (filters: TaskSearchFilters): Promise<Task[]> => {
  const params: Record<string, any> = {};

  if (filters.keyword && filters.keyword.trim()) {
    params.keyword = filters.keyword.trim();
  }
  if (filters.status) {
    params.status = filters.status;
  }
  if (filters.priority) {
    params.priority = filters.priority;
  }
  if (filters.projectId !== undefined && filters.projectId !== '') {
    params.projectId = filters.projectId;
  }
  if (filters.creatorId !== undefined && filters.creatorId !== '') {
    params.creatorId = filters.creatorId;
  }
  if (filters.handlerId !== undefined && filters.handlerId !== '') {
    params.handlerId = filters.handlerId;
  }
  if (filters.assignee && filters.assignee.trim()) {
    params.assignee = filters.assignee.trim();
  }
  if (filters.assigner && filters.assigner.trim()) {
    params.assigner = filters.assigner.trim();
  }

  const res = await apiClient.get('/api/tasks', { params });
  const data = unwrapData<any>(res);
  return Array.isArray(data) ? data : data?.data || [];
};

export default {
  getTasks,
  getTaskById,
  getTasksByProject,
  createTask,
  createTaskDirect,
  updateTask,
  patchTask,
  deleteTask,
  searchTasks,
};
