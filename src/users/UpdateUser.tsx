import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserById, updateUser } from '../api/userApi';
import type { UpdateUserRequest } from '../api/userApi';
import './users.css';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateUserSchema, type UpdateUserForm } from '../schemas/userSchema';

function UpdateUser() {
  const { id: routeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [manualIdInput, setManualIdInput] = useState<string>(routeId || '');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // READ: load user data
  const { data: originalUser, isLoading, error: queryError } = useQuery({
    queryKey: ['user', routeId],
    queryFn: () => getUserById(routeId!),
    enabled: !!routeId,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { register, handleSubmit, formState: { errors } } = useForm<UpdateUserForm>({
    resolver: zodResolver(updateUserSchema),
    values: originalUser && {
      username: originalUser.username ?? '',
      email: originalUser.email ?? '',
      fullName: originalUser.fullName ?? '',
      password: '',
    },
  });

  // WRITE: update user
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      updateUser(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
      setSuccessMessage('Cập nhật người dùng thành công!');
      setTimeout(() => {
        navigate('/users');
      }, 1000);
    },
  });

  const handleManualLoad = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualIdInput.trim()) {
      navigate(`/users/edit/${manualIdInput.trim()}`);
    }
  };

  const onSubmit = (data: UpdateUserForm) => {
    if (!routeId) return;
    updateMutation.mutate({
      id: routeId,
      data: {
        username: data.username,
        email: data.email,
        fullName: data.fullName,
        ...(data.password ? { password: data.password } : {}),
      },
    });
  };

  // Derive error message
  let errorMessage: string | null = null;
  if (updateMutation.isError) {
    errorMessage =
      (updateMutation.error as any)?.response?.data?.message ||
      (updateMutation.error as any)?.response?.data?.error ||
      'Có lỗi xảy ra khi cập nhật người dùng. Vui lòng thử lại.';
  } else if (queryError) {
    errorMessage =
      (queryError as any)?.response?.status === 404
        ? `Không tìm thấy người dùng với ID #${routeId}.`
        : 'Không thể tải thông tin người dùng. Vui lòng kiểm tra lại ID.';
  }

  const userId = routeId || '';

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
              <h2 className="user-form-title">Cập Nhật Người Dùng</h2>
              <p className="user-form-subtitle">
                Chỉnh sửa thông tin tài khoản người dùng theo chuẩn hệ thống.
              </p>
            </div>
            {userId && <span className="users-count-pill">User #{userId}</span>}
          </div>

          {/* Lookup bar if accessed without route ID */}
          {!routeId && (
            <form
              onSubmit={handleManualLoad}
              style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '24px',
              }}
            >
              <input
                type="number"
                className="user-form-input"
                placeholder="Nhập ID người dùng cần cập nhật..."
                value={manualIdInput}
                onChange={(e) => setManualIdInput(e.target.value)}
              />
              <button
                type="submit"
                className="btn-new-user"
                style={{ whiteSpace: 'nowrap' }}
              >
                Tải dữ liệu
              </button>
            </form>
          )}

          {/* Notifications */}
          {successMessage && <div className="user-alert success">✅ {successMessage}</div>}
          {errorMessage && <div className="user-alert error">⚠️ {errorMessage}</div>}

          {/* Readonly info for role & status */}
          {originalUser && (
            <div className="user-readonly-info">
              <div className="user-readonly-item">
                <span>Vai trò hiện tại:</span>
                <span className={`user-role-pill ${originalUser.role || 'MEMBER'}`}>
                  {originalUser.role}
                </span>
              </div>
              <div className="user-readonly-item">
                <span>Trạng thái:</span>
                <span className={`user-status-pill ${originalUser.status || 'ACTIVE'}`}>
                  <span className="user-status-dot" />
                  {originalUser.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                </span>
              </div>
              <div className="user-readonly-note">
                ℹ️ Lưu ý: Vai trò và Trạng thái được bảo lưu theo cấu hình phân quyền và không sửa đổi tại form này.
              </div>
            </div>
          )}

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              ⏳ Đang tải dữ liệu người dùng...
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Form edit only displays: username, email, fullName, password */}
              <div className="user-form-row">
                <div className="user-form-group">
                  <label htmlFor="username">Tên tài khoản (Username) (*):</label>
                  <input
                    type="text"
                    id="username"
                    placeholder="Nhập username"
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

              <div className="user-form-row">
                <div className="user-form-group">
                  <label htmlFor="fullName">Họ và tên (Full Name):</label>
                  <input
                    type="text"
                    id="fullName"
                    placeholder="Nguyễn Văn A"
                    className={`user-form-input ${errors.fullName ? 'error' : ''}`}
                    {...register('fullName')}
                  />
                  {errors.fullName && (
                    <div className="user-field-error">⚠️ {errors.fullName.message}</div>
                  )}
                </div>

                <div className="user-form-group">
                  <label htmlFor="password">Mật khẩu mới (Tùy chọn):</label>
                  <input
                    type="password"
                    id="password"
                    placeholder="Để trống nếu không thay đổi mật khẩu"
                    className={`user-form-input ${errors.password ? 'error' : ''}`}
                    {...register('password')}
                  />
                  {errors.password && (
                    <div className="user-field-error">⚠️ {errors.password.message}</div>
                  )}
                </div>
              </div>

              <div className="user-form-actions">
                <button
                  type="button"
                  className="btn-secondary-user"
                  onClick={() => navigate('/users')}
                  disabled={updateMutation.isPending}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn-new-user"
                  disabled={updateMutation.isPending || !userId}
                >
                  {updateMutation.isPending ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default UpdateUser;
