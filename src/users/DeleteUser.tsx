import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserById, deleteUser } from '../api/userApi';
import './users.css';

function DeleteUser() {
  const { id: routeId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [inputLookupId, setInputLookupId] = useState<string>(routeId || '');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // READ: load user to confirm
  const { data: user, isLoading, error: queryError } = useQuery({
    queryKey: ['user', routeId],
    queryFn: () => getUserById(routeId!),
    enabled: !!routeId,
    retry: false,
  });

  // WRITE: delete user
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setSuccessMessage(`Người dùng #${routeId} đã được xóa thành công.`);
      setTimeout(() => {
        navigate('/users');
      }, 1500);
    },
  });

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputLookupId.trim()) {
      navigate(`/users/delete/${inputLookupId.trim()}`);
    }
  };

  const handleDeleteConfirm = () => {
    if (!routeId) return;
    deleteMutation.mutate(routeId);
  };

  // Combine errors into one message
  let errorMessage: string | null = null;
  if (deleteMutation.isError) {
    errorMessage =
      (deleteMutation.error as any)?.response?.data?.message ||
      'Có lỗi xảy ra khi xóa người dùng. Vui lòng thử lại.';
  } else if (queryError) {
    errorMessage =
      (queryError as any)?.response?.status === 404
        ? `Không tìm thấy người dùng với ID #${routeId}.`
        : 'Không thể tải thông tin người dùng. Vui lòng thử lại.';
  }

  return (
    <div className="delete-user-container">
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

      {/* Main Confirmation Content */}
      <main className="delete-user-main">
        {/* Lookup bar if accessed without ID */}
        {!routeId && (
          <form
            onSubmit={handleLookupSubmit}
            style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '24px',
              backgroundColor: '#fff',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
            }}
          >
            <input
              type="number"
              className="user-form-input"
              placeholder="Nhập ID người dùng cần xóa..."
              value={inputLookupId}
              onChange={(e) => setInputLookupId(e.target.value)}
            />
            <button type="submit" className="btn-new-user" style={{ whiteSpace: 'nowrap' }}>
              Tìm người dùng
            </button>
          </form>
        )}

        {/* Alerts */}
        {successMessage && <div className="user-alert success">✅ {successMessage}</div>}
        {errorMessage && <div className="user-alert error">⚠️ {errorMessage}</div>}

        {isLoading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            ⏳ Đang tải thông tin người dùng...
          </div>
        )}

        {!isLoading && user && !deleteMutation.isSuccess && (
          <div className="delete-user-card">
            <div className="delete-user-banner">
              <div className="delete-user-icon">⚠️</div>
              <div>
                <h2>Xác nhận xóa người dùng</h2>
                <p>Hành động này không thể hoàn tác sau khi thực hiện.</p>
              </div>
            </div>

            <div className="delete-user-body">
              <div className="delete-user-preview">
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>
                  {user.fullName || user.username}{' '}
                  <span style={{ color: '#0052ff', fontSize: '14px' }}>#{user.id}</span>
                </h3>
                <p style={{ margin: 0, color: '#475569', fontSize: '14px' }}>
                  Tài khoản: <strong>@{user.username}</strong> — Email: <strong>{user.email}</strong>
                </p>

                <div className="delete-user-meta">
                  <span>
                    Vai trò:{' '}
                    <span className={`user-role-pill ${user.role || 'MEMBER'}`}>
                      {user.role}
                    </span>
                  </span>
                  <span>
                    Trạng thái:{' '}
                    <span className={`user-status-pill ${user.status || 'ACTIVE'}`}>
                      <span className="user-status-dot" />
                      {user.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </span>
                </div>
              </div>

              <div className="delete-user-warning">
                <strong>Lưu ý quan trọng:</strong> Khi người dùng bị xóa, tài khoản sẽ mất quyền đăng nhập
                và truy cập vào toàn bộ các dự án, tác vụ liên quan trong hệ thống.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                <button
                  type="button"
                  className="btn-secondary-user"
                  onClick={() => navigate('/users')}
                  disabled={deleteMutation.isPending}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  className="btn-user-action delete"
                  style={{ padding: '10px 20px', fontSize: '14px' }}
                  onClick={handleDeleteConfirm}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? 'Đang xóa...' : '🗑️ Xác nhận xóa người dùng'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default DeleteUser;
