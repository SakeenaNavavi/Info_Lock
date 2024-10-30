import React, { useState } from 'react';
import { Shield} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/styles.css';
const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Add login logic here
      console.log('Form submitted:', formData);
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
                  <h4 className="text-light">Welcome back!</h4>
                  <p className="text-light">Please login to your account</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label text-light">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      className={`form-control bg-dark text-light border-secondary ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-light">Password</label>
                    <input
                      type="password"
                      name="password"
                      className={`form-control bg-dark text-light border-secondary ${errors.password ? 'is-invalid' : ''}`}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                  </div>

                  <div className="d-flex align-items-center mb-3">
                    <a href="#" className="text-primary text-decoration-none">Forgot Password?</a>
                  </div>

                  <button type="submit" className="btn btn-primary w-100 mb-3">
                    Sign In
                  </button>

                  <div className="text-center text-light">
                    Don't have an account? <a href="/register" className="text-primary text-decoration-none">Sign up</a>
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
export default LoginPage;