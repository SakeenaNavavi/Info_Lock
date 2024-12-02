import React, { useState } from "react";
import { Shield, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../services/authService";
import ReCAPTCHA from "react-google-recaptcha";
import "../styles/styles.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setLoginError("");
  };

  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!otpSent) {
      // First step validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
      if (!formData.password) {
        newErrors.password = "Password is required";
      }
    } else {
      // OTP validation
      if (!formData.otp) {
        newErrors.otp = "OTP is required";
      } else if (formData.otp.length !== 6) {
        newErrors.otp = "OTP must be 6 digits";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!otpSent && !captchaValue) {
      setLoginError("Please complete the reCAPTCHA");
      return;
    }

    setIsLoading(true);
    setLoginError("");

    try {
      if (!otpSent) {
        // Initial login step
        await AuthService.login({
          email: formData.email,
          password: formData.password,
        });
        setOtpSent(true);
        alert("OTP has been sent to your email");
      } else {
        await AuthService.verifyUserOTP(formData.email, formData.otp);
        navigate("/dashboard");
      }
    } catch (error) {
      setLoginError(
        error.message || "Authentication failed. Please try again."
      );
    } finally {
      setIsLoading(false);
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
                  <Shield
                    className="text-primary mb-2 cursor-pointer"
                    size={32}
                    onClick={() => navigate("/")}
                  />
                  <h4 className="text-light">Welcome back!</h4>
                  <p className="text-light">
                    {otpSent
                      ? "Enter the OTP sent to your email"
                      : "Please login to your account"}
                  </p>
                </div>

                {loginError && (
                  <div
                    className="alert alert-danger d-flex align-items-center"
                    role="alert"
                  >
                    <AlertCircle className="me-2" size={18} />
                    {loginError}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {!otpSent ? (
                    <>
                      <div className="mb-3">
                        <label className="form-label text-light">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          className={`form-control bg-dark text-light border-secondary ${
                            errors.email ? "is-invalid" : ""
                          }`}
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={isLoading}
                        />
                        {errors.email && (
                          <div className="invalid-feedback">{errors.email}</div>
                        )}
                      </div>

                      <div className="mb-3">
                        <label className="form-label text-light">
                          Password
                        </label>
                        <input
                          type="password"
                          name="password"
                          className={`form-control bg-dark text-light border-secondary ${
                            errors.password ? "is-invalid" : ""
                          }`}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={handleChange}
                          disabled={isLoading}
                        />
                        {errors.password && (
                          <div className="invalid-feedback">
                            {errors.password}
                          </div>
                        )}
                      </div>

                      <div className="d-flex align-items-center mb-3">
                        <a
                          href="#"
                          className="text-primary text-decoration-none"
                        >
                          Forgot Password?
                        </a>
                      </div>

                      <div className="mb-3">
                        <ReCAPTCHA
                          sitekey="6LdrRXcqAAAAADT4_VrmwUrMuJEsECLez8LTXoSB"
                          onChange={handleCaptchaChange}
                          theme="dark"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="mb-3">
                      <label className="form-label text-light">Enter OTP</label>
                      <input
                        type="text"
                        name="otp"
                        className={`form-control bg-dark text-light border-secondary ${
                          errors.otp ? "is-invalid" : ""
                        }`}
                        placeholder="Enter 6-digit OTP"
                        value={formData.otp}
                        onChange={handleChange}
                        disabled={isLoading}
                        maxLength={6}
                      />
                      {errors.otp && (
                        <div className="invalid-feedback">{errors.otp}</div>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary w-100 mb-3"
                    disabled={isLoading}
                  >
                    {isLoading && (
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                    )}
                    {isLoading
                      ? otpSent
                        ? "Verifying..."
                        : "Signing In..."
                      : otpSent
                      ? "Verify OTP"
                      : "Sign In"}
                  </button>

                  {!otpSent && (
                    <div className="text-center text-light">
                      Don't have an account?{" "}
                      <a
                        href="/register"
                        className="text-primary text-decoration-none"
                      >
                        Sign up
                      </a>
                    </div>
                  )}
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
