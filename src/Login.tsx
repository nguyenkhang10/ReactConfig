import React, { useState } from 'react';
import "./Login.css"; // file CSS riêng để style
import apiClient from './api/ConfigAxios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

  const handleSubmit = async (e) => {
     e.preventDefault();
        try {
            await apiClient.post('/api/auth/login', { username: email, password });
            alert('logged in successfully!');
        } catch (error) {
            console.error('Login failed:', error);
            alert(error.response?.data?.message || 'Login failed. Please check your credentials.');
        }
    };
  return (
    <div className="flex min-h-screen w-full font-sans">
      {/* Cột bên phải - Form Đăng nhập */}
      <div className="flex flex-1 items-center justify-center bg-[#FAFAFA] p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Chào mừng trở lại</h2>
            <p className="mt-2 text-sm text-gray-500">Đăng nhập để tiếp tục với TaskFlow.</p>
          </div>git remote add origin https://github.com/nguyenkhang10/ReactConfig.git
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                Email
              </label>
              <input
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ban@congty.vn"
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition duration-150 focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                Mật khẩu
              </label>
             {/* Password */}
                <div className="form-group">
                    <label htmlFor="password" className="form-label">Password:</label>
                    <div className="password-wrapper">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            className="form-input"
                            placeholder="Your secret password"
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
                            {showPassword ? '-' : '👁'}
                        </button>
                    </div>
                </div>
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-[#0052FF] py-3 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-blue-700 active:bg-blue-800"
            >
              Đăng nhập
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            Chưa có tài khoản?{' '}
            <a href="#signup" className="font-semibold text-[#0052FF] hover:underline">
              Đăng ký ngay
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;