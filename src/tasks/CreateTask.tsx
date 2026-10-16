import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createTask, createTaskDirect } from '../api/taskApi';
import type { TaskPriority, TaskStatus } from '../api/taskApi';
import { getUsers } from '../api/userApi';
import type { User } from '../api/userApi';
import '../projects/createProjects.css';
import './tasks.css';

function CreateTask() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [handlerId, setHandlerId] = useState<string>('');
  const [creatorId, setCreatorId] = useState<string>('');
  const [manualProjectId, setManualProjectId] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userList = await getUsers();
        setUsers(userList);
      } catch (err) {
        console.error('Error fetching users for task creation:', err);
      }
    };
    fetchUsers();
  }, []);

  const effectiveProjectId = projectId || manualProjectId.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!effectiveProjectId) {
      setErrorMessage('Vui lòng cung cấp mã dự án (Project ID).');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const newTaskPayload = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      projectId: effectiveProjectId,
      creatorId: creatorId.trim() || undefined,
      handlerId: handlerId.trim() || undefined,
    };

    try {
      if (projectId) {
        // Gọi POST /api/projects/{projectId}/tasks
        await createTask(projectId, newTaskPayload);
      } else {
        // Gọi POST /api/tasks trực tiếp
        await createTaskDirect(newTaskPayload);
      }
      // Điều hướng về danh sách task của project
      navigate(`/projects/${effectiveProjectId}/tasks`);
    } catch (error: any) {
      console.error('Error creating task:', error);
      setErrorMessage(
        error?.response?.data?.message ||
          'Không thể tạo nhiệm vụ. Vui lòng kiểm tra lại thông tin và thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

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

      <form className="create-projects-form" onSubmit={handleSubmit}>
        {/* Chỉ hiển thị nhập projectId nếu không có trên URL */}
        {!projectId && (
          <div className="form-group">
            <label htmlFor="taskProjectId">Mã Dự Án (Project ID) (*):</label>
            <input
              type="number"
              id="taskProjectId"
              placeholder="Nhập mã ID của dự án..."
              className="form-input"
              value={manualProjectId}
              onChange={(e) => setManualProjectId(e.target.value)}
              required
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="taskTitle">Tiêu Đề Nhiệm Vụ (*):</label>
          <input
            type="text"
            id="taskTitle"
            placeholder="Nhập tiêu đề nhiệm vụ"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="taskDescription">Mô Tả:</label>
          <textarea
            id="taskDescription"
            placeholder="Nhập mô tả chi tiết nhiệm vụ"
            className="form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="taskStatus">Trạng Thái:</label>
          <select
            id="taskStatus"
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
          >
            <option value="TODO">TODO (Cần làm)</option>
            <option value="IN_PROGRESS">IN_PROGRESS (Đang thực hiện)</option>
            <option value="COMPLETED">COMPLETED (Đã hoàn thành)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="taskPriority">Mức Ưu Tiên:</label>
          <select
            id="taskPriority"
            className="form-select"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          >
            <option value="LOW">LOW (Thấp)</option>
            <option value="MEDIUM">MEDIUM (Trung bình)</option>
            <option value="HIGH">HIGH (Cao)</option>
          </select>
        </div>

        <div className="task-form-row">
          <div className="form-group">
            <label htmlFor="taskHandlerId">Người Xử Lý (Handler):</label>
            <select
              id="taskHandlerId"
              className="form-select"
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

          <div className="form-group">
            <label htmlFor="taskCreatorId">Người Tạo (Creator):</label>
            <select
              id="taskCreatorId"
              className="form-select"
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

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() =>
              navigate(effectiveProjectId ? `/projects/${effectiveProjectId}/tasks` : '/projects')
            }
          >
            <span>Nhầm tí</span>
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Đang tạo...' : '+1 Task'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateTask;
