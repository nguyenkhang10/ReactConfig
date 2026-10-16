import { useState } from 'react';
import './Login.css'; // file CSS riêng để style
import apiClient from './api/ConfigAxios';
import { useNavigate } from "react-router-dom";


const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const response: any = await apiClient.post('/api/auth/login', { username, password });
      console.log('Login response:', response);

      const token = response.token; // vì interceptor đã trả về response.data
      if (token) {
        localStorage.setItem('token', token);
        navigate("/projects"); // điều hướng sang trang /projects sau khi đăng nhập thành công

      } else {
        alert('Login failed: token not found');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      alert(error.response?.data?.message || 'Nooo login failed :((((');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h2 className="login-title">Heloo bro</h2>
          <p className="login-subtitle">Đăng nhập để tiếp tục với TaskFlow.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
            Username
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ban@congty.vn"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Mật khẩu
            </label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                id="togglePassword"
                aria-label="Toggle password visibility"
                title="Show/Hide Password"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-submit">
            Đăng nhập
          </button>
        </form>

        <p className="login-footer">
          Chưa có tài khoản?{' '}
          <a href="#signup" className="signup-link">
            Đăng ký ngay
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;