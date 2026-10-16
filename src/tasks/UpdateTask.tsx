import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTaskById, updateTask } from '../api/taskApi';
import type { TaskPriority, TaskStatus } from '../api/taskApi';
import { getUsers } from '../api/userApi';
import type { User } from '../api/userApi';
import '../projects/updateProject.css';
import './tasks.css';

function UpdateTask() {
  const { projectId, taskId: routeTaskId } = useParams<{ projectId?: string; taskId?: string }>();
  const navigate = useNavigate();

  const [taskId, setTaskId] = useState<string>(routeTaskId || '');
  const [manualIdInput, setManualIdInput] = useState<string>(routeTaskId || '');
  const [currentProjectId, setCurrentProjectId] = useState<string>(projectId || '');

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [handlerId, setHandlerId] = useState<string>('');
  const [creatorId, setCreatorId] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userList = await getUsers();
        setUsers(userList);
      } catch (err) {
        console.error('Error fetching users in UpdateTask:', err);
      }
    };
    fetchUsers();
  }, []);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchTask = async (id: string) => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const task = await getTaskById(id);
        if (task) {
          setTitle(task.title || '');
          setDescription(task.description || '');
          setStatus((task.status as TaskStatus) || 'TODO');
          setPriority((task.priority as TaskPriority) || 'MEDIUM');
          setHandlerId(task.handlerId !== null && task.handlerId !== undefined ? String(task.handlerId) : '');
          setCreatorId(task.creatorId !== null && task.creatorId !== undefined ? String(task.creatorId) : '');
          if (task.projectId) {
            setCurrentProjectId(String(task.projectId));
          }
          setTaskId(String(id));
        }
      } catch (err: any) {
        console.error('Error fetching task by id:', err);
        if (err?.response?.status === 404) {
          setErrorMessage(`Không tìm thấy nhiệm vụ với ID #${id}.`);
        } else {
          setErrorMessage('Không thể tải thông tin nhiệm vụ. Vui lòng kiểm tra lại ID.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (routeTaskId) {
      fetchTask(routeTaskId);
    }
  }, [routeTaskId]);

  const handleManualLoad = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = manualIdInput.trim();
    if (cleanId) {
      if (projectId) {
        navigate(`/projects/${projectId}/tasks/edit/${cleanId}`);
      } else {
        navigate(`/tasks/edit/${cleanId}`);
      }
      setTaskId(cleanId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskId) {
      setErrorMessage('Chưa xác định ID nhiệm vụ để cập nhật.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const updatedPayload = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      projectId: currentProjectId || undefined,
      creatorId: creatorId.trim() || undefined,
      handlerId: handlerId.trim() || undefined,
    };

    try {
      await updateTask(taskId, updatedPayload);
      setSuccessMessage('Cập nhật nhiệm vụ thành công!');
      setTimeout(() => {
        if (currentProjectId) {
          navigate(`/projects/${currentProjectId}/tasks`);
        } else {
          navigate('/projects');
        }
      }, 1000);
    } catch (err: any) {
      console.error('Error updating task:', err);
      setErrorMessage(
        err?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật nhiệm vụ. Vui lòng thử lại.'
      );
    } finally {
      setSubmitting(false);
    }
  };

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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
          ⏳ Đang tải dữ liệu nhiệm vụ...
        </div>
      ) : (
        <form className="update-projects-form" onSubmit={handleSubmit}>
          <div className="update-form-group">
            <label htmlFor="taskTitle">Tiêu Đề Nhiệm Vụ (*):</label>
            <input
              type="text"
              id="taskTitle"
              placeholder="Nhập tiêu đề nhiệm vụ"
              className="update-form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="update-form-group">
            <label htmlFor="taskDescription">Mô Tả:</label>
            <textarea
              id="taskDescription"
              placeholder="Nhập mô tả nhiệm vụ"
              className="update-form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="update-dates-row">
            <div className="update-form-group">
              <label htmlFor="taskStatus">Trạng Thái:</label>
              <select
                id="taskStatus"
                className="update-form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                <option value="TODO">TODO (Cần làm)</option>
                <option value="IN_PROGRESS">IN_PROGRESS (Đang thực hiện)</option>
                <option value="COMPLETED">COMPLETED (Đã hoàn thành)</option>
              </select>
            </div>

            <div className="update-form-group">
              <label htmlFor="taskPriority">Mức Ưu Tiên:</label>
              <select
                id="taskPriority"
                className="update-form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                <option value="LOW">LOW (Thấp)</option>
                <option value="MEDIUM">MEDIUM (Trung bình)</option>
                <option value="HIGH">HIGH (Cao)</option>
              </select>
            </div>
          </div>

          <div className="update-dates-row">
            <div className="update-form-group">
              <label htmlFor="taskHandlerId">Người Xử Lý (Handler):</label>
              <select
                id="taskHandlerId"
                className="update-form-select"
                value={handlerId}
                onChange={(e) => setHandlerId(e.target.value)}
              >
                <option value="">-- Chọn người xử lý --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName ? `${u.fullName} (@${u.username})` : `@${u.username}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="update-form-group">
              <label htmlFor="taskCreatorId">Người Tạo (Creator):</label>
              <select
                id="taskCreatorId"
                className="update-form-select"
                value={creatorId}
                onChange={(e) => setCreatorId(e.target.value)}
              >
                <option value="">-- Chọn người tạo việc --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName ? `${u.fullName} (@${u.username})` : `@${u.username}`}
                  </option>
                ))}
              </select>
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
              disabled={submitting || !taskId}
            >
              {submitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default UpdateTask;
