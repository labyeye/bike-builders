import React, { useState } from "react";
import { User, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Logo.png";
const AdminLogin = ({ setUser }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("https://bike-builders-backend.vercel.app/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }
      // Set user state in App.js
      if (setUser && data.user) {
        setUser(data.user);
      }
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message || "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };
  const containerStyle = {
    minHeight: "100vh",
    backgroundImage:
      'url("https://wallpapers.com/images/hd/yamaha-yzf-4k-bike-4ex5oityodxw1tdv.jpg")',
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    fontFamily: "Roboto, Arial, sans-serif",
  };

  const cardStyle = {
    width: "100%",
    maxWidth: "420px",
    background: "rgba(247,247,247,0.2)",
    borderRadius: "12px",
    boxShadow: "0 8px 30px rgba(57,62,70,0.08), inset 0 1px 0 rgba(247,247,247,0.12)",
    backdropFilter: "blur(5px) saturate(120%)",
    WebkitBackdropFilter: "blur(10px) saturate(120%)",
    overflow: "hidden",
  };

  const headerStyle = {
    padding: "32px 24px 24px",
    textAlign: "center",
  };

  const logoStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "64px",
    height: "64px",
    backgroundColor: "transparent",
    borderRadius: "50%",
    marginBottom: "12px",
  };

  const titleStyle = {
    fontSize: "24px",
    fontWeight: "400",
    color: "#F7F7F7",
    margin: "0 0 4px 0",
  };

  const subtitleStyle = {
    fontSize: "14px",
    color: "#F7F7F7",
    margin: "0",
  };

  const formContainerStyle = {
    padding: "0 24px 24px",
  };

  const errorStyle = {
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "#EEEEEE",
    borderLeft: "4px solid #929AAB",
    borderRadius: "4px",
  };

  const errorTextStyle = {
    color: "#393E46",
    fontSize: "14px",
    margin: "0",
  };

  const fieldContainerStyle = {
    position: "relative",
    marginBottom: "24px",
  };

  const inputStyle = {
    width: "100%",
    padding: "20px 12px 8px",
    borderStyle: "solid",
    borderWidth: "1px",
    borderColor: "#EEEEEE",
    borderRadius: "4px 4px 0 0",
    backgroundColor: "#F7F7F7",
    fontSize: "16px",
    outline: "none",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
  };

  const inputFocusStyle = {
    ...inputStyle,
    backgroundColor: "#F7F7F7",
    borderColor: "#393E46",
    borderWidth: "2px",
  };

  const labelStyle = {
    position: "absolute",
    left: "12px",
    transition: "all 0.2s ease",
    pointerEvents: "none",
    color: "#929AAB",
  };

  const labelFloatStyle = {
    ...labelStyle,
    top: "8px",
    fontSize: "12px",
    color: "#393E46",
  };

  const labelNormalStyle = {
    ...labelStyle,
    top: "16px",
    fontSize: "16px",
  };

  const iconStyle = {
    position: "absolute",
    right: "12px",
    top: "16px",
    color: "#929AAB",
  };

  const eyeIconStyle = {
    position: "absolute",
    right: "12px",
    top: "16px",
    color: "#929AAB",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0",
    transition: "color 0.2s ease",
  };
  const buttonContainerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: "16px",
  };


  const submitButtonStyle = {
    padding: "8px 64px",
    backgroundColor: "#393E46",
    color: "#F7F7F7",
    fontWeight: "500",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(57,62,70,0.2)",
    opacity: isLoading ? 0.6 : 1,
  };

  const submitButtonHoverStyle = {
    ...submitButtonStyle,
    backgroundColor: "#393E46",
    boxShadow: "0 4px 8px rgba(57,62,70,0.3)",
  };

  const loadingSpinnerStyle = {
    width: "16px",
    height: "16px",
    border: "2px solid #F7F7F7",
    borderTop: "2px solid transparent",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginRight: "8px",
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
            <img
              src={logo}
              alt="Bike Builders"
              style={{ width: "56px", height: "56px", objectFit: "contain" }}
            />
          </div>
          <h1 style={titleStyle}>Sign in</h1>
          <p style={subtitleStyle}>to continue to Admin Panel</p>
        </div>

        {/* Form */}
        <div style={formContainerStyle}>
          <form onSubmit={handleSubmit} autoComplete="on">
            {error && (
              <div style={errorStyle}>
                <p style={errorTextStyle}>{error}</p>
              </div>
            )}
            {/* Username Field */}
            <div style={fieldContainerStyle}>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onFocus={() => setFocusedField("username")}
                onBlur={() => setFocusedField("")}
                required
                style={
                  focusedField === "username" ? inputFocusStyle : inputStyle
                }
                placeholder=" "
                autoComplete="username"
              />
              <label
                htmlFor="username"
                style={
                  formData.username || focusedField === "username"
                    ? labelFloatStyle
                    : labelNormalStyle
                }
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
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField("")}
                required
                style={
                  focusedField === "password" ? inputFocusStyle : inputStyle
                }
                placeholder=" "
                autoComplete="current-password"
              />
              <label
                htmlFor="password"
                style={
                  formData.password || focusedField === "password"
                    ? labelFloatStyle
                    : labelNormalStyle
                }
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={eyeIconStyle}
                onMouseEnter={(e) => (e.target.style.color = "#393E46")}
                onMouseLeave={(e) => (e.target.style.color = "#929AAB")}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div style={buttonContainerStyle}>
              
              <button
                type="submit"
                disabled={isLoading}
                style={submitButtonStyle}
                onMouseEnter={(e) =>
                  !isLoading &&
                  Object.assign(e.target.style, submitButtonHoverStyle)
                }
                onMouseLeave={(e) =>
                  !isLoading && Object.assign(e.target.style, submitButtonStyle)
                }
              >
                {isLoading ? (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={loadingSpinnerStyle}></div>
                    Signing in
                  </div>
                ) : (
                  "Log In"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
