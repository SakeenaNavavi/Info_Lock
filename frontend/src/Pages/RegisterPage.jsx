import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/authService';
import '../styles/styles.css';
import zxcvbn from 'zxcvbn';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
const COMMON_PASSWORDS = ['password123', 'admin123', '12345678', 'qwerty123','abcdef123456','password1234'];

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneno: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState('');

  const validatePassword = (password) => {
    if (!PASSWORD_REGEX.test(password)) {
      return 'Password must be at least 12 characters long and contain uppercase, lowercase, number, and special character';
    }
    if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
      return 'This password is too common. Please choose a stronger password';
    }
    return '';
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0: return 'bg-danger';
      case 1: return 'bg-danger';
      case 2: return 'bg-warning';
      case 3: return 'bg-info';
      case 4: return 'bg-success';
      default: return 'bg-danger';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setRegistrationError(''); // Clear general registration error when user types

    if (name === 'password') {
      const result = zxcvbn(value);
      setPasswordStrength(result.score);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phoneno)) {
      newErrors.phoneno = 'Please enter a valid 10-digit phone number';
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      setRegistrationError('');

      try {
        // Remove confirmPassword before sending to API
        const { confirmPassword, ...registrationData } = formData;
        await AuthService.register(registrationData);
        
        // Automatically log in after successful registration
        const loginResponse = await AuthService.login({
          email: formData.email,
          password: formData.password
        });

        // Redirect to dashboard or wherever appropriate
        navigate('/dashboard');
      } catch (error) {
        console.error("Registration Error:", error.response || error.message);
        setRegistrationError(error.message || 'Registration failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="bg-custom-gradient min-vh-100 bg-dark d-flex align-items-center py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card bg-dark border-secondary">
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <Shield className="text-primary mb-2 cursor-pointer" size={32} onClick={() => navigate('/')}/>
                  <h4 className="text-light">Create Account</h4>
                  <p className="text-light">Get started with InfoLock</p>
                </div>

                {registrationError && (
                  <div className="alert alert-danger" role="alert">
                    {registrationError}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label text-light">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      className={`form-control bg-dark text-light border-secondary ${errors.name ? 'is-invalid' : ''}`}
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-light">Contact Number</label>
                    <input
                      type="text"
                      name="phoneno"
                      className={`form-control bg-dark text-light border-secondary ${errors.phoneno ? 'is-invalid' : ''}`}
                      placeholder="Enter your Contact Number"
                      value={formData.phoneno}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    {errors.phoneno && <div className="invalid-feedback">{errors.phoneno}</div>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-light">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      className={`form-control bg-dark text-light border-secondary ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-light">Password</label>
                    <input
                      type="password"
                      name="password"
                      className={`form-control bg-dark text-light border-secondary ${errors.password ? 'is-invalid' : ''}`}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="progress" style={{ height: '5px' }}>
                          <div
                            className={`progress-bar ${getPasswordStrengthColor()}`}
                            style={{ width: `${(passwordStrength + 1) * 25}%` }}
                          />
                        </div>
                        <small className="text-light mt-1">
                          Password strength: {['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][passwordStrength]}
                        </small>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="form-label text-light">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className={`form-control bg-dark text-light border-secondary ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary w-100 mb-3"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    ) : null}
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </button>

                  <div className="text-center text-light">
                    Already have an account? <a href="/login" className="text-primary text-decoration-none">Sign in</a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;