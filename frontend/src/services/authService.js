import axios from 'axios';
import crypto from 'crypto-js';

export class AuthService {
  // Client-side temporary key for initial password protection during transit
  static TRANSIT_KEY = process.env.REACT_APP_TRANSIT_KEY;

  // Base API URL - use environment variable if available
  static API_URL = `${process.env.REACT_APP_API_URL}`;

  // Axios instance with default config
  static axiosInstance = (() => {
    const instance = axios.create({
      baseURL: AuthService.API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: true // Important for CORS if using cookies
    });
    // Request interceptor
    instance.interceptors.request.use(
      config => {
        console.log('Request:', {
          url: config.url,
          method: config.method,
          headers: config.headers,
          // Log request body without sensitive data
          data: config.data ? {
            ...config.data,
            password: '[REDACTED]'
          } : undefined
        });
        return config;
      },
      error => {
        console.error('Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    instance.interceptors.response.use(
      response => {
        console.log('Response:', {
          status: response.status,
          headers: response.headers,
          data: response.data
        });
        return response;
      },
      error => {
        console.error('Response Error:', {
          message: error.message,
          response: error.response ? {
            status: error.response.status,
            data: error.response.data
          } : null
        });
        return Promise.reject(error);
      }
    );

    return instance;
  })();

  static async register(userData) {
    try {
      if (!this.TRANSIT_KEY) {
        throw new Error('Configuration error: TRANSIT_KEY is missing');
      }

      // Validate required fields
      const requiredFields = ['name', 'email', 'password'];
      for (const field of requiredFields) {
        if (!userData[field]) {
          throw new Error(`${field} is required`);
        }
      }

      // First, hash the password client-side before transmission
      const securePassword = this.securePasswordForTransit(userData.password);

      const response = await this.axiosInstance.post('/api/auth/register', {
        ...userData,
        password: securePassword
      });

      return response.data;
    } catch (error) {
      // Enhanced error handling
      if (error.response) {
        const errorMessage = error.response.data?.message ||
          error.response.data?.error ||
          'Registration failed';

        if (error.response.status === 409) {
          throw new Error('Email already exists');
        } else if (error.response.status === 400) {
          throw new Error(errorMessage);
        } else {
          throw new Error(`Registration failed: ${errorMessage}`);
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw new Error('Unable to reach the server. Please check your internet connection.');
      } else {
        console.error('Error setting up request:', error.message);
        throw new Error(error.message || 'An unexpected error occurred');
      }
    }
  }

  static async login(credentials) {
    try {
      if (!this.TRANSIT_KEY) {
        console.error('TRANSIT_KEY is not set in environment variables');
        throw new Error('Configuration error: TRANSIT_KEY is missing');
      }

      // Validate required fields
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }

      // Secure password for transit
      const securePassword = this.securePasswordForTransit(credentials.password);
      
      const response = await this.axiosInstance.post('/api/auth/login', {
        email: credentials.email,
        password: securePassword
      });
      
      if (response.data.token) {
        // Store auth token
        localStorage.setItem('token', response.data.token);
        
        // Update axios instance headers for subsequent requests
        this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      
      return response.data;
    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           'Login failed';
                           
        if (error.response.status === 401) {
          throw new Error('Invalid email or password');
        } else if (error.response.status === 400) {
          throw new Error(errorMessage);
        } else {
          throw new Error(`Login failed: ${errorMessage}`);
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        throw new Error('Unable to reach the server. Please check your internet connection.');
      } else {
        console.error('Error setting up request:', error.message);
        throw new Error(error.message || 'An unexpected error occurred');
      }
    }
  }

  static async logout() {
    try {
      // Clear token from localStorage
      localStorage.removeItem('token');

      // Clear Authorization header
      delete this.axiosInstance.defaults.headers.common['Authorization'];

      // Optional: Call logout endpoint if your backend requires it
      await this.axiosInstance.post('logout');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('token');
      delete this.axiosInstance.defaults.headers.common['Authorization'];
    }
  }

  // Initial protection for password during transit
  static securePasswordForTransit(password) {
    try {
      if (!this.TRANSIT_KEY) {
        throw new Error('TRANSIT_KEY is not configured');
      }

      // Ensure password is a string
      const passwordStr = String(password);
      
      // Add some basic validation
      if (passwordStr.length < 1) {
        throw new Error('Password cannot be empty');
      }

      // Use base64 encoding for more reliable transmission
      const encrypted = crypto.AES.encrypt(passwordStr, this.TRANSIT_KEY).toString();
      
      return encrypted;
    } catch (error) {
      console.error('Error encrypting password:', error);
      throw new Error('Failed to secure password for transit');
    }
  }

  // Helper method to check if user is logged in
  static isLoggedIn() {
    return !!localStorage.getItem('token');
  }

  // Helper method to get current auth token
  static getToken() {
    return localStorage.getItem('token');
  }
  static async verifyEmail(token) {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/verify-email/${token}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
  static async resendVerification(email) {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/resend-verification`, { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }





  static async adminLogin(credentials) {
    try {
      
      const TRANSIT_KEY = process.env.REACT_APP_TRANSIT_KEY;
  
      if (!credentials.username || !credentials.password) {
        throw new Error('Username and password are required');
      }

      // Encrypt password
      const securePassword = (() => {
        try {
          const passwordStr = String(credentials.password);
          
  
          const encrypted = crypto.AES.encrypt(passwordStr, TRANSIT_KEY).toString();

  
          return encrypted;
        } catch (error) {
          console.error('Encryption error:', error);
          throw new Error('Failed to secure password for transit');
        }
      })();
  
  
      const response = await this.axiosInstance.post('/api/auth/admin-login', {
        username: credentials.username,
        password: securePassword,
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }

      return response.data;
    } catch (error) {
      console.error('Admin login error:', error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  static async verifyOTP(username, otp) {
    
    try {
        const verifyResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/verify-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, otp })
        });

        
        const verifyData = await verifyResponse.json();
        
        if (!verifyResponse.ok) {
            throw new Error(verifyData.message || 'OTP verification failed');
        }

        localStorage.setItem('token', verifyData.token);
        localStorage.setItem('user', JSON.stringify(verifyData.admin));

        return verifyData;
    } catch (error) {
        console.error('OTP verification error:', error);
        throw error;
    }
}

static async verifyUserOTP(email, otp) {
    
  try {
      const verifyResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/verify-user-otp`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, otp })
      });

      
      const verifyData = await verifyResponse.json();
      
      if (!verifyResponse.ok) {
          throw new Error(verifyData.message || 'OTP verification failed');
      }

      localStorage.setItem('token', verifyData.token);
      localStorage.setItem('user', JSON.stringify(verifyData.user));

      return verifyData;
  } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
  }
}
  
}