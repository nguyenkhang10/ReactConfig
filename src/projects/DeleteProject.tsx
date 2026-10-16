import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProject, deleteProject } from '../api/projectsApi';
import './deleteProject.css';

function DeleteProject() {
  const { id: routeId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [inputLookupId, setInputLookupId] = useState<string>(routeId || '');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // READ: load the project to confirm
  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', routeId],
    queryFn: () => getProject(routeId!),
    enabled: !!routeId,   // don't fetch until we have an ID
    retry: false,         // a 404 won't fix itself, so show the error right away
  });

  // CHANGE: delete the project
  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setSuccessMessage(`Dự án #${routeId} đã được xóa thành công.`);
      setTimeout(() => navigate('/projects'), 1500);
    },
  });

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputLookupId.trim()) {
      navigate(`/delete-project/${inputLookupId.trim()}`);
    }
  };

  // Combine both possible errors into one message
  let errorMessage: string | null = null;
  if (deleteMutation.isError) {
    errorMessage =
      (deleteMutation.error as any)?.response?.data?.message ||
      'Có lỗi xảy ra khi xóa dự án. Vui lòng thử lại.';
  } else if (error) {
    errorMessage =
      (error as any)?.response?.status === 404
        ? `Không tìm thấy dự án với ID #${routeId}.`
        : 'Không thể tải thông tin dự án. Vui lòng thử lại.';
  }

  return (
    <div className="delete-project-container">
      {/* Top Navbar */}
      <nav className="delete-project-navbar">
        <div className="delete-project-navbar-content">
          <a href="/projects" className="delete-project-brand">
            <div className="delete-project-brand-icon">TF</div>
            <span className="delete-project-brand-name">TaskFlow</span>
          </a>
          <button
            type="button"
            className="btn-delete-action cancel"
            onClick={() => navigate('/projects')}
          >
            ← Danh sách dự án
          </button>
        </div>
      </nav>

      {/* Main Confirmation Content */}
      <main className="delete-project-main">
        {/* Lookup bar if accessed without ID */}
        {!routeId && (
          <form className="delete-lookup-card" onSubmit={handleLookupSubmit}>
            <input
              type="number"
              className="delete-lookup-input"
              placeholder="Nhập ID dự án cần xóa..."
              value={inputLookupId}
              onChange={(e) => setInputLookupId(e.target.value)}
            />
            <button type="submit" className="btn-delete-lookup">
              Tìm dự án
            </button>
          </form>
        )}

        {/* Alerts */}
        {successMessage && <div className="delete-alert success">✅ {successMessage}</div>}
        {errorMessage && <div className="delete-alert error">⚠️ {errorMessage}</div>}

        {isLoading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            ⏳ Đang tải thông tin dự án...
          </div>
        )}

        {!isLoading && project && !deleteMutation.isSuccess && (
          <div className="delete-confirm-card">
            <div className="delete-card-banner">
              <div className="delete-warning-icon">⚠️</div>
              <div className="delete-banner-text">
                <h2>Xác nhận xóa dự án</h2>
                <p>Hành động này không thể hoàn tác sau khi thực hiện.</p>
              </div>
            </div>

            <div className="delete-preview-content">
              <div className="delete-preview-box">
                <h3 className="delete-preview-title">
                  {project.name} <span style={{ color: '#0052ff', fontSize: '14px' }}>#{project.id}</span>
                </h3>
                <p className="delete-preview-desc">
                  {project.description || 'Không có mô tả.'}
                </p>

                <div className="delete-preview-meta">
                  <span>👤 Chủ nhiệm: <strong>{project.owner}</strong></span>
                  <span>📊 Trạng thái: <strong>{project.status}</strong></span>
                </div>
              </div>

              <div className="delete-consequence-note">
                <strong>Lưu ý quan trọng:</strong> Khi xóa dự án này, toàn bộ các nhiệm vụ (tasks)
                liên quan thuộc về dự án cũng sẽ bị xóa vĩnh viễn khỏi cơ sở dữ liệu hệ thống.
              </div>

              <div className="delete-actions-row">
                <button
                  type="button"
                  className="btn-delete-action cancel"
                  onClick={() => navigate(routeId ? `/get-project/${routeId}` : '/projects')}
                  disabled={deleteMutation.isPending}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  className="btn-delete-action danger"
                  onClick={() => deleteMutation.mutate(routeId!)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? 'Đang xóa...' : '🗑️ Xác nhận xóa dự án'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default DeleteProject;
