import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { searchTasks } from '../api/taskApi';
import { getUsers } from '../api/userApi';
import type { User } from '../api/userApi';
import AppNavbar from '../components/AppNavbar';
import '../projects/searchProjects.css';
import './tasks.css';

const TASK_STATUS_OPTIONS = [
  { label: 'Tất cả trạng thái', value: '' },
  { label: 'TODO (Cần làm)', value: 'TODO' },
  { label: 'IN_PROGRESS (Đang thực hiện)', value: 'IN_PROGRESS' },
  { label: 'COMPLETED (Đã hoàn thành)', value: 'COMPLETED' },
];

const TASK_PRIORITY_OPTIONS = [
  { label: 'Tất cả mức ưu tiên', value: '' },
  { label: 'LOW (Thấp)', value: 'LOW' },
  { label: 'MEDIUM (Trung bình)', value: 'MEDIUM' },
  { label: 'HIGH (Cao)', value: 'HIGH' },
];

interface TaskSearchFiltersState {
  keyword: string;
  status: string;
  priority: string;
  projectId: string;
  handlerId: string;
  creatorId: string;
}

function SearchTask() {
  const { projectId: routeProjectId } = useParams<{ projectId?: string }>();
  const navigate = useNavigate();

  // What the user is typing
  const [keyword, setKeyword] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [projectId, setProjectId] = useState<string>(routeProjectId || '');
  const [handlerId, setHandlerId] = useState<string>('');
  const [creatorId, setCreatorId] = useState<string>('');

  // What was actually applied (changes only on submit, reset or chip click)
  const [appliedFilters, setAppliedFilters] = useState<TaskSearchFiltersState>({
    keyword: '',
    status: '',
    priority: '',
    projectId: routeProjectId || '',
    handlerId: '',
    creatorId: '',
  });

  const queryKey = routeProjectId
    ? ['tasks', routeProjectId, appliedFilters]
    : ['tasks', appliedFilters];

  const {
    data: tasks,
    isLoading,
    isFetching,
    isError,
  } = useQuery({
    queryKey,
    queryFn: () =>
      searchTasks({
        keyword: appliedFilters.keyword.trim() || undefined,
        status: appliedFilters.status || undefined,
        priority: appliedFilters.priority || undefined,
        projectId: appliedFilters.projectId ? Number(appliedFilters.projectId) : undefined,
        handlerId: appliedFilters.handlerId ? Number(appliedFilters.handlerId) : undefined,
        creatorId: appliedFilters.creatorId ? Number(appliedFilters.creatorId) : undefined,
      }),
    placeholderData: keepPreviousData,
  });

  // Fetch users for dropdown and handler name lookup
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const userMap: Map<number, User> = new Map(users.map((u) => [u.id, u]));

  /** Returns display name for a given userId */
  const getUserName = (userId?: number | null): string => {
    if (!userId) return 'Chưa gán';
    const u = userMap.get(userId);
    if (!u) return `#${userId}`;
    return u.fullName ? `${u.fullName} (@${u.username})` : `@${u.username}`;
  };

  const errorMessage = isError ? 'Không thể tìm kiếm nhiệm vụ. Vui lòng thử lại sau.' : null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedFilters({
      keyword,
      status,
      priority,
      projectId: routeProjectId || projectId,
      handlerId,
      creatorId,
    });
  };

  const handleReset = () => {
    setKeyword('');
    setStatus('');
    setPriority('');
    setHandlerId('');
    setCreatorId('');
    setProjectId(routeProjectId || '');
    setAppliedFilters({
      keyword: '',
      status: '',
      priority: '',
      projectId: routeProjectId || '',
      handlerId: '',
      creatorId: '',
    });
  };

  const handleQuickStatus = (st: string) => {
    const next = status === st ? '' : st;
    setStatus(next);
    setAppliedFilters({
      keyword,
      status: next,
      priority,
      projectId: routeProjectId || projectId,
      handlerId,
      creatorId,
    });
  };

  const handleQuickPriority = (pr: string) => {
    const next = priority === pr ? '' : pr;
    setPriority(next);
    setAppliedFilters({
      keyword,
      status,
      priority: next,
      projectId: routeProjectId || projectId,
      handlerId,
      creatorId,
    });
  };

  return (
    <div className="search-projects-container">
      {/* Global Navigation Bar */}
      <AppNavbar />

      {/* Main Container */}
      <main className="search-main">
        <header className="search-header">
          <h1 className="search-header-title">
            <span>🔍</span> Tìm kiếm nhiệm vụ (Tasks)
          </h1>
          <p className="search-header-subtitle">
            Lọc và tra cứu nhiệm vụ theo từ khóa, trạng thái, mức độ ưu tiên, mã dự án và người xử lý.
          </p>
        </header>

        {/* Filter Box */}
        <div className="search-filter-card">
          <form className="search-form" onSubmit={handleFormSubmit}>
            <div
              className="search-inputs-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '16px',
              }}
            >
              <div className="search-field">
                <label htmlFor="taskKeyword">Từ khóa tìm kiếm:</label>
                <div className="search-input-wrapper">
                  <span className="search-field-icon">🔎</span>
                  <input
                    type="text"
                    id="taskKeyword"
                    className="search-text-input"
                    placeholder="Tiêu đề, mô tả..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </div>
              </div>

              <div className="search-field">
                <label htmlFor="taskStatusFilter">Trạng thái:</label>
                <select
                  id="taskStatusFilter"
                  className="search-select-input"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {TASK_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="search-field">
                <label htmlFor="taskPriorityFilter">Mức ưu tiên:</label>
                <select
                  id="taskPriorityFilter"
                  className="search-select-input"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  {TASK_PRIORITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="search-field">
                <label htmlFor="taskProjectIdFilter">Mã dự án (ID):</label>
                <input
                  type="number"
                  id="taskProjectIdFilter"
                  className="search-select-input"
                  placeholder="ID dự án"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  disabled={Boolean(routeProjectId)}
                />
              </div>

              <div className="search-field">
                <label htmlFor="taskHandlerFilter">Người xử lý (Handler):</label>
                <select
                  id="taskHandlerFilter"
                  className="search-select-input"
                  value={handlerId}
                  onChange={(e) => setHandlerId(e.target.value)}
                >
                  <option value="">-- Tất cả người xử lý --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName ? `${u.fullName} (@${u.username})` : `@${u.username}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Status and Priority chips */}
            <div className="quick-filters">
              <span className="quick-filter-label">Trạng thái:</span>
              {['TODO', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
                <button
                  type="button"
                  key={st}
                  className={`quick-filter-chip ${status === st ? 'active' : ''}`}
                  onClick={() => handleQuickStatus(st)}
                >
                  {st}
                </button>
              ))}

              <span className="quick-filter-label" style={{ marginLeft: '12px' }}>
                Ưu tiên:
              </span>
              {['LOW', 'MEDIUM', 'HIGH'].map((pr) => (
                <button
                  type="button"
                  key={pr}
                  className={`quick-filter-chip ${priority === pr ? 'active' : ''}`}
                  onClick={() => handleQuickPriority(pr)}
                >
                  {pr}
                </button>
              ))}
            </div>

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
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Results Bar */}
        <div className="search-results-bar">
          <div className="results-count-text">
            Kết quả:{' '}
            <span className="results-count-number">
              {tasks ? tasks.length : 0}
            </span>{' '}
            nhiệm vụ
          </div>
        </div>

        {/* Results Table or Empty State */}
        {isLoading ? (
          <div className="search-empty-state">
            <div className="search-empty-icon">⏳</div>
            <h3 className="search-empty-title">Đang tải kết quả tìm kiếm...</h3>
          </div>
        ) : tasks && tasks.length > 0 ? (
          <div className="tasks-table-wrapper">
            <table className="tasks-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>ID</th>
                  <th style={{ width: '90px' }}>Dự án</th>
                  <th style={{ width: '25%' }}>Tiêu đề</th>
                  <th>Mô tả</th>
                  <th style={{ width: '130px' }}>Trạng thái</th>
                  <th style={{ width: '110px' }}>Ưu tiên</th>
                  <th style={{ width: '120px' }}>Người xử lý</th>
                  <th style={{ width: '150px', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <span className="task-id-badge">#{task.id}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="tasks-project-pill"
                        style={{ border: 'none', cursor: 'pointer' }}
                        onClick={() => navigate(`/projects/${task.projectId}/tasks`)}
                        title="Xem danh sách tasks của dự án này"
                      >
                        #{task.projectId}
                      </button>
                    </td>
                    <td>
                      <div className="task-title-cell">{task.title}</div>
                      {task.creatorId && (
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                          Tạo bởi: #{task.creatorId}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="task-desc-cell">
                        {task.description || 'Chưa có mô tả'}
                      </div>
                    </td>
                    <td>
                      <span className={`task-status-pill ${task.status || 'TODO'}`}>
                        ● {task.status || 'TODO'}
                      </span>
                    </td>
                    <td>
                      <span className={`task-priority-pill ${task.priority || 'MEDIUM'}`}>
                        {task.priority || 'MEDIUM'}
                      </span>
                    </td>
                    <td>
                      {task.handlerId ? (
                        <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 500 }}>
                          👤 {getUserName(task.handlerId)}
                        </span>
                      ) : task.assignee ? (
                        <span style={{ fontSize: '13px', color: '#475569' }}>
                          👤 {task.assignee}
                        </span>
                      ) : (
                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>Chưa gán</span>
                      )}
                    </td>
                    <td>
                      <div className="task-actions-cell" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn-task-action edit"
                          onClick={() =>
                            navigate(`/projects/${task.projectId}/tasks/edit/${task.id}`)
                          }
                          title="Sửa nhiệm vụ"
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          type="button"
                          className="btn-task-action delete"
                          onClick={() =>
                            navigate(`/projects/${task.projectId}/tasks/delete/${task.id}`)
                          }
                          title="Xóa nhiệm vụ"
                        >
                          🗑️ Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="search-empty-state">
            <div className="search-empty-icon">🔍</div>
            <h3 className="search-empty-title">Không tìm thấy nhiệm vụ nào</h3>
            <p className="search-empty-desc">
              Không có nhiệm vụ nào khớp với tiêu chí tìm kiếm hiện tại.
            </p>
            <button
              type="button"
              className="btn-search-reset"
              onClick={handleReset}
            >
              Xem tất cả nhiệm vụ
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default SearchTask;
