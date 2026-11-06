import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTaskById, updateTask } from '../api/taskApi';
import type { TaskRequestInput } from '../api/taskApi';
import { getUsers } from '../api/userApi';
import '../projects/updateProject.css';
import './tasks.css';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema, type TaskForm } from '../schemas/taskSchema';

function UpdateTask() {
  const { projectId, taskId: routeTaskId } = useParams<{ projectId?: string; taskId?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [manualIdInput, setManualIdInput] = useState<string>(routeTaskId || '');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // READ: load task data
  const { data: taskData, isLoading, error: queryError } = useQuery({
    queryKey: ['task', routeTaskId],
    queryFn: () => getTaskById(routeTaskId!),
    enabled: !!routeTaskId,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const currentProjectId = taskData?.projectId ? String(taskData.projectId) : projectId || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
    values: taskData && {
      title: taskData.title ?? '',
      description: taskData.description ?? '',
      status: taskData.status ?? 'TODO',
      priority: taskData.priority ?? 'MEDIUM',
      handlerId: taskData.handlerId != null ? String(taskData.handlerId) : '',
      creatorId: taskData.creatorId != null ? String(taskData.creatorId) : '',
    },
  });

  // READ: load users for dropdown
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  // WRITE: update task
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TaskRequestInput }) =>
      updateTask(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.id] });
      setSuccessMessage('Cập nhật nhiệm vụ thành công!');
      setTimeout(() => {
        if (currentProjectId) {
          navigate(`/projects/${currentProjectId}/tasks`);
        } else {
          navigate('/projects');
        }
      }, 1000);
    },
  });

  const taskId = routeTaskId || '';

  const handleManualLoad = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = manualIdInput.trim();
    if (cleanId) {
      if (projectId) {
        navigate(`/projects/${projectId}/tasks/edit/${cleanId}`);
      } else {
        navigate(`/tasks/edit/${cleanId}`);
      }
    }
  };

  const onSubmit = (data: TaskForm) => {
    if (!taskId) return;
    updateMutation.mutate({
      id: taskId,
      data: {
        ...data,
        projectId: currentProjectId || undefined,
        creatorId: data.creatorId || undefined,
        handlerId: data.handlerId || undefined,
      },
    });
  };

  // Derive error message
  let errorMessage: string | null = null;
  if (updateMutation.isError) {
    errorMessage =
      (updateMutation.error as any)?.response?.data?.message ||
      'Có lỗi xảy ra khi cập nhật nhiệm vụ. Vui lòng thử lại.';
  } else if (queryError) {
    errorMessage =
      (queryError as any)?.response?.status === 404
        ? `Không tìm thấy nhiệm vụ với ID #${routeTaskId}.`
        : 'Không thể tải thông tin nhiệm vụ. Vui lòng kiểm tra lại ID.';
  }

  return (
    <div className="update-projects-container">
      <div className="update-projects-header">
        <div>
          <h2 className="update-projects-title">Cập Nhật Nhiệm Vụ</h2>
          <span style={{ fontSize: '14px', color: '#64748b' }}>
            Chỉnh sửa các trường thông tin của nhiệm vụ đã tồn tại.
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {currentProjectId && (
            <span
              className="tasks-project-pill"
              onClick={() => navigate(`/projects/${currentProjectId}/tasks`)}
              title="Xem danh sách tasks của dự án này"
            >
              Dự án #{currentProjectId}
            </span>
          )}
          {taskId && <span className="update-id-pill">Task #{taskId}</span>}
        </div>
      </div>

      {/* Manual ID Input if opened without route id */}
      {!routeTaskId && (
        <form className="update-lookup-bar" onSubmit={handleManualLoad}>
          <input
            type="number"
            className="update-lookup-input"
            placeholder="Nhập ID nhiệm vụ cần cập nhật..."
            value={manualIdInput}
            onChange={(e) => setManualIdInput(e.target.value)}
          />
          <button type="submit" className="update-lookup-btn">
            Tải dữ liệu
          </button>
        </form>
      )}

      {/* Notifications */}
      {successMessage && <div className="update-alert success">✅ {successMessage}</div>}
      {errorMessage && <div className="update-alert error">⚠️ {errorMessage}</div>}

      {isLoading || usersLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
          ⏳ Đang tải dữ liệu nhiệm vụ...
        </div>
      ) : (
        <form className="update-projects-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="update-form-group">
            <label htmlFor="taskTitle">Tiêu Đề Nhiệm Vụ (*):</label>
            <input
              type="text"
              id="taskTitle"
              placeholder="Nhập tiêu đề nhiệm vụ"
              className={`update-form-input ${errors.title ? 'has-error' : ''}`}
              {...register('title')}
            />
            {errors.title && <span className="form-error">{errors.title.message}</span>}
          </div>

          <div className="update-form-group">
            <label htmlFor="taskDescription">Mô Tả:</label>
            <textarea
              id="taskDescription"
              placeholder="Nhập mô tả nhiệm vụ"
              className={`update-form-textarea ${errors.description ? 'has-error' : ''}`}
              {...register('description')}
            />
            {errors.description && <span className="form-error">{errors.description.message}</span>}
          </div>

          <div className="update-dates-row">
            <div className="update-form-group">
              <label htmlFor="taskStatus">Trạng Thái:</label>
              <select
                id="taskStatus"
                className={`update-form-select ${errors.status ? 'has-error' : ''}`}
                {...register('status')}
              >
                <option value="TODO">TODO (Cần làm)</option>
                <option value="IN_PROGRESS">IN_PROGRESS (Đang thực hiện)</option>
                <option value="COMPLETED">COMPLETED (Đã hoàn thành)</option>
              </select>
              {errors.status && <span className="form-error">{errors.status.message}</span>}
            </div>

            <div className="update-form-group">
              <label htmlFor="taskPriority">Mức Ưu Tiên:</label>
              <select
                id="taskPriority"
                className={`update-form-select ${errors.priority ? 'has-error' : ''}`}
                {...register('priority')}
              >
                <option value="LOW">LOW (Thấp)</option>
                <option value="MEDIUM">MEDIUM (Trung bình)</option>
                <option value="HIGH">HIGH (Cao)</option>
              </select>
              {errors.priority && <span className="form-error">{errors.priority.message}</span>}
            </div>
          </div>

          <div className="update-dates-row">
            <div className="update-form-group">
              <label htmlFor="taskHandlerId">Người Xử Lý (Handler):</label>
              <select
                id="taskHandlerId"
                className={`update-form-select ${errors.handlerId ? 'has-error' : ''}`}
                {...register('handlerId')}
              >
                <option value="">-- Chọn người xử lý --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName ? `${u.fullName} (@${u.username})` : `@${u.username}`}
                  </option>
                ))}
              </select>
              {errors.handlerId && <span className="form-error">{errors.handlerId.message}</span>}
            </div>

            <div className="update-form-group">
              <label htmlFor="taskCreatorId">Người Tạo (Creator):</label>
              <select
                id="taskCreatorId"
                className={`update-form-select ${errors.creatorId ? 'has-error' : ''}`}
                {...register('creatorId')}
              >
                <option value="">-- Chọn người tạo việc --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName ? `${u.fullName} (@${u.username})` : `@${u.username}`}
                  </option>
                ))}
              </select>
              {errors.creatorId && <span className="form-error">{errors.creatorId.message}</span>}
            </div>
          </div>

          <div className="update-form-actions">
            <button
              type="button"
              className="btn-update cancel"
              onClick={() =>
                navigate(
                  currentProjectId ? `/projects/${currentProjectId}/tasks` : '/projects'
                )
              }
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="btn-update submit"
              disabled={updateMutation.isPending || !taskId}
            >
              {updateMutation.isPending ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default UpdateTask;
