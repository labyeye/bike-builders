import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const AdminLogin = () => {
    const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:2500/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      navigate("/admin/dashboard");
      
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };
  const handleLoginSuccess = (data) => {
  window.location.href = '/dashboard'; // or use react-router's navigate
};

  // Styles
  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    fontFamily: 'Roboto, Arial, sans-serif'
  };

  const cardStyle = {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden'
  };

  const headerStyle = {
    padding: '32px 24px 24px',
    textAlign: 'center'
  };

  const logoStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    backgroundColor: '#1976d2',
    borderRadius: '50%',
    marginBottom: '16px'
  };

  const titleStyle = {
    fontSize: '24px',
    fontWeight: '400',
    color: '#212121',
    margin: '0 0 4px 0'
  };

  const subtitleStyle = {
    fontSize: '14px',
    color: '#757575',
    margin: '0'
  };

  const formContainerStyle = {
    padding: '0 24px 24px'
  };

  const errorStyle = {
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#ffebee',
    borderLeft: '4px solid #f44336',
    borderRadius: '4px'
  };

  const errorTextStyle = {
    color: '#c62828',
    fontSize: '14px',
    margin: '0'
  };

  const fieldContainerStyle = {
    position: 'relative',
    marginBottom: '24px'
  };

  const inputStyle = {
    width: '100%',
    padding: '20px 12px 8px',
    border: '1px solid #e0e0e0',
    borderRadius: '4px 4px 0 0',
    backgroundColor: '#fafafa',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box'
  };

  const inputFocusStyle = {
    ...inputStyle,
    backgroundColor: '#ffffff',
    borderColor: '#1976d2',
    borderBottomWidth: '2px'
  };

  const labelStyle = {
    position: 'absolute',
    left: '12px',
    transition: 'all 0.2s ease',
    pointerEvents: 'none',
    color: '#757575'
  };

  const labelFloatStyle = {
    ...labelStyle,
    top: '8px',
    fontSize: '12px',
    color: '#1976d2'
  };

  const labelNormalStyle = {
    ...labelStyle,
    top: '16px',
    fontSize: '16px'
  };

  const iconStyle = {
    position: 'absolute',
    right: '12px',
    top: '16px',
    color: '#9e9e9e'
  };

  const eyeIconStyle = {
    position: 'absolute',
    right: '12px',
    top: '16px',
    color: '#9e9e9e',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0',
    transition: 'color 0.2s ease'
  };

  const forgotPasswordStyle = {
    textAlign: 'right',
    marginBottom: '24px'
  };

  const linkStyle = {
    fontSize: '14px',
    color: '#1976d2',
    textDecoration: 'none',
    fontWeight: '500',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'color 0.2s ease'
  };

  const buttonContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px'
  };

  const createAccountButtonStyle = {
    padding: '8px 24px',
    color: '#1976d2',
    fontWeight: '500',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s ease'
  };

  const submitButtonStyle = {
    padding: '8px 24px',
    backgroundColor: '#1976d2',
    color: '#ffffff',
    fontWeight: '500',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    opacity: isLoading ? 0.6 : 1
  };

  const submitButtonHoverStyle = {
    ...submitButtonStyle,
    backgroundColor: '#1565c0',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
  };

  const loadingSpinnerStyle = {
    width: '16px',
    height: '16px',
    border: '2px solid #ffffff',
    borderTop: '2px solid transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginRight: '8px'
  };

  const footerStyle = {
    textAlign: 'center',
    marginTop: '24px'
  };

  const footerLinksStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px'
  };

  const footerLinkStyle = {
    fontSize: '12px',
    color: '#757575',
    textDecoration: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: 'color 0.2s ease'
  };

  return (
    <div style={containerStyle}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      
      <div style={cardStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={logoStyle}>
            <Lock size={24} color="#ffffff" />
          </div>
          <h1 style={titleStyle}>Sign in</h1>
          <p style={subtitleStyle}>to continue to Admin Panel</p>
        </div>

        {/* Form */}
        <div style={formContainerStyle}>
          {error && (
            <div style={errorStyle}>
              <p style={errorTextStyle}>{error}</p>
            </div>
          )}

          <div>
            {/* Username Field */}
            <div style={fieldContainerStyle}>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField('')}
                required
                style={focusedField === 'username' ? inputFocusStyle : inputStyle}
                placeholder=" "
              />
              <label
                htmlFor="username"
                style={formData.username || focusedField === 'username' ? labelFloatStyle : labelNormalStyle}
              >
                Username
              </label>
              <div style={iconStyle}>
                <User size={20} />
              </div>
            </div>

            {/* Password Field */}
            <div style={fieldContainerStyle}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
                required
                style={focusedField === 'password' ? inputFocusStyle : inputStyle}
                placeholder=" "
              />
              <label
                htmlFor="password"
                style={formData.password || focusedField === 'password' ? labelFloatStyle : labelNormalStyle}
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={eyeIconStyle}
                onMouseEnter={(e) => e.target.style.color = '#616161'}
                onMouseLeave={(e) => e.target.style.color = '#9e9e9e'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Forgot Password Link */}
            <div style={forgotPasswordStyle}>
              <button
                type="button"
                style={linkStyle}
                onMouseEnter={(e) => e.target.style.color = '#1565c0'}
                onMouseLeave={(e) => e.target.style.color = '#1976d2'}
              >
                Forgot password?
              </button>
            </div>

            {/* Action Buttons */}
            <div style={buttonContainerStyle}>
              <button
                type="button"
                style={createAccountButtonStyle}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#e3f2fd'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Create account
              </button>
              
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                style={submitButtonStyle}
                onMouseEnter={(e) => !isLoading && Object.assign(e.target.style, submitButtonHoverStyle)}
                onMouseLeave={(e) => !isLoading && Object.assign(e.target.style, submitButtonStyle)}
              >
                {isLoading ? (
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <div style={loadingSpinnerStyle}></div>
                    Signing in
                  </div>
                ) : (
                  'Next'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default AdminLogin;