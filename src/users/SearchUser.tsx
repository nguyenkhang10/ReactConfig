import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchUsers } from '../api/userApi';
import type { User, UserRole } from '../api/userApi';
import './users.css';

const ROLE_OPTIONS: Array<{ label: string; value: string }> = [
  { label: 'Tất cả vai trò', value: '' },
  { label: 'ADMIN (Quản trị viên)', value: 'ADMIN' },
  { label: 'MANAGER (Quản lý)', value: 'MANAGER' },
  { label: 'MEMBER (Thành viên)', value: 'MEMBER' },
];

function SearchUser() {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchSearchResults = useCallback(async (searchRole: string, searchKeyword: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await searchUsers({
        role: searchRole || undefined,
        keyword: searchKeyword.trim() || undefined,
      });
      setUsers(data);
    } catch (err: any) {
      console.error('Error searching users:', err);
      setErrorMessage('Không thể tìm kiếm người dùng. Vui lòng thử lại sau.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchSearchResults('', '');
  }, [fetchSearchResults]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSearchResults(role, keyword);
  };

  const handleReset = () => {
    setKeyword('');
    setRole('');
    fetchSearchResults('', '');
  };

  const handleQuickRoleClick = (roleValue: string) => {
    const nextRole = role === roleValue ? '' : roleValue;
    setRole(nextRole);
    fetchSearchResults(nextRole, keyword);
  };

  const getInitials = (name?: string, fallback = 'U') => {
    if (!name || !name.trim()) return fallback.substring(0, 2).toUpperCase();
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Chưa có';
    try {
      const d = new Date(isoString);
      return isNaN(d.getTime()) ? isoString : d.toLocaleDateString('vi-VN');
    } catch {
      return isoString;
    }
  };

  return (
    <div className="search-user-container">
      {/* Top Navbar */}
      <nav className="users-navbar">
        <div className="users-navbar-content">
          <a href="/projects" className="users-brand">
            <div className="users-brand-icon">TF</div>
            <span className="users-brand-name">TaskFlow</span>
            <span className="users-brand-badge">Search Users</span>
          </a>
          <div className="users-nav-actions">
            <button
              type="button"
              className="users-nav-link"
              onClick={() => navigate('/projects')}
            >
              📁 Dự án
            </button>
            <button
              type="button"
              className="users-nav-link"
              onClick={() => navigate('/users')}
            >
              👥 Danh sách người dùng
            </button>
            <button
              type="button"
              className="btn-new-user"
              onClick={() => navigate('/users/create')}
            >
              + Tạo người dùng
            </button>
          </div>
        </div>
      </nav>

      {/* Main Search Container */}
      <main className="search-user-main">
        <header className="users-header-wrapper" style={{ marginBottom: '24px' }}>
          <h1 className="users-page-title">
            <span>🔍</span> Tìm kiếm người dùng
          </h1>
          <p className="users-page-subtitle">
            Tra cứu và lọc tài khoản người dùng theo từ khóa (username, email, họ tên) và vai trò (role).
          </p>
        </header>

        {/* Filter Card Form */}
        <div className="search-user-filter-card">
          <form onSubmit={handleFormSubmit}>
            <div className="user-form-row">
              <div className="user-form-group">
                <label htmlFor="searchKeyword">Từ khóa tìm kiếm:</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    id="searchKeyword"
                    className="user-form-input"
                    placeholder="Nhập tên đăng nhập, email hoặc họ tên..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </div>
              </div>

              <div className="user-form-group">
                <label htmlFor="searchRole">Vai trò (Role):</label>
                <select
                  id="searchRole"
                  className="user-form-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick role filter chips */}
            <div className="quick-filter-chips">
              <span className="quick-filter-label">Lọc nhanh theo vai trò:</span>
              {(['ADMIN', 'MANAGER', 'MEMBER'] as UserRole[]).map((r) => (
                <button
                  type="button"
                  key={r}
                  className={`quick-role-chip ${role === r ? 'active' : ''}`}
                  onClick={() => handleQuickRoleClick(r)}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Form Actions */}
            <div className="user-form-actions" style={{ marginTop: '20px', paddingTop: '16px' }}>
              <button
                type="button"
                className="btn-secondary-user"
                onClick={handleReset}
              >
                Đặt lại
              </button>
              <button
                type="submit"
                className="btn-new-user"
                disabled={loading}
              >
                {loading ? 'Đang tìm...' : 'Tìm kiếm'}
              </button>
            </div>
          </form>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="user-alert error">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Results Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ fontSize: '15px', color: '#475569', fontWeight: 500 }}>
            Kết quả:{' '}
            <strong style={{ color: '#0052ff' }}>
              {users !== null ? users.length : '...'}
            </strong>{' '}
            người dùng
          </div>
        </div>

        {/* Results State */}
        {loading && users === null ? (
          <div className="users-empty-state">
            <div className="empty-user-icon">⏳</div>
            <h3 className="empty-user-title">Đang tải kết quả tìm kiếm...</h3>
          </div>
        ) : users && users.length > 0 ? (
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>ID</th>
                  <th style={{ minWidth: '180px' }}>Tài khoản (Username)</th>
                  <th style={{ minWidth: '220px' }}>Email</th>
                  <th style={{ minWidth: '180px' }}>Họ và tên</th>
                  <th style={{ width: '130px' }}>Vai trò</th>
                  <th style={{ width: '130px' }}>Trạng thái</th>
                  <th style={{ width: '140px' }}>Ngày tạo</th>
                  <th style={{ width: '150px', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <span className="user-id-badge">#{user.id}</span>
                    </td>
                    <td>
                      <div className="user-name-cell">
                        <div className="user-avatar-sm">
                          {getInitials(user.fullName || user.username)}
                        </div>
                        <span className="username">{user.username}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ color: '#475569' }}>{user.email}</span>
                    </td>
                    <td>
                      <strong>{user.fullName || '—'}</strong>
                    </td>
                    <td>
                      <span className={`user-role-pill ${user.role || 'MEMBER'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`user-status-pill ${user.status || 'ACTIVE'}`}>
                        <span className="user-status-dot" />
                        {user.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>
                        {formatDate(user.createdAt)}
                      </span>
                    </td>
                    <td>
                      <div className="user-actions-cell" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn-user-action edit"
                          onClick={() => navigate(`/users/edit/${user.id}`)}
                          title="Chỉnh sửa thông tin"
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          type="button"
                          className="btn-user-action delete"
                          onClick={() => navigate(`/users/delete/${user.id}`)}
                          title="Xóa người dùng"
                        >
                          🗑️ Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="users-empty-state">
            <div className="empty-user-icon">🔍</div>
            <h3 className="empty-user-title">Không tìm thấy người dùng</h3>
            <p className="empty-user-desc">
              Không có người dùng nào khớp với tiêu chí tìm kiếm
              {keyword ? ` từ khóa "${keyword}"` : ''}
              {role ? ` vai trò "${role}"` : ''}.
            </p>
            <button
              type="button"
              className="btn-secondary-user"
              onClick={handleReset}
            >
              Xem tất cả người dùng
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default SearchUser;
