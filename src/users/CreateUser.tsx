import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUser } from '../api/userApi';
import './users.css';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema, type CreateUserForm } from '../schemas/userSchema';

function CreateUser() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: '',
      email: '',
      fullName: '',
      password: '',
      role: 'MEMBER',
      status: 'ACTIVE',
    },
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate('/users');
    },
  });

  const onSubmit = (data: CreateUserForm) => createMutation.mutate(data);

  const errorMessage = createMutation.isError
    ? (createMutation.error as any)?.response?.data?.message ||
      (createMutation.error as any)?.response?.data?.error ||
      'Có lỗi xảy ra khi tạo người dùng. Vui lòng kiểm tra lại thông tin.'
    : null;

  return (
    <div className="users-container">
      {/* Top Navbar */}
      <nav className="users-navbar">
        <div className="users-navbar-content">
          <a href="/projects" className="users-brand">
            <div className="users-brand-icon">TF</div>
            <span className="users-brand-name">TaskFlow</span>
            <span className="users-brand-badge">Users</span>
          </a>
          <div className="users-nav-actions">
            <button
              type="button"
              className="users-nav-link"
              onClick={() => navigate('/users')}
            >
              ← Danh sách người dùng
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="users-main">
        <div className="user-form-container">
          <div className="user-form-header">
            <div>
              <h2 className="user-form-title">Tạo Người Dùng Mới</h2>
              <p className="user-form-subtitle">
                Điền thông tin tài khoản người dùng mới và phân quyền trong hệ thống.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="user-alert error">
              ⚠️ {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Username & Email Row */}
            <div className="user-form-row">
              <div className="user-form-group">
                <label htmlFor="username">Tên tài khoản (Username) (*):</label>
                <input
                  type="text"
                  id="username"
                  placeholder="Nhập tên đăng nhập (3 - 60 ký tự)"
                  className={`user-form-input ${errors.username ? 'error' : ''}`}
                  {...register('username')}
                />
                {errors.username && (
                  <div className="user-field-error">⚠️ {errors.username.message}</div>
                )}
              </div>

              <div className="user-form-group">
                <label htmlFor="email">Email (*):</label>
                <input
                  type="email"
                  id="email"
                  placeholder="example@taskflow.com"
                  className={`user-form-input ${errors.email ? 'error' : ''}`}
                  {...register('email')}
                />
                {errors.email && (
                  <div className="user-field-error">⚠️ {errors.email.message}</div>
                )}
              </div>
            </div>

            {/* Full Name & Password Row */}
            <div className="user-form-row">
              <div className="user-form-group">
                <label htmlFor="fullName">Họ và tên (Full Name):</label>
                <input
                  type="text"
                  id="fullName"
                  placeholder="Nguyễn Văn A (tối đa 120 ký tự)"
                  className={`user-form-input ${errors.fullName ? 'error' : ''}`}
                  {...register('fullName')}
                />
                {errors.fullName && (
                  <div className="user-field-error">⚠️ {errors.fullName.message}</div>
                )}
              </div>

              <div className="user-form-group">
                <label htmlFor="password">Mật khẩu (*):</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Tối thiểu 6 ký tự"
                  className={`user-form-input ${errors.password ? 'error' : ''}`}
                  {...register('password')}
                />
                {errors.password && (
                  <div className="user-field-error">⚠️ {errors.password.message}</div>
                )}
              </div>
            </div>

            {/* Role & Status Row */}
            <div className="user-form-row">
              <div className="user-form-group">
                <label htmlFor="role">Vai trò (Role) (*):</label>
                <select
                  id="role"
                  className="user-form-select"
                  {...register('role')}
                >
                  <option value="MEMBER">MEMBER (Thành viên)</option>
                  <option value="MANAGER">MANAGER (Quản lý)</option>
                  <option value="ADMIN">ADMIN (Quản trị viên)</option>
                </select>
                {errors.role && (
                  <div className="user-field-error">⚠️ {errors.role.message}</div>
                )}
              </div>

              <div className="user-form-group">
                <label htmlFor="status">Trạng thái (*):</label>
                <select
                  id="status"
                  className="user-form-select"
                  {...register('status')}
                >
                  <option value="ACTIVE">ACTIVE (Hoạt động)</option>
                  <option value="INACTIVE">INACTIVE (Không hoạt động)</option>
                </select>
                {errors.status && (
                  <div className="user-field-error">⚠️ {errors.status.message}</div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="user-form-actions">
              <button
                type="button"
                className="btn-secondary-user"
                onClick={() => navigate('/users')}
                disabled={createMutation.isPending}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="btn-new-user"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Đang tạo...' : '+ Tạo người dùng'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreateUser;
