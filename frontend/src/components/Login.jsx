
import React, { useState } from "react";
import {
  Cloud,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  FileText,
  BarChart3,
  Users,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("teacher@example.com");
  const [password, setPassword] = useState("Teacher@123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Invalid email or password");
      }

      /*
       * Save authentication information.
       *
       * Adapt these names if your backend returns
       * different JWT/user field names.
       */
      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
      }

      if (data.token) {
        localStorage.setItem("access_token", data.token);
      }

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      /*
       * If your backend returns role directly.
       */
      if (data.role) {
        localStorage.setItem("user_role", data.role);
      }

      if (onLogin) {
        onLogin(data);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  const useDemoTeacher = () => {
    setEmail("teacher@example.com");
    setPassword("Teacher@123");
    setError("");
  };

  return (
    <div className="login-page">

      {/* Decorative background */}
      <div className="login-bg-shape login-bg-shape-one"></div>
      <div className="login-bg-shape login-bg-shape-two"></div>

      <div className="login-container">

        {/* =====================================================
            LEFT BRANDING PANEL
        ====================================================== */}
        <section className="login-brand-panel">

          <div className="brand-top">
            <div className="brand-logo">
              <Cloud size={25} strokeWidth={2.5} />
            </div>

            <div>
              <h1>CloudClass</h1>
              <span>Assignment & Feedback Portal</span>
            </div>
          </div>

          <div className="brand-content">

            <div className="eyebrow">
              <span></span>
              CLOUD-BASED LEARNING PLATFORM
            </div>

            <h2>
              Smarter assignment
              <br />
              management.
            </h2>

            <p>
              A secure cloud platform for students and teachers to
              submit, review, grade and manage assignments from anywhere.
            </p>

            <div className="feature-list">

              <div className="feature-item">
                <div className="feature-icon">
                  <FileText size={19} />
                </div>
                <div>
                  <strong>Assignment Management</strong>
                  <span>Create, submit and track coursework.</span>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <BarChart3 size={19} />
                </div>
                <div>
                  <strong>Performance Tracking</strong>
                  <span>Monitor submissions and academic progress.</span>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">
                  <Users size={19} />
                </div>
                <div>
                  <strong>Teacher & Student Workflow</strong>
                  <span>One connected academic workspace.</span>
                </div>
              </div>

            </div>

          </div>

          <div className="brand-security">
            <ShieldCheck size={18} />
            <span>Protected by secure cloud infrastructure</span>
          </div>

        </section>

        {/* =====================================================
            RIGHT LOGIN PANEL
        ====================================================== */}
        <section className="login-form-panel">

          <div className="login-card">

            <div className="login-heading">

              <div className="login-icon">
                <Lock size={22} />
              </div>

              <div>
                <div className="login-label">
                  TEACHER PORTAL
                </div>

                <h2>Welcome back</h2>

                <p>
                  Sign in to access your teacher workspace.
                </p>
              </div>

            </div>

            {error && (
              <div className="login-error">
                <span>!</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* Email */}
              <div className="form-group">

                <label htmlFor="email">
                  Email address
                </label>

                <div className="input-wrapper">

                  <Mail size={19} />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />

                </div>

              </div>

              {/* Password */}
              <div className="form-group">

                <div className="password-label-row">
                  <label htmlFor="password">
                    Password
                  </label>

                  <button
                    type="button"
                    className="forgot-password"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="input-wrapper">

                  <Lock size={19} />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>

                </div>

              </div>

              {/* Sign in */}
              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="login-spinner"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={19} />
                  </>
                )}

              </button>

            </form>

            {/* Demo account */}
            <div className="demo-card">

              <div className="demo-header">

                <div className="demo-icon">
                  <ShieldCheck size={17} />
                </div>

                <div>
                  <strong>Demo Teacher Account</strong>
                  <span>Ready for local testing</span>
                </div>

              </div>

              <div className="demo-details">

                <div>
                  <span>Email</span>
                  <strong>teacher@example.com</strong>
                </div>

                <div>
                  <span>Password</span>
                  <strong>Teacher@123</strong>
                </div>

              </div>

              <button
                type="button"
                className="demo-button"
                onClick={useDemoTeacher}
              >
                Use demo account
              </button>

            </div>

            <div className="login-footer">
              <span>© 2026 CloudClass</span>
              <span>Secure Cloud-Based Learning Platform</span>
            </div>

          </div>

        </section>

      </div>

    </div>
  );
}

