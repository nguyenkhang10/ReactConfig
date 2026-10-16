import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { searchProjects } from '../api/projectsApi';
import './searchProjects.css';

export interface Project {
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

const STATUS_OPTIONS: Array<{ label: string; value: string }> = [
  { label: 'Tất cả trạng thái', value: '' },
  { label: 'Planning (Đang lập kế hoạch)', value: 'PLANNING' },
  { label: 'Active (Đang thực hiện)', value: 'ACTIVE' },
  { label: 'On Hold (Tạm dừng)', value: 'ON_HOLD' },
  { label: 'Completed (Đã hoàn thành)', value: 'COMPLETED' },
  { label: 'Archived (Đã lưu trữ)', value: 'ARCHIVED' },
];

function SearchProjects() {
  const navigate = useNavigate();

  // What the user is typing (changes on every keystroke)
  const [keyword, setKeyword] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  // What was actually searched (changes only on submit, reset or chip click)
  const [filters, setFilters] = useState({ status: '', keyword: '' });

  const {
    data: projects,
    isLoading,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ['projects', filters],
    queryFn: async () => (await searchProjects(filters)) as Project[],
    placeholderData: keepPreviousData,   // keep old results on screen while new ones load
  });

  const errorMessage = isError ? 'Không thể tìm kiếm dự án. Vui lòng thử lại sau.' : null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ status, keyword: keyword.trim() });
  };

  const handleReset = () => {
    setKeyword('');
    setStatus('');
    setFilters({ status: '', keyword: '' });
  };

  const handleQuickStatusClick = (statusValue: string) => {
    const nextStatus = status === statusValue ? '' : statusValue;
    setStatus(nextStatus);
    setFilters({ status: nextStatus, keyword: keyword.trim() });
  };

  const getInitials = (name: string) => {
    if (!name) return 'TF';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  return (
    <div className="search-projects-container">
      {/* Top Navigation */}
      <nav className="search-navbar">
        <div className="search-navbar-content">
          <a href="/projects" className="search-brand">
            <div className="search-brand-icon">TF</div>
            <span className="search-brand-name">TaskFlow</span>
          </a>
          <div className="search-nav-links">
            <button
              type="button"
              className="search-nav-btn"
              onClick={() => navigate('/projects')}
            >
              Danh sách dự án
            </button>
            <button
              type="button"
              className="search-nav-btn"
              onClick={() => navigate('/users')}
            >
              👥 Người dùng
            </button>
            <button
              type="button"
              className="search-nav-btn primary"
              onClick={() => navigate('/create-projects')}
            >
              + Tạo dự án mới
            </button>
          </div>
        </div>
      </nav>

      {/* Main Search Container */}
      <main className="search-main">
        <header className="search-header">
          <h1 className="search-header-title">
            <span>🔍</span> Tìm kiếm dự án
          </h1>
          <p className="search-header-subtitle">
            Tra cứu và lọc dự án theo trạng thái, từ khóa tên hoặc mô tả dự án.
          </p>
        </header>

        {/* Filter Card Form */}
        <div className="search-filter-card">
          <form className="search-form" onSubmit={handleFormSubmit}>
            <div className="search-inputs-grid">
              <div className="search-field">
                <label htmlFor="searchKeyword">Từ khóa tìm kiếm:</label>
                <div className="search-input-wrapper">
                  <span className="search-field-icon">🔎</span>
                  <input
                    type="text"
                    id="searchKeyword"
                    className="search-text-input"
                    placeholder="Nhập tên dự án, mô tả..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </div>
              </div>

              <div className="search-field">
                <label htmlFor="searchStatus">Trạng thái:</label>
                <select
                  id="searchStatus"
                  className="search-select-input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick status filters */}
            <div className="quick-filters">
              <span className="quick-filter-label">Bộ lọc nhanh:</span>
              {['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'].map((st) => (
                <button
                  type="button"
                  key={st}
                  className={`quick-filter-chip ${status === st ? 'active' : ''}`}
                  onClick={() => handleQuickStatusClick(st)}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Submit & Reset Buttons */}
            <div className="search-form-actions">
              <button
                type="button"
                className="btn-search-reset"
                onClick={handleReset}
              >
                Đặt lại
              </button>
              <button
                type="submit"
                className="btn-search-submit"
                disabled={isFetching}
              >
                {isFetching ? 'Đang tìm...' : 'Tìm kiếm'}
              </button>
            </div>
          </form>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div
            style={{
              padding: '14px 18px',
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* Results Bar */}
        <div className="search-results-bar">
          <div className="results-count-text">
            Kết quả:{' '}
            <span className="results-count-number">
              {projects ? projects.length : '...'}
            </span>{' '}
            dự án
          </div>
        </div>

        {/* Results Grid or States */}
        {isLoading && projects === null ? (
          <div className="search-empty-state">
            <div className="search-empty-icon">⏳</div>
            <h3 className="search-empty-title">Đang tải kết quả...</h3>
          </div>
        ) : projects && projects.length > 0 ? (
          <ul className="search-grid">
            {projects.map((project) => (
              <li key={project.id} className="search-project-card">
                <div>
                  <div className="search-card-header">
                    <div className="search-avatar">
                      {getInitials(project.name)}
                    </div>
                    <span className={`status-pill ${project.status || 'PLANNING'}`}>
                      <span className="status-dot" />
                      {project.status || 'PLANNING'}
                    </span>
                  </div>

                  <div className="search-card-body">
                    <h3 className="search-card-title">{project.name}</h3>
                    <p className="search-card-desc">
                      {project.description || 'Chưa có mô tả cho dự án này.'}
                    </p>

                    <div className="search-meta-row">
                      <span className="search-meta-item">
                        👤 Chủ nhiệm: <strong>{project.owner}</strong>
                      </span>
                      {project.dueDate && (
                        <span className="search-meta-item">
                          📅 Hạn: <strong>{project.dueDate}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="search-card-footer">
                  <span className="search-card-id">ID: #{project.id}</span>
                  <div className="search-card-actions">
                    <button
                      type="button"
                      className="card-action-btn"
                      style={{
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: '#059669',
                        borderColor: 'rgba(16, 185, 129, 0.25)',
                      }}
                      onClick={() => navigate(`/projects/${project.id}/tasks`)}
                      title="Xem danh sách nhiệm vụ của dự án này"
                    >
                      📋 Tasks
                    </button>
                    <button
                      type="button"
                      className="card-action-btn view"
                      onClick={() => navigate(`/get-project/${project.id}`)}
                    >
                      Xem
                    </button>
                    <button
                      type="button"
                      className="card-action-btn edit"
                      onClick={() => navigate(`/update-project/${project.id}`)}
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      className="card-action-btn delete"
                      onClick={() => navigate(`/delete-project/${project.id}`)}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="search-empty-state">
            <div className="search-empty-icon">🔍</div>
            <h3 className="search-empty-title">Không tìm thấy dự án</h3>
            <p className="search-empty-desc">
              Không có dự án nào thỏa mãn điều kiện lọc
              {keyword ? ` từ khóa "${keyword}"` : ''}
              {status ? ` với trạng thái "${status}"` : ''}.
            </p>
            <button
              type="button"
              className="btn-search-reset"
              onClick={handleReset}
            >
              Xem tất cả dự án
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default SearchProjects;
