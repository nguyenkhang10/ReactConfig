import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById, updateUser } from '../api/userApi';
import type { User, UpdateUserRequest } from '../api/userApi';
import './users.css';

interface FormErrors {
  username?: string;
  email?: string;
  fullName?: string;
  password?: string;
}

function UpdateUser() {
  const { id: routeId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [userId, setUserId] = useState<string>(routeId || '');
  const [manualIdInput, setManualIdInput] = useState<string>(routeId || '');
  const [originalUser, setOriginalUser] = useState<User | null>(null);

  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchUserData = useCallback(async (idToFetch: string | number) => {
    if (!idToFetch) return;
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const data = await getUserById(idToFetch);
      if (data) {
        setOriginalUser(data);
        setUsername(data.username || '');
        setEmail(data.email || '');
        setFullName(data.fullName || '');
        setPassword('');
        setUserId(String(data.id || idToFetch));
      }
    } catch (err: any) {
      console.error('Error fetching user:', err);
      if (err?.response?.status === 404) {
        setErrorMessage(`Không tìm thấy người dùng với ID #${idToFetch}.`);
      } else {
        setErrorMessage('Không thể tải thông tin người dùng. Vui lòng kiểm tra lại ID.');
      }
      setOriginalUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (routeId) {
      fetchUserData(routeId);
    }
  }, [routeId, fetchUserData]);

  const handleManualLoad = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualIdInput.trim()) {
      navigate(`/users/edit/${manualIdInput.trim()}`);
      fetchUserData(manualIdInput.trim());
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate username: required, min 3, max 60
    if (!username.trim()) {
      newErrors.username = 'Tên tài khoản (username) là bắt buộc.';
    } else if (username.trim().length < 3) {
      newErrors.username = 'Tên tài khoản phải có ít nhất 3 ký tự.';
    } else if (username.trim().length > 60) {
      newErrors.username = 'Tên tài khoản không được vượt quá 60 ký tự.';
    }

    // Validate email: required, email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email là bắt buộc.';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Định dạng email không hợp lệ.';
    }

    // Validate fullName: max 120
    if (fullName && fullName.length > 120) {
      newErrors.fullName = 'Họ và tên không được vượt quá 120 ký tự.';
    }

    // Validate password: if provided, min 6
    if (password && password.length < 6) {
      newErrors.password = 'Mật khẩu mới nếu thay đổi phải có ít nhất 6 ký tự.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setErrorMessage('Chưa xác định ID người dùng để cập nhật.');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    // Backend UserUpdateRequest only permits: username, email, fullName, password
    const payload: UpdateUserRequest = {
      username: username.trim(),
      email: email.trim(),
      fullName: fullName.trim(),
      ...(password.trim() ? { password: password.trim() } : {}),
    };

    try {
      await updateUser(userId, payload);
      setSuccessMessage('Cập nhật người dùng thành công!');
      setTimeout(() => {
        navigate('/users');
      }, 1000);
    } catch (err: any) {
      console.error('Error updating user:', err);
      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Có lỗi xảy ra khi cập nhật người dùng. Vui lòng thử lại.';
      setErrorMessage(backendMsg);
    } finally {
      setSubmitting(false);
    }
  };

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

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              ⏳ Đang tải dữ liệu người dùng...
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Form edit only displays: username, email, fullName, password */}
              <div className="user-form-row">
                <div className="user-form-group">
                  <label htmlFor="username">Tên tài khoản (Username) (*):</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="Nhập username"
                    className={`user-form-input ${errors.username ? 'error' : ''}`}
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }));
                    }}
                    required
                  />
                  {errors.username && (
                    <div className="user-field-error">⚠️ {errors.username}</div>
                  )}
                </div>

                <div className="user-form-group">
                  <label htmlFor="email">Email (*):</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="example@taskflow.com"
                    className={`user-form-input ${errors.email ? 'error' : ''}`}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    required
                  />
                  {errors.email && (
                    <div className="user-field-error">⚠️ {errors.email}</div>
                  )}
                </div>
              </div>

              <div className="user-form-row">
                <div className="user-form-group">
                  <label htmlFor="fullName">Họ và tên (Full Name):</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    placeholder="Nguyễn Văn A"
                    className={`user-form-input ${errors.fullName ? 'error' : ''}`}
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                    }}
                  />
                  {errors.fullName && (
                    <div className="user-field-error">⚠️ {errors.fullName}</div>
                  )}
                </div>

                <div className="user-form-group">
                  <label htmlFor="password">Mật khẩu mới (Tùy chọn):</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Để trống nếu không thay đổi mật khẩu"
                    className={`user-form-input ${errors.password ? 'error' : ''}`}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                  />
                  {errors.password && (
                    <div className="user-field-error">⚠️ {errors.password}</div>
                  )}
                </div>
              </div>

              <div className="user-form-actions">
                <button
                  type="button"
                  className="btn-secondary-user"
                  onClick={() => navigate('/users')}
                  disabled={submitting}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn-new-user"
                  disabled={submitting || !userId}
                >
                  {submitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
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
