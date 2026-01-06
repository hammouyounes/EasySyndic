import React, { useState } from 'react';
import './Register.css'; // Reusing the same CSS file
import { FcGoogle } from 'react-icons/fc';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

import { useNavigate } from 'react-router-dom';
import { useLoginUserMutation } from '../../features/api/apiSlice';

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const navigate = useNavigate();
  const [loginUser] = useLoginUserMutation();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await loginUser({
        email: formData.email,
        motDePasse: formData.password
      }).unwrap();
      
      console.log('Login Successful:', user);
      // You might want to store the user in a context or global state here
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/');
    } catch (err) {
      console.error('Login Failed:', err);
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        {/* Left Side - Image Panel */}
        <div className="register-image-section">
          {/* Note: You can change the background image in CSS specifically for this page if needed, 
              or use inline style: style={{ backgroundImage: `url(...)` }} */}
          <div className="image-overlay">
            <div className="brand-logo">AMU</div>
            <a href="/" className="back-link">Back to website &rarr;</a>
            
            <div className="image-text">
              <h2>Welcome Back,<br />Continue your journey</h2>
              <div className="slider-dots">
                <span className="dot active"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form Panel */}
        <div className="register-form-section">
          <div className="form-header">
            <h2>Log in</h2>
            <p>Don't have an account? <a href="/register">Create one</a></p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input 
                type="email" 
                name="email" 
                placeholder="Email" 
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="input-group password-group">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                placeholder="Enter your password" 
                value={formData.password}
                onChange={handleChange}
              />
              <span className="password-toggle" onClick={togglePasswordVisibility}>
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
            </div>

            {/* Added Forgot Password Link */}
            <div style={{ textAlign: 'right', marginTop: '-10px', marginBottom: '20px' }}>
              <a href="/forgot-password" style={{ color: '#a1a1aa', fontSize: '0.85rem', textDecoration: 'none' }}>
                Forgot Password?
              </a>
            </div>

            <button type="submit" className="submit-btn">Log in</button>
          </form>

          <div className="divider">
            <span>Or log in with</span>
          </div>

          <div className="social-login">
            <button className="social-btn google">
              <FcGoogle size={20} style={{ marginRight: '10px' }} /> Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;