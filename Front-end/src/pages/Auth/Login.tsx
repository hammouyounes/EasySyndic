import React, { useState, useEffect } from 'react';
import './Register.css'; // Reusing the same CSS file

import bg1 from '../../assets/login-bg.png';
import bg2 from '../../assets/login-bg-2.png';
import bg3 from '../../assets/login-bg-3.png';

import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

import { useNavigate } from 'react-router-dom';
import { useLoginUserMutation } from '../../features/api/apiSlice';

const Login: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [bg1, bg2, bg3];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const navigate = useNavigate();
  const [loginUser, { isLoading }] = useLoginUserMutation();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setErrorMessage(''); // Clear error when user types
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const user = await loginUser({
        email: formData.email,
        motDePasse: formData.password
      }).unwrap();

      console.log('Login Successful:', user);
      localStorage.setItem('user', JSON.stringify(user));

      const userRole = user.role ? user.role.toLowerCase() : '';

      if (userRole === 'admin') {
        navigate('/');
      } else if (userRole === 'proprietaire') {
        navigate('/proprietaire');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('Login Failed:', err);
      // Extract the error message from RTK Query error
      const message = err?.data?.message || err?.error || 'Login failed. Please check your credentials.';
      setErrorMessage(message);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div
          className="register-image-section"
          style={{
            backgroundImage: `url(${images[currentImageIndex]})`,
            transition: 'background-image 0.5s ease-in-out'
          }}
        >
          <div className="image-overlay">
            <div className="brand-logo">Easy Syndic</div>
            {/* <a href="/" className="back-link">Back to website &rarr;</a> */}

            <div className="image-text">
              <h2>Simplifiez la gestion<br />de votre copropriété</h2>
              <div className="slider-dots">
                {images.map((_, index) => (
                  <span
                    key={index}
                    className={`dot ${currentImageIndex === index ? 'active' : ''}`}
                  ></span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="register-form-section">
          <div className="form-header">
            <h2>Log in</h2>
            <br />
            {/* <p>Don't have an account? <a href="/register">Create one</a></p> */}
          </div>

          <form onSubmit={handleSubmit}>
            {errorMessage && (
              <div style={{
                background: '#ff4d4f20',
                border: '1px solid #ff4d4f',
                color: '#ff4d4f',
                padding: '10px 15px',
                borderRadius: '8px',
                marginBottom: '15px',
                fontSize: '0.9rem',
                textAlign: 'center'
              }}>
                {errorMessage}
              </div>
            )}
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

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Log in'}
            </button>
          </form>


        </div>
      </div>
    </div>
  );
};

export default Login;