import { Shield } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const RegisterPage = () => {
  const navigate = useNavigate();
    // const [formData, setFormData] = useState({
    //   name: '',
    //   email: '',
    //   phoneno: '',
    //   password: '',
    //   confirmPassword: ''
    // });
  
    // const handleSubmit = (e) => {
    //   e.preventDefault();
    //   // Add registration logic here
    // };
  
    return (
      <div className="bg-custom-gradient min-vh-100 bg-dark d-flex align-items-center py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="card bg-dark border-secondary">
                <div className="card-body p-4">
                  <div className="text-center mb-4">
                    <Shield className="text-primary mb-2" size={32} onClick={() => navigate('/')}/>
                    <h4 className="text-light">Create Account</h4>
                    <p className="text-light">Get started with InfoLock</p>
                  </div>
  
                  <form>
                    <div className="mb-3">
                      <label className="form-label text-light">Full Name</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-light border-secondary"
                        placeholder="Enter your name"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label text-light">Contact Number</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-light border-secondary"
                        placeholder="Enter your Contact Number"
                        required
                      />
                    </div>
  
                    <div className="mb-3">
                      <label className="form-label text-light">Email Address</label>
                      <input
                        type="email"
                        className="form-control bg-dark text-light border-secondary"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
  
                    <div className="mb-3">
                      <label className="form-label text-light">Password</label>
                      <input
                        type="password"
                        className="form-control bg-dark text-light border-secondary"
                        placeholder="Create a password"
                        required
                      />
                    </div>
  
                    <div className="mb-4">
                      <label className="form-label text-light">Confirm Password</label>
                      <input
                        type="password"
                        className="form-control bg-dark text-light border-secondary"
                        placeholder="Confirm your password"
                        required
                      />
                    </div>
  
                    <button type="submit" className="btn btn-primary w-100 mb-3">
                      Create Account
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