import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTaskById, deleteTask } from '../api/taskApi';
import type { Task } from '../api/taskApi';
import '../projects/deleteProject.css';
import './tasks.css';

function DeleteTask() {
  const { projectId, taskId: routeTaskId } = useParams<{ projectId?: string; taskId?: string }>();
  const navigate = useNavigate();

  const [taskId, setTaskId] = useState<string>(routeTaskId || '');
  const [inputLookupId, setInputLookupId] = useState<string>(routeTaskId || '');
  const [task, setTask] = useState<Task | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string>(projectId || '');

  const [loading, setLoading] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchTask = async (id: string) => {
      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      try {
        const data = await getTaskById(id);
        setTask(data);
        setTaskId(String(id));
        if (data.projectId) {
          setCurrentProjectId(String(data.projectId));
        }
      } catch (err: any) {
        console.error('Error fetching task to delete:', err);
        if (err?.response?.status === 404) {
          setErrorMessage(`Không tìm thấy nhiệm vụ với ID #${id}.`);
        } else {
          setErrorMessage('Không thể tải thông tin nhiệm vụ. Vui lòng thử lại.');
        }
        setTask(null);
      } finally {
        setLoading(false);
      }
    };

    if (routeTaskId) {
      fetchTask(routeTaskId);
    }
  }, [routeTaskId]);

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = inputLookupId.trim();
    if (cleanId) {
      if (projectId) {
        navigate(`/projects/${projectId}/tasks/delete/${cleanId}`);
      } else {
        navigate(`/tasks/delete/${cleanId}`);
      }
      setTaskId(cleanId);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!taskId) return;

    setDeleting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await deleteTask(taskId);
      setSuccessMessage(`Nhiệm vụ #${taskId} đã được xóa thành công.`);
      setTask(null);
      setTimeout(() => {
        if (currentProjectId) {
          navigate(`/projects/${currentProjectId}/tasks`);
        } else {
          navigate('/projects');
        }
      }, 1200);
    } catch (err: any) {
      console.error('Error deleting task:', err);
      setErrorMessage(
        err?.response?.data?.message || 'Có lỗi xảy ra khi xóa nhiệm vụ. Vui lòng thử lại.'
      );
    } finally {
      setDeleting(false);
    }
  };

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
            onClick={() =>
              navigate(
                currentProjectId ? `/projects/${currentProjectId}/tasks` : '/projects'
              )
            }
          >
            ← Danh sách nhiệm vụ
          </button>
        </div>
      </nav>

      {/* Main Confirmation Content */}
      <main className="delete-project-main">
        {/* Lookup bar if accessed without ID */}
        {!routeTaskId && (
          <form className="delete-lookup-card" onSubmit={handleLookupSubmit}>
            <input
              type="number"
              className="delete-lookup-input"
              placeholder="Nhập ID nhiệm vụ cần xóa..."
              value={inputLookupId}
              onChange={(e) => setInputLookupId(e.target.value)}
            />
            <button type="submit" className="btn-delete-lookup">
              Tìm nhiệm vụ
            </button>
          </form>
        )}

        {/* Alerts */}
        {successMessage && <div className="delete-alert success">✅ {successMessage}</div>}
        {errorMessage && <div className="delete-alert error">⚠️ {errorMessage}</div>}

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            ⏳ Đang tải thông tin nhiệm vụ...
          </div>
        )}

        {!loading && task && (
          <div className="delete-confirm-card">
            <div className="delete-card-banner">
              <div className="delete-warning-icon">⚠️</div>
              <div className="delete-banner-text">
                <h2>Xác nhận xóa nhiệm vụ</h2>
                <p>Hành động này không thể hoàn tác sau khi thực hiện.</p>
              </div>
            </div>

            <div className="delete-preview-content">
              <div className="delete-preview-box">
                <h3 className="delete-preview-title">
                  {task.title}{' '}
                  <span style={{ color: '#0052ff', fontSize: '14px' }}>#{task.id}</span>
                </h3>
                <p className="delete-preview-desc">
                  {task.description || 'Không có mô tả cho nhiệm vụ này.'}
                </p>

                <div className="delete-preview-meta">
                  <span>
                    Dự án: <strong>#{task.projectId || currentProjectId}</strong>
                  </span>
                  <span>
                    Trạng thái: <strong>{task.status}</strong>
                  </span>
                  <span>
                    Ưu tiên: <strong>{task.priority}</strong>
                  </span>
                  {task.assignee && (
                    <span>
                      Người nhận: <strong>{task.assignee}</strong>
                    </span>
                  )}
                </div>
              </div>

              <div className="delete-consequence-note">
                <strong>Lưu ý quan trọng:</strong> Nhiệm vụ này sẽ bị xóa hoàn toàn khỏi cơ sở dữ liệu. Mọi dữ liệu liên quan sẽ không thể phục hồi.
              </div>

              <div className="delete-actions-row">
                <button
                  type="button"
                  className="btn-delete-action cancel"
                  onClick={() =>
                    navigate(
                      currentProjectId
                        ? `/projects/${currentProjectId}/tasks`
                        : '/projects'
                    )
                  }
                  disabled={deleting}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  className="btn-delete-action danger"
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                >
                  {deleting ? 'Đang xóa...' : '🗑️ Xác nhận xóa nhiệm vụ'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default DeleteTask;
