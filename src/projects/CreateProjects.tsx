import './createProjects.css';
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createProject } from '../api/projectsApi';
import { getUsers } from '../api/userApi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema, type ProjectForm } from '../schemas/projectSchema';


function CreateProjects() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<ProjectForm>({
  resolver: zodResolver(projectSchema),
  defaultValues: {
    name: '',
    description: '',
    status: 'PLANNING',
    owner: '',
    startDate: '',
    dueDate: '',
  },
});


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

  const onSubmit = (data: ProjectForm) => createMutation.mutate(data);

  return (
    <div className="create-projects-container">
      <h2 className="create-projects-title">Tạo Dự Án Mới</h2>
      <form className="create-projects-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-group">
          <label htmlFor="projectName">Tên Dự Án:</label>
          <input
            type="text"
            id="projectName"
            placeholder="Nhập tên dự án"
            className="form-input"
            {...register('name')}
          />  
          {errors.name && <span className="form-error">{errors.name.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="projectDescription">Mô Tả:</label>
          <textarea
            id="projectDescription"
            placeholder="Nhập mô tả dự án"
            className="form-textarea"
            {...register('description')}
          ></textarea>
          {errors.description && <span className="form-error">{errors.description.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="projectStatus">Trạng Thái:</label>
          <select id="projectStatus" className="form-select" 
          {...register('status')}
          >
            <option value="PLANNING">Planning</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          {errors.status && <span className="form-error">{errors.status.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="projectOwner">Chủ Nhiệm (Owner) (*):</label>
          <select
            id="projectOwner"
            className="form-select"
          {...register('owner')}
          >
            <option value="">-- Chọn chủ nhiệm dự án --</option>
            {users.map((u) => (
              <option key={u.id} value={u.fullName || u.username}>
                {u.fullName ? `${u.fullName} (@${u.username})` : `@${u.username}`}
              </option>
            ))}
          </select>
          {errors.owner && <span className="form-error">{errors.owner.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="projectStartDate">Ngày Bắt Đầu:</label>
          <input type="date" id="projectStartDate" className="form-input"
          {...register('startDate')}
          />
          {errors.startDate && <span className="form-error">{errors.startDate.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="projectDeadline">Hạn Chót:</label>
          <input type="date" id="projectDeadline" className="form-input"
          {...register('dueDate')}
          />
          {errors.dueDate && <span className="form-error">{errors.dueDate.message}</span>}
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