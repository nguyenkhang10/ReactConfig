import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUser } from '../api/userApi';
import type { CreateUserRequest, UserRole, UserStatus } from '../api/userApi';
import './users.css';

interface FormErrors {
  username?: string;
  email?: string;
  fullName?: string;
  password?: string;
  role?: string;
  status?: string;
}

function CreateUser() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CreateUserRequest>({
    username: '',
    email: '',
    fullName: '',
    password: '',
    role: 'MEMBER',
    status: 'ACTIVE',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate username: required, min 3, max 60
    if (!formData.username.trim()) {
      newErrors.username = 'Tên tài khoản (username) là bắt buộc.';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Tên tài khoản phải có ít nhất 3 ký tự.';
    } else if (formData.username.trim().length > 60) {
      newErrors.username = 'Tên tài khoản không được vượt quá 60 ký tự.';
    }

    // Validate email: required, email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Định dạng email không hợp lệ.';
    }

    // Validate fullName: max 120
    if (formData.fullName && formData.fullName.length > 120) {
      newErrors.fullName = 'Họ và tên không được vượt quá 120 ký tự.';
    }

    // Validate password: required, min 6
    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear individual field error on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      const payload: CreateUserRequest = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        fullName: formData.fullName ? formData.fullName.trim() : '',
        password: formData.password,
        role: formData.role as UserRole,
        status: formData.status as UserStatus,
      };

      await createUser(payload);
      navigate('/users');
    } catch (error: any) {
      console.error('Error creating user:', error);
      const backendMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Có lỗi xảy ra khi tạo người dùng. Vui lòng kiểm tra lại thông tin.';
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

          <form onSubmit={handleSubmit}>
            {/* Username & Email Row */}
            <div className="user-form-row">
              <div className="user-form-group">
                <label htmlFor="username">Tên tài khoản (Username) (*):</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Nhập tên đăng nhập (3 - 60 ký tự)"
                  className={`user-form-input ${errors.username ? 'error' : ''}`}
                  value={formData.username}
                  onChange={handleChange}
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
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                {errors.email && (
                  <div className="user-field-error">⚠️ {errors.email}</div>
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
                  name="fullName"
                  placeholder="Nguyễn Văn A (tối đa 120 ký tự)"
                  className={`user-form-input ${errors.fullName ? 'error' : ''}`}
                  value={formData.fullName}
                  onChange={handleChange}
                />
                {errors.fullName && (
                  <div className="user-field-error">⚠️ {errors.fullName}</div>
                )}
              </div>

              <div className="user-form-group">
                <label htmlFor="password">Mật khẩu (*):</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Tối thiểu 6 ký tự"
                  className={`user-form-input ${errors.password ? 'error' : ''}`}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                {errors.password && (
                  <div className="user-field-error">⚠️ {errors.password}</div>
                )}
              </div>
            </div>

            {/* Role & Status Row */}
            <div className="user-form-row">
              <div className="user-form-group">
                <label htmlFor="role">Vai trò (Role) (*):</label>
                <select
                  id="role"
                  name="role"
                  className="user-form-select"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="MEMBER">MEMBER (Thành viên)</option>
                  <option value="MANAGER">MANAGER (Quản lý)</option>
                  <option value="ADMIN">ADMIN (Quản trị viên)</option>
                </select>
              </div>

              <div className="user-form-group">
                <label htmlFor="status">Trạng thái (*):</label>
                <select
                  id="status"
                  name="status"
                  className="user-form-select"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="ACTIVE">ACTIVE (Hoạt động)</option>
                  <option value="INACTIVE">INACTIVE (Không hoạt động)</option>
                </select>
              </div>
            </div>

            {/* Actions */}
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
                disabled={submitting}
              >
                {submitting ? 'Đang tạo...' : '+ Tạo người dùng'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreateUser;
