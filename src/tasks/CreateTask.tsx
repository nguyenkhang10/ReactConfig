import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTask, createTaskDirect } from '../api/taskApi';
import { getUsers } from '../api/userApi';
import '../projects/createProjects.css';
import './tasks.css';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTaskSchema, type CreateTaskForm } from '../schemas/taskSchema';

function CreateTask() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTaskForm>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      projectId: projectId || '',
      handlerId: '',
      creatorId: '',
    },
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const createMutation = useMutation({
    mutationFn: (payload: { projectId: string; task: Parameters<typeof createTask>[1] }) => {
      if (projectId) {
        return createTask(payload.projectId, payload.task);
      } else {
        return createTaskDirect({ ...payload.task, projectId: payload.projectId });
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      navigate(`/projects/${variables.projectId}/tasks`);
    },
  });

  const onSubmit = (data: CreateTaskForm) => {
    createMutation.mutate({
      projectId: data.projectId,
      task: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        projectId: data.projectId,
        creatorId: data.creatorId || undefined,
        handlerId: data.handlerId || undefined,
      },
    });
  };

  const errorMessage = createMutation.isError
    ? (createMutation.error as any)?.response?.data?.message ||
      'Không thể tạo nhiệm vụ. Vui lòng kiểm tra lại thông tin và thử lại.'
    : null;

  return (
    <div className="create-projects-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2 className="create-projects-title" style={{ margin: 0 }}>
          Tạo Nhiệm Vụ Mới
        </h2>
        {projectId && (
          <span className="tasks-project-pill" title="Project ID">
            Dự án #{projectId}
          </span>
        )}
      </div>

      {errorMessage && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
          }}
        >
          ⚠️ {errorMessage}
        </div>
      )}

      <form className="create-projects-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Chỉ hiển thị nhập projectId nếu không có trên URL */}
        {!projectId && (
          <div className="form-group">
            <label htmlFor="taskProjectId">Mã Dự Án (Project ID) (*):</label>
            <input
              type="number"
              id="taskProjectId"
              placeholder="Nhập mã ID của dự án..."
              className={`form-input ${errors.projectId ? 'has-error' : ''}`}
              {...register('projectId')}
            />
            {errors.projectId && <span className="form-error">{errors.projectId.message}</span>}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="taskTitle">Tiêu Đề Nhiệm Vụ (*):</label>
          <input
            type="text"
            id="taskTitle"
            placeholder="Nhập tiêu đề nhiệm vụ"
            className={`form-input ${errors.title ? 'has-error' : ''}`}
            {...register('title')}
          />
          {errors.title && <span className="form-error">{errors.title.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="taskDescription">Mô Tả:</label>
          <textarea
            id="taskDescription"
            placeholder="Nhập mô tả chi tiết nhiệm vụ"
            className="form-textarea"
            {...register('description')}
          />
        </div>

        <div className="form-group">
          <label htmlFor="taskStatus">Trạng Thái:</label>
          <select
            id="taskStatus"
            className={`form-select ${errors.status ? 'has-error' : ''}`}
            {...register('status')}
          >
            <option value="TODO">TODO (Cần làm)</option>
            <option value="IN_PROGRESS">IN_PROGRESS (Đang thực hiện)</option>
            <option value="COMPLETED">COMPLETED (Đã hoàn thành)</option>
          </select>
          {errors.status && <span className="form-error">{errors.status.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="taskPriority">Mức Ưu Tiên:</label>
          <select
            id="taskPriority"
            className={`form-select ${errors.priority ? 'has-error' : ''}`}
            {...register('priority')}
          >
            <option value="LOW">LOW (Thấp)</option>
            <option value="MEDIUM">MEDIUM (Trung bình)</option>
            <option value="HIGH">HIGH (Cao)</option>
          </select>
          {errors.priority && <span className="form-error">{errors.priority.message}</span>}
        </div>

        <div className="task-form-row">
          <div className="form-group">
            <label htmlFor="taskHandlerId">Người Xử Lý (Handler):</label>
            <select
              id="taskHandlerId"
              className={`form-select ${errors.handlerId ? 'has-error' : ''}`}
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

          <div className="form-group">
            <label htmlFor="taskCreatorId">Người Tạo (Creator):</label>
            <select
              id="taskCreatorId"
              className={`form-select ${errors.creatorId ? 'has-error' : ''}`}
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

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              navigate(projectId ? `/projects/${projectId}/tasks` : '/projects')
            }
          >
            <span>Nhầm tí</span>
          </button>
          <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Đang tạo...' : '+1 Task'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateTask;
