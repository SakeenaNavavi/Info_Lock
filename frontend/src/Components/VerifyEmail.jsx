// Frontend: Create a new component VerifyEmail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { AuthService } from '../services/authService';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await AuthService.verifyEmail(token);
        setStatus('success');
        // Automatically redirect to login after 5 seconds
        setTimeout(() => {
          navigate('/login');
        }, 5000);
      } catch (error) {
        setStatus('error');
        setError(error.response?.data?.message || 'Verification failed. Please try again.');
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate]);

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <>
            <h4 className="text-light mb-3">Verifying Your Email</h4>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </>
        );
      case 'success':
        return (
          <>
            <h4 className="text-light mb-3">Email Verified Successfully!</h4>
            <p className="text-light mb-4">
              Your email has been verified. You will be redirected to the login page in 5 seconds.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/login')}
            >
              Go to Login
            </button>
          </>
        );
      case 'error':
        return (
          <>
            <h4 className="text-light mb-3">Verification Failed</h4>
            <p className="text-danger mb-4">{error}</p>
            <button
              className="btn btn-primary mb-3"
              onClick={() => navigate('/register')}
            >
              Return to Registration
            </button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-custom-gradient min-vh-100 bg-dark d-flex align-items-center py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card bg-dark border-secondary">
              <div className="card-body p-4 text-center">
                <Shield className="text-primary mb-3" size={48} />
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
