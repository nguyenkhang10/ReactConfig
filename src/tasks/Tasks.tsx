import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTasksByProject } from '../api/taskApi';
import type { Task } from '../api/taskApi';
import { getUsers } from '../api/userApi';
import type { User } from '../api/userApi';
import AppNavbar from '../components/AppNavbar';
import './tasks.css';

function Tasks() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [userMap, setUserMap] = useState<Map<number, User>>(new Map());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Fetch users for name lookup
    const fetchUsers = async () => {
      try {
        const userList = await getUsers();
        const map = new Map<number, User>();
        userList.forEach((u) => map.set(u.id, u));
        setUserMap(map);
      } catch (err) {
        console.error('Error fetching users for name lookup:', err);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!projectId) {
        setErrorMessage('Thiếu mã dự án (projectId) trên đường dẫn URL.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorMessage(null);
        const data = await getTasksByProject(projectId);
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks by project:', error);
        setErrorMessage('Không thể tải danh sách nhiệm vụ của dự án này. Vui lòng kiểm tra kết nối.');
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId]);

  /** Returns display name for a given userId */
  const getUserName = (userId?: number | null): string => {
    if (!userId) return 'Chưa gán';
    const u = userMap.get(userId);
    if (!u) return `#${userId}`;
    return u.fullName ? `${u.fullName}` : `@${u.username}`;
  };

  if (!projectId) {
    return (
      <div className="tasks-container">
        <main className="tasks-main">
          <div className="tasks-empty-state">
            <div className="empty-task-icon">⚠️</div>
            <h3 className="empty-task-title">Không tìm thấy mã dự án</h3>
            <p className="empty-task-desc">Vui lòng chọn một dự án từ danh sách để xem nhiệm vụ.</p>
            <button
              type="button"
              className="btn-new-task"
              onClick={() => navigate('/projects')}
            >
              ← Quay lại danh sách dự án
            </button>
          </div>
        </main>
      </div>
    );
  }

  const filteredTasks = tasks
    ? tasks.filter(
      (t) =>
        t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];

  return (
    <div className="tasks-container">
      {/* Global Navigation Bar */}
      <AppNavbar />

      {/* Main Content */}
      <main className="tasks-main">
        <div className="tasks-header-wrapper">
          <div className="tasks-title-row">
            <div className="tasks-heading-group">
              <h1 className="tasks-page-title">
                Danh sách nhiệm vụ
                <span
                  className="tasks-project-pill"
                  onClick={() => navigate(`/get-project/${projectId}`)}
                  title="Bấm để xem chi tiết dự án"
                >
                  Dự án #{projectId}
                </span>
                {tasks && (
                  <span className="tasks-count-pill">
                    {tasks.length} nhiệm vụ
                  </span>
                )}
              </h1>
              <p className="tasks-page-subtitle">
                Quản lý tiến độ công việc, theo dõi trạng thái và mức độ ưu tiên của từng nhiệm vụ.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-secondary-task"
                onClick={() => navigate(`/projects/${projectId}/tasks/search`)}
              >
                <span>🔍</span> Tìm kiếm nâng cao
              </button>
              <button
                type="button"
                className="btn-new-task"
                onClick={() => navigate(`/projects/${projectId}/tasks/create`)}
              >
                <span>+</span> Tạo Task mới
              </button>
            </div>
          </div>

          {/* Search Toolbar */}
          <div className="tasks-toolbar">
            <div className="tasks-search-box">
              <span className="tasks-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Tìm nhanh nhiệm vụ theo tiêu đề hoặc mô tả..."
                className="tasks-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Error notification */}
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

        {/* Loading State */}
        {loading ? (
          <div className="tasks-table-wrapper" style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>⏳</div>
            <div style={{ fontWeight: 600, color: '#475569' }}>Đang tải danh sách nhiệm vụ...</div>
          </div>
        ) : filteredTasks.length > 0 ? (
          /* Tasks Table */
          <div className="tasks-table-wrapper">
            <table className="tasks-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>ID</th>
                  <th style={{ width: '24%' }}>Tiêu đề (Title)</th>
                  <th>Mô tả (Description)</th>
                  <th style={{ width: '140px' }}>Trạng thái</th>
                  <th style={{ width: '110px' }}>Ưu tiên</th>
                  <th style={{ width: '160px' }}>Người xử lý</th>
                  <th style={{ width: '140px', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <span className="task-id-badge">#{task.id}</span>
                    </td>
                    <td>
                      <div className="task-title-cell">{task.title}</div>
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
                      <span style={{ fontSize: '13px', color: task.handlerId ? '#0f172a' : '#94a3b8', fontWeight: task.handlerId ? 500 : 400 }}>
                        {task.handlerId ? '👤 ' : ''}{getUserName(task.handlerId)}
                      </span>
                    </td>
                    <td>
                      <div className="task-actions-cell" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn-task-action edit"
                          onClick={() =>
                            navigate(`/projects/${projectId}/tasks/edit/${task.id}`)
                          }
                          title="Chỉnh sửa nhiệm vụ"
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          type="button"
                          className="btn-task-action delete"
                          onClick={() =>
                            navigate(`/projects/${projectId}/tasks/delete/${task.id}`)
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
          /* Empty State */
          <div className="tasks-empty-state">
            <div className="empty-task-icon">📋</div>
            <h3 className="empty-task-title">Không tìm thấy nhiệm vụ nào</h3>
            <p className="empty-task-desc">
              {searchTerm
                ? `Không có kết quả phù hợp với từ khóa "${searchTerm}".`
                : 'Dự án này hiện chưa có nhiệm vụ nào. Hãy tạo nhiệm vụ mới để bắt đầu quản lý công việc!'}
            </p>
            {searchTerm ? (
              <button
                type="button"
                className="btn-new-task"
                onClick={() => setSearchTerm('')}
              >
                Xóa bộ lọc tìm kiếm
              </button>
            ) : (
              <button
                type="button"
                className="btn-new-task"
                onClick={() => navigate(`/projects/${projectId}/tasks/create`)}
              >
                + Tạo nhiệm vụ ngay
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Tasks;
