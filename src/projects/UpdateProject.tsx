import React, {useState} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProject, updateProject } from '../api/projectsApi';
import { getUsers } from '../api/userApi';
import './updateProject.css';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema, type ProjectForm } from '../schemas/projectSchema';

function UpdateProject() {
  const { id: routeId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [manualIdInput, setManualIdInput] = useState<string>(routeId || '');

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // READ: users for the owner dropdown
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  // READ: the project to edit (same key as GetProject and DeleteProject)
  const { data: project, isLoading, error: loadError } = useQuery({
    queryKey: ['project', routeId],
    queryFn: () => getProject(routeId!),
    enabled: !!routeId,
    retry: false,
    refetchOnWindowFocus: false,   // don't overwrite what the user is typing
  });

  const { register, handleSubmit, formState: { errors } } = useForm<ProjectForm>({
  resolver: zodResolver(projectSchema),
  values: project && {
    name: project.name ?? '',
    description: project.description ?? '',
    status: project.status ?? 'PLANNING',
    owner: project.owner ?? '',
    startDate: project.startDate ?? '',
    dueDate: project.dueDate ?? '',
  },
});

  // CHANGE: save the edits
  const updateMutation = useMutation({
    mutationFn: updateProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });           // the list
      queryClient.invalidateQueries({ queryKey: ['project', routeId] });   // the detail page
      setSuccessMessage('Cập nhật dự án thành công!');
      setTimeout(() => navigate('/search-projects/'), 1000);
    },
  });

  const handleManualLoad = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualIdInput.trim()) {
      navigate(`/update-project/${manualIdInput.trim()}`);
    }
  };

  const onSubmit = (data: ProjectForm) => {
  if (!routeId) return;
  setSuccessMessage(null);
  updateMutation.mutate({
    id: routeId,
    data: {
      ...data,
      startDate: data.startDate || null,
      dueDate: data.dueDate || null,
    },
  });
};

  // One error message from whichever thing failed
  let errorMessage: string | null = null;
  if (updateMutation.isError) {
    errorMessage =
      (updateMutation.error as any)?.response?.data?.message ||
      'Có lỗi xảy ra khi cập nhật dự án. Vui lòng thử lại.';
  } else if (loadError) {
    errorMessage =
      (loadError as any)?.response?.status === 404
        ? `Không tìm thấy dự án với ID #${routeId}.`
        : 'Không thể tải thông tin dự án. Vui lòng kiểm tra lại ID.';
  }

  return (
    <div className="update-projects-container">
      <div className="update-projects-header">
        <div>
          <h2 className="update-projects-title">Cập Nhật Dự Án</h2>
          <span style={{ fontSize: '14px', color: '#64748b' }}>
            Chỉnh sửa các trường thông tin của dự án đã tồn tại.
          </span>
        </div>
        {routeId && <span className="update-id-pill">Project #{routeId}</span>}
      </div>

      {/* Manual ID Input if opened without route id */}
      {!routeId && (
        <form className="update-lookup-bar" onSubmit={handleManualLoad}>
          <input
            type="number"
            className="update-lookup-input"
            placeholder="Nhập ID dự án cần cập nhật..."
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

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
          ⏳ Đang tải dữ liệu dự án...
        </div>
      ) : (
        <form className="update-projects-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="update-form-group">
            <label htmlFor="projectName">Tên Dự Án (*):</label>
            <input
              type="text"
              id="projectName"
              placeholder="Nhập tên dự án"
              className="update-form-input"
              {...register('name')}
            />
            {errors.name && <span className="form-error">{errors.name.message}</span>}
          </div>

          <div className="update-form-group">
            <label htmlFor="projectDescription">Mô Tả:</label>
            <textarea
              id="projectDescription"
              placeholder="Nhập mô tả dự án"
              className="update-form-textarea"
              {...register('description')}
            />
          </div>

          <div className="update-form-group">
            <label htmlFor="projectStatus">Trạng Thái:</label>
            <select
              id="projectStatus"
              className="update-form-select"
              {...register('status')}
            >
              <option value="PLANNING">Planning (Đang lập kế hoạch)</option>
              <option value="ACTIVE">Active (Đang thực hiện)</option>
              <option value="ON_HOLD">On Hold (Tạm hoãn)</option>
              <option value="COMPLETED">Completed (Đã hoàn thành)</option>
              <option value="ARCHIVED">Archived (Đã lưu trữ)</option>
            </select>
          </div>

          <div className="update-form-group">
            <label htmlFor="projectOwner">Chủ Nhiệm (Owner) (*):</label>
            <select
              id="projectOwner"
              className="update-form-select"
              {...register('owner')}
            >
              <option value="">-- Chọn chủ nhiệm dự án --</option>
              {project?.owner && !users.some((u) => (u.fullName || u.username) === project.owner) && (
                <option value={project.owner}>{project.owner}</option>
              )}
              {users.map((u) => (
                <option key={u.id} value={u.fullName || u.username}>
                  {u.fullName ? `${u.fullName} (@${u.username})` : `@${u.username}`}
                </option>
              ))}
            </select>
            {errors.owner && <span className="form-error">{errors.owner.message}</span>}
          </div>

          <div className="update-dates-row">
            <div className="update-form-group">
              <label htmlFor="projectStartDate">Ngày Bắt Đầu:</label>
              <input
                type="date"
                id="projectStartDate"
                className="update-form-input"
                {...register('startDate')}
              />
            </div>

            <div className="update-form-group">
              <label htmlFor="projectDeadline">Hạn Chót:</label>
              <input
                type="date"
                id="projectDeadline"
                className="update-form-input"
                {...register('dueDate')}
              />
              {errors.dueDate && <span className="form-error">{errors.dueDate.message}</span>}
            </div>
          </div>

          <div className="update-form-actions">
            <button
              type="button"
              className="btn-update cancel"
              onClick={() => navigate(routeId ? `/get-project/${routeId}` : '/projects')}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="btn-update submit"
              disabled={updateMutation.isPending || !routeId}
            >
              {updateMutation.isPending ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default UpdateProject;
