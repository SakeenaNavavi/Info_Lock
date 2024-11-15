import React, { useState } from 'react';
import { Shield, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../Components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/Card';
import { AuthService } from '../services/authService';
import ReCAPTCHA from 'react-google-recaptcha';
import { useNavigate } from 'react-router-dom';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    otp: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [captchaValue, setCaptchaValue] = useState(null);
  const [otpSent, setOtpSent] = useState(false); // New state to track OTP step

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Admin username is required';
    if (!formData.password && !otpSent) newErrors.password = 'Password is required';
    if (!formData.otp && otpSent) newErrors.otp = 'OTP is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!captchaValue) {
      alert("Please complete the reCAPTCHA");
      return;
    }
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (!otpSent) {
        // Initial login request with username/password
        const securePassword = formData.password;
        const response = await AuthService.adminLogin({ username: formData.username, password: securePassword });
        alert("OTP sent to your email");
        setOtpSent(true); // Move to OTP step
      } else {
        // OTP verification step
        const response = await AuthService.verifyOTP(formData.username, formData.otp);
        alert("Login successful");
        navigate('/admin-dashboard');
      }
    } catch (error) {
      setLoginError(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="space-y-1 flex flex-col items-center">
            <Shield className="h-12 w-12 text-blue-500 mb-2" />
            <CardTitle className="text-2xl font-bold text-white">Admin Portal</CardTitle>
            <p className="text-slate-400 text-sm">Secure administrative access only</p>
          </CardHeader>
          <CardContent>
            {loginError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!otpSent && (
                <>
                  {/* Username Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Username</label>
                    <input
                      type="text"
                      name="username"
                      className={`w-full px-3 py-2 bg-slate-900 border ${errors.username ? 'border-red-500' : 'border-slate-700'} rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter admin username"
                      value={formData.username}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Password</label>
                    <input
                      type="password"
                      name="password"
                      className={`w-full px-3 py-2 bg-slate-900 border ${errors.password ? 'border-red-500' : 'border-slate-700'} rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter admin password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                  </div>
                </>
              )}

              {/* OTP Input Field - Shown Only When OTP Has Been Sent */}
              {otpSent && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">OTP Code</label>
                  <input
                    type="text"
                    name="otp"
                    className={`w-full px-3 py-2 bg-slate-900 border ${errors.otp ? 'border-red-500' : 'border-slate-700'} rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Enter OTP"
                    value={formData.otp}
                    onChange={handleChange}
                    disabled={isLoading}
                    maxLength={6}
                  />
                  {errors.otp && <p className="text-sm text-red-500">{errors.otp}</p>}
                </div>
              )}

              {/* reCAPTCHA for Additional Security */}
              {!otpSent && (
                <ReCAPTCHA
                  sitekey="6LdrRXcqAAAAADT4_VrmwUrMuJEsECLez8LTXoSB"
                  onChange={handleCaptchaChange}
                />
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authenticating...
                  </span>
                ) : otpSent ? 'Verify OTP' : 'Login to Admin Panel'}
              </button>

              <div className="text-center text-sm text-slate-400">
                <a href="/help" className="text-blue-400 hover:text-blue-300">Need help accessing the admin panel?</a>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLoginPage;
