import { useNavigate, useLocation } from 'react-router-dom';
import './AppNavbar.css';

interface AppNavbarProps {
  /** Override the right-side slot (e.g. Đăng xuất button). Defaults to logout link. */
  rightSlot?: React.ReactNode;
}

const NAV_ITEMS = [
  { label: 'Dự án', icon: '📁', path: '/projects' },
  { label: 'Tasks', icon: '✅', path: '/tasks/search' },
  { label: 'Người dùng', icon: '👥', path: '/users' },
  { label: 'Cài đặt', icon: '⚙️', path: '/settings', disabled: true },
];

function AppNavbar({ rightSlot }: AppNavbarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  /** Returns true when the current path starts with the nav item's path */
  const isActive = (path: string) => {
    if (path === '/projects') return pathname === '/projects' || pathname.startsWith('/projects/') || pathname.startsWith('/get-project') || pathname.startsWith('/create-projects') || pathname.startsWith('/search-projects') || pathname.startsWith('/update-project') || pathname.startsWith('/delete-project');
    if (path === '/tasks/search') return pathname.startsWith('/tasks') || (pathname.includes('/tasks') && !pathname.endsWith('/projects'));
    if (path === '/users') return pathname.startsWith('/users');
    return pathname.startsWith(path);
  };

  return (
    <nav className="app-navbar">
      <div className="app-navbar-inner">
        {/* Brand */}
        <a href="/projects" className="app-navbar-brand">
          <div className="app-navbar-brand-icon">TF</div>
          <span className="app-navbar-brand-name">TaskFlow</span>
          <span className="app-navbar-brand-badge">Workspace</span>
        </a>

        {/* Center Navigation Links */}
        <div className="app-navbar-links">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              type="button"
              className={`app-nav-btn${isActive(item.path) ? ' active' : ''}${item.disabled ? ' disabled' : ''}`}
              onClick={() => !item.disabled && navigate(item.path)}
              title={item.disabled ? 'Tính năng đang phát triển' : item.label}
              disabled={item.disabled}
            >
              <span className="app-nav-btn-icon">{item.icon}</span>
              <span className="app-nav-btn-label">{item.label}</span>
              {item.disabled && <span className="app-nav-soon">Sớm</span>}
            </button>
          ))}
        </div>

        {/* Right Actions */}
        <div className="app-navbar-actions">
          {rightSlot ?? (
            <a href="/" className="app-nav-logout">
              Đăng xuất
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}

export default AppNavbar;
