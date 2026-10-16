import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProject } from '../api/projectsApi';
import './getProject.css';

export interface ProjectDetail {
  id: number;
  name: string;
  description: string;
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
  owner: string;
  startDate?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

function GetProject() {
  const { id: paramId } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [lookupId, setLookupId] = useState<string>(paramId || '');

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', paramId],   // same key as DeleteProject
    queryFn: async () => (await getProject(paramId!)) as ProjectDetail,
    enabled: !!paramId,               // no ID in the URL = don't fetch
    retry: false,                     // a 404 won't fix itself
  });

  let errorMessage: string | null = null;
  if (error) {
    errorMessage =
      (error as any)?.response?.status === 404
        ? `Không tìm thấy dự án với ID #${paramId}.`
        : 'Không thể tải thông tin dự án. Vui lòng thử lại.';
  }

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lookupId.trim()) {
      navigate(`/get-project/${lookupId.trim()}`);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Chưa có';
    try {
      const d = new Date(isoString);
      return isNaN(d.getTime()) ? isoString : d.toLocaleString('vi-VN');
    } catch {
      return isoString;
    }
  };

  return (
    <div className="get-project-container">
      {/* Top Navbar */}
      <nav className="get-project-navbar">
        <div className="get-project-navbar-content">
          <a href="/projects" className="get-project-brand">
            <div className="get-project-brand-icon">TF</div>
            <span className="get-project-brand-name">TaskFlow</span>
          </a>
          <div className="get-project-nav-links">
            <button
              type="button"
              className="get-nav-btn"
              onClick={() => navigate('/projects')}
            >
              Danh sách dự án
            </button>
            <button
              type="button"
              className="get-nav-btn"
              onClick={() => navigate('/search-projects')}
            >
              🔍 Tìm kiếm
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="get-project-main">
        {/* Quick ID Lookup Box */}
        <form className="get-lookup-bar" onSubmit={handleLookupSubmit}>
          <label htmlFor="lookupId" className="get-lookup-label">
            Tra cứu theo ID:
          </label>
          <input
            type="number"
            id="lookupId"
            className="get-lookup-input"
            placeholder="Nhập ID dự án (vd: 1, 2, ...)"
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
          />
          <button type="button" className="btn-lookup" disabled={!project} onClick={() => { navigate(`../projects/${project.id}/tasks`) }}>
            Xem chi tiết
          </button>
        </form>

        {/* isLoading State */}
        {isLoading && (
          <div className="get-state-card">
            <div className="get-state-icon">⏳</div>
            <h3 className="get-state-title">Đang tải dữ liệu dự án...</h3>
            <p className="get-state-desc">Vui lòng chờ trong giây lát.</p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && errorMessage && (
          <div className="get-state-card">
            <div className="get-state-icon">⚠️</div>
            <h3 className="get-state-title">Không tìm thấy thông tin</h3>
            <p className="get-state-desc">{errorMessage}</p>
            <button
              type="button"
              className="btn-get-action back"
              onClick={() => navigate('/projects')}
            >
              Quay lại danh sách
            </button>
          </div>
        )}

        {/* Empty state if no ID requested yet */}
        {!isLoading && !errorMessage && !project && (
          <div className="get-state-card">
            <div className="get-state-icon">📋</div>
            <h3 className="get-state-title">Chưa chọn dự án</h3>
            <p className="get-state-desc">
              Vui lòng nhập ID dự án ở trên hoặc chọn một dự án từ danh sách để xem chi tiết.
            </p>
            <button
              type="button"
              className="btn-get-action back"
              onClick={() => navigate('/projects')}
            >
              Xem tất cả dự án
            </button>
          </div>
        )}

        {/* Project Detail Card */}
        {!isLoading && project && (
          <div className="get-detail-card">
            <header className="get-card-header">
              <div className="get-header-meta">
                <span className="get-badge-id">ID: #{project.id}</span>
                <span className={`get-status-pill ${project.status || 'PLANNING'}`}>
                  ● {project.status}
                </span>
              </div>
              <h1 className="get-project-name">{project.name}</h1>
              <p className="get-project-description">
                {project.description || 'Không có mô tả chi tiết cho dự án này.'}
              </p>
            </header>

            <div className="get-card-body">
              <div className="get-info-grid">
                <div className="get-info-item">
                  <span className="get-info-label">👤 Chủ nhiệm (Owner)</span>
                  <span className="get-info-value">{project.owner}</span>
                </div>

                <div className="get-info-item">
                  <span className="get-info-label">📊 Trạng thái hiện tại</span>
                  <span className="get-info-value">{project.status}</span>
                </div>

                <div className="get-info-item">
                  <span className="get-info-label">📅 Ngày bắt đầu</span>
                  <span className="get-info-value">{project.startDate || 'Chưa thiết lập'}</span>
                </div>

                <div className="get-info-item">
                  <span className="get-info-label">⏰ Hạn chót (Deadline)</span>
                  <span className="get-info-value">{project.dueDate || 'Chưa thiết lập'}</span>
                </div>

                <div className="get-info-item">
                  <span className="get-info-label">🕒 Thời gian tạo</span>
                  <span className="get-info-value">{formatDate(project.createdAt)}</span>
                </div>

                <div className="get-info-item">
                  <span className="get-info-label">🔄 Cập nhật lần cuối</span>
                  <span className="get-info-value">{formatDate(project.updatedAt)}</span>
                </div>
              </div>
            </div>

            <footer className="get-card-footer">
              <div className="get-actions-left">
                <button
                  type="button"
                  className="btn-get-action back"
                  onClick={() => navigate('/projects')}
                >
                  ← Quay lại danh sách
                </button>
              </div>

              <div className="get-actions-right">
                <button
                  type="button"
                  className="btn-get-action edit"
                  onClick={() => navigate(`/update-project/${project.id}`)}
                >
                  ✏️ Chỉnh sửa
                </button>
                <button
                  type="button"
                  className="btn-get-action tasks"
                  onClick={() => navigate(`/projects/${project.id}/tasks`)}
                  style={{ backgroundColor: '#27ae60', borderColor: '#219a52' }}
                >
                  📋 Nhiệm vụ
                </button>
                <button
                  type="button"
                  className="btn-get-action delete"
                  onClick={() => navigate(`/delete-project/${project.id}`)}
                >
                  🗑️ Xóa dự án
                </button>
              </div>
            </footer>
          </div>
        )}
      </main>
    </div>
  );
}

export default GetProject;
