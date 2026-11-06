import { useState } from 'react';
import './Login.css'; // file CSS riêng để style
import apiClient from './api/ConfigAxios';
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from './store/hooks';
import { loginSuccess } from './store/authSlice';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginForm } from './schemas/loginSchema';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const onSubmit = async (data: LoginForm) => {
    try {
      const response: any = await apiClient.post('/api/auth/login', data);
      console.log('Login response:', response);

      const token = response.token; // vì interceptor đã trả về response.data
      if (token) {
        dispatch(loginSuccess({ token, username: data.username }));
        navigate("/projects"); // điều hướng sang trang /projects sau khi đăng nhập thành công

      } else {
        setError('root', { message: 'Login failed: token not found.' });
      }
    } catch (error: any) {
      setError('root', {
        message: error.response?.data?.message || 'Login failed. Please check your credentials.',
      });
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h2 className="login-title">Heloo bro</h2>
          <p className="login-subtitle">Đăng nhập để tiếp tục với TaskFlow.</p>
        </div>
        {errors.root && <div className="form-error-banner">⚠️ {errors.root.message}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="login-form" noValidate>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="ban@congty.vn"
              className={`form-input ${errors.username ? 'has-error' : ''}`}
              {...register('username')}
            />
            {errors.username && <span className="form-error">{errors.username.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Mật khẩu
            </label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className={`form-input ${errors.password ? 'has-error' : ''}`}
                {...register('password')}
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
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>

          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
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