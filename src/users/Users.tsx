import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers } from '../api/userApi';
import type { User } from '../api/userApi';
import AppNavbar from '../components/AppNavbar';
import './users.css';

function Users() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[] | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);
        const data = await getUsers();
        setUsers(data);
      } catch (error: any) {
        console.error('Error fetching users:', error);
        setErrorMessage('Không thể tải danh sách người dùng. Vui lòng kiểm tra kết nối tới máy chủ.');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

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

  const filteredUsers = users
    ? users.filter(
        (u) =>
          u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.status?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="users-container">
      {/* Global Navigation Bar */}
      <AppNavbar />

      {/* Main Content */}
      <main className="users-main">
        <div className="users-header-wrapper">
          <div className="users-title-row">
            <div className="users-heading-group">
              <h1 className="users-page-title">
                Quản lý Người dùng
                {users && (
                  <span className="users-count-pill">
                    {users.length} tài khoản
                  </span>
                )}
              </h1>
              <p className="users-page-subtitle">
                Quản lý danh sách tài khoản, thông tin cá nhân và phân quyền hệ thống.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-secondary-user"
                onClick={() => navigate('/users/search')}
              >
                <span>🔍</span> Tìm kiếm nâng cao
              </button>
              <button
                type="button"
                className="btn-new-user"
                onClick={() => navigate('/users/create')}
              >
                <span>+</span> Tạo người dùng mới
              </button>
            </div>
          </div>

          {/* Quick Search Toolbar */}
          <div className="users-toolbar">
            <div className="users-search-box">
              <span className="users-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Tìm nhanh theo username, email, họ tên, vai trò..."
                className="users-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="user-alert error">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="users-table-wrapper" style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>⏳</div>
            <div style={{ fontWeight: 600, color: '#475569' }}>Đang tải danh sách người dùng...</div>
          </div>
        ) : filteredUsers.length > 0 ? (
          /* Users Table */
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>ID</th>
                  <th style={{ minWidth: '180px' }}>Tài khoản (Username)</th>
                  <th style={{ minWidth: '220px' }}>Email</th>
                  <th style={{ minWidth: '180px' }}>Họ và tên</th>
                  <th style={{ width: '130px' }}>Vai trò (Role)</th>
                  <th style={{ width: '130px' }}>Trạng thái</th>
                  <th style={{ width: '140px' }}>Ngày tạo</th>
                  <th style={{ width: '150px', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
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
          /* Empty State */
          <div className="users-empty-state">
            <div className="empty-user-icon">👥</div>
            <h3 className="empty-user-title">Không tìm thấy người dùng nào</h3>
            <p className="empty-user-desc">
              {searchTerm
                ? `Không có kết quả phù hợp với từ khóa "${searchTerm}". Vui lòng thử tìm kiếm khác.`
                : 'Hiện tại chưa có người dùng nào trong cơ sở dữ liệu.'}
            </p>
            {searchTerm ? (
              <button
                type="button"
                className="btn-new-user"
                onClick={() => setSearchTerm('')}
              >
                Xóa bộ lọc tìm kiếm
              </button>
            ) : (
              <button
                type="button"
                className="btn-new-user"
                onClick={() => navigate('/users/create')}
              >
                + Tạo người dùng đầu tiên
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Users;
