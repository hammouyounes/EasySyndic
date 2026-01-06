import React, { useState } from 'react';
import './Register.css';
import { FcGoogle } from 'react-icons/fc'; // Google Icon
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'; // Eye Icons

import { useNavigate } from 'react-router-dom';
import { useAddUserMutation } from '../../features/api/apiSlice';

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    agreeToTerms: false,
  });

  const navigate = useNavigate();
  const [addUser] = useAddUserMutation();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agreeToTerms) {
      alert("Please agree to the terms and conditions.");
      return;
    }
    
    try {
      const newUser = {
        nom: formData.lastName,
        prenom: formData.firstName,
        email: formData.email,
        motDePasse: formData.password,
        role: "PROPRIETAIRE" // Default role
      };

      await addUser(newUser).unwrap();
      
      console.log('Registration Successful');
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      console.error('Registration Failed:', err);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        {/* Left Side - Image Panel */}
        <div className="register-image-section">
          <div className="image-overlay">
            <div className="brand-logo">Easy Syndic</div>
            <a href="/" className="back-link">Back to website &rarr;</a>
            
            <div className="image-text">
              <h2>Capturing Moments,<br />Creating Memories</h2>
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
            <h2>Create an account</h2>
            <p>Already have an account? <a href="/login">Log in</a></p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="name-row">
              <div className="input-group">
                <input 
                  type="text" 
                  name="firstName" 
                  placeholder="First name" 
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className="input-group">
                <input 
                  type="text" 
                  name="lastName" 
                  placeholder="Last name" 
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

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

            <div className="checkbox-group">
              <label>
                <input 
                  type="checkbox" 
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                />
                <span className="checkbox-custom"></span>
                I agree to the <a href="/terms">Terms & Conditions</a>
              </label>
            </div>

            <button type="submit" className="submit-btn">Create account</button>
          </form>

          <div className="divider">
            <span>Or register with</span>
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

export default Register;