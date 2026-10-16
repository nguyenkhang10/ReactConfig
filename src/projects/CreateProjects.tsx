import './createProjects.css';
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createProject } from '../api/projectsApi';
import { getUsers } from '../api/userApi';

function CreateProjects() {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectStatus, setProjectStatus] = useState('PLANNING');
  const [projectOwner, setProjectOwner] = useState('');
  const [projectStartDate, setProjectStartDate] = useState('');
  const [projectDeadline, setProjectDeadline] = useState('');
  const queryClient = useQueryClient();


  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      navigate("/projects");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: projectName,
      description: projectDescription,
      status: projectStatus,
      owner: projectOwner,
      startDate: projectStartDate,
      dueDate: projectDeadline,
    });
  };

  return (
    <div className="create-projects-container">
      <h2 className="create-projects-title">Tạo Dự Án Mới</h2>
      <form className="create-projects-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="projectName">Tên Dự Án:</label>
          <input
            type="text"
            id="projectName"
            placeholder="Nhập tên dự án"
            className="form-input"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="projectDescription">Mô Tả:</label>
          <textarea
            id="projectDescription"
            placeholder="Nhập mô tả dự án"
            className="form-textarea"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="projectStatus">Trạng Thái:</label>
          <select id="projectStatus" className="form-select" value={projectStatus} onChange={(e) => setProjectStatus(e.target.value)}>
            <option value="PLANNING">Planning</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="projectOwner">Chủ Nhiệm (Owner) (*):</label>
          <select
            id="projectOwner"
            className="form-select"
            value={projectOwner}
            onChange={(e) => setProjectOwner(e.target.value)}
            required
          >
            <option value="">-- Chọn chủ nhiệm dự án --</option>
            {users.map((u) => (
              <option key={u.id} value={u.fullName || u.username}>
                {u.fullName ? `${u.fullName} (@${u.username})` : `@${u.username}`}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="projectStartDate">Ngày Bắt Đầu:</label>
          <input type="date" id="projectStartDate" className="form-input"
            value={projectStartDate}
            onChange={(e) => setProjectStartDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="projectDeadline">Hạn Chót:</label>
          <input type="date" id="projectDeadline" className="form-input"
            value={projectDeadline}
            onChange={(e) => setProjectDeadline(e.target.value)}
          />
        </div>
        {createMutation.isError && (
          <p style={{ color: "#ef4444", margin: 0 }}>
            Không tạo được dự án. Vui lòng thử lại.
          </p>
        )}
        <div className="form-actions">
          <button type="button" className="btn btn-secondary"
            onClick={() => navigate("/projects")}>
            <span>Nhầm tí</span>
          </button>
          <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Đang tạo...' : '+1 Project'}
          </button>
        </div>
      </form>
    </div>
  );
}


export default CreateProjects;