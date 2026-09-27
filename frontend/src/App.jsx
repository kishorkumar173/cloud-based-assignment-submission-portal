import React, { useEffect, useState } from "react";
import "./login.css";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  FileCheck2,
  Users,
  BarChart3,
  Settings,
  UserCircle,
  LogOut,
  Bell,
  Search,
  ChevronDown,
  Plus,
  CalendarDays,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Eye,
  MoreHorizontal,
  ArrowRight,
  Cloud,
  Menu,
  X,
  FileText,
  ShieldCheck,
  Lock,
  Mail,
  Loader2,
  AlertTriangle,
  Check,
} from "lucide-react";

import "./styles.css";

/* =========================================================
   CONFIGURATION
========================================================= */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

/* =========================================================
   DEMO DATA
========================================================= */

const mockAssignments = [
  {
    id: 1,
    title: "Cloud Computing Architecture",
    course: "Cloud Computing",
    deadline: "Oct 05, 2026",
    submissions: "24/60",
    status: "Active",
  },
  {
    id: 2,
    title: "Serverless APIs",
    course: "Cloud Computing",
    deadline: "Oct 08, 2026",
    submissions: "18/60",
    status: "Active",
  },
  {
    id: 3,
    title: "Cloud Security",
    course: "Security",
    deadline: "Oct 12, 2026",
    submissions: "10/50",
    status: "Active",
  },
  {
    id: 4,
    title: "DevOps Pipeline",
    course: "DevOps",
    deadline: "Oct 18, 2026",
    submissions: "0/45",
    status: "Upcoming",
  },
  {
    id: 5,
    title: "Kubernetes Basics",
    course: "DevOps",
    deadline: "Oct 25, 2026",
    submissions: "0/45",
    status: "Upcoming",
  },
];

const recentSubmissions = [
  {
    student: "Rahul Sharma",
    assignment: "Cloud Architecture",
    course: "Cloud Computing",
    status: "Submitted",
    time: "Sep 26, 2026 10:42 AM",
  },
  {
    student: "Ananya Mehta",
    assignment: "Serverless APIs",
    course: "Cloud Computing",
    status: "Graded",
    time: "Sep 25, 2026 02:30 PM",
  },
  {
    student: "Kiran Patel",
    assignment: "Cloud Security",
    course: "Security",
    status: "Late",
    time: "Sep 24, 2026 09:15 AM",
  },
];

const upcomingDeadlines = [
  {
    title: "Cloud Architecture Assignment",
    course: "Cloud Computing",
    date: "Oct 05, 2026",
    remaining: "3 days",
  },
  {
    title: "Serverless APIs",
    course: "Cloud Computing",
    date: "Oct 08, 2026",
    remaining: "6 days",
  },
  {
    title: "Cloud Security",
    course: "Security",
    date: "Oct 12, 2026",
    remaining: "10 days",
  },
];

/* =========================================================
   API HELPER
========================================================= */

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("portal_token");

  const headers = {
    Accept: "application/json",
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.message ||
      `Request failed with status ${response.status}`;

    const error = new Error(message);
    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}

/* =========================================================
   MAIN APP
========================================================= */

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("portal_token");
    const storedUser = localStorage.getItem("portal_user");

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);

        setUser(parsedUser);
        setAuthenticated(true);
      } catch {
        localStorage.removeItem("portal_token");
        localStorage.removeItem("portal_user");
      }
    }

    setCheckingAuth(false);
  }, []);

  const handleLogin = (loginData) => {
    const loggedInUser = loginData?.user || loginData;

    setUser(loggedInUser);
    setAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("portal_token");
    localStorage.removeItem("portal_user");

    setUser(null);
    setAuthenticated(false);
  };

  if (checkingAuth) {
    return <LoadingScreen />;
  }

  if (!authenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const role = String(user?.role || "").toLowerCase();

  if (role === "student") {
    return (
      <StudentPortal
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  if (role !== "teacher") {
    return (
      <UnauthorizedScreen
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <TeacherPortal
      user={user}
      onLogout={handleLogout}
    />
  );
}

/* =========================================================
   LOADING SCREEN
========================================================= */

function LoadingScreen() {
  return (
    <div className="auth-loading-screen">
      <div className="auth-loading-card">
        <div className="loading-logo">
          <Cloud size={28} />
        </div>

        <Loader2
          size={28}
          className="loading-spinner"
        />

        <h3>CloudClass</h3>
        <p>Loading your workspace...</p>
      </div>
    </div>
  );
}

/* =========================================================
   LOGIN
========================================================= */

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      /*
       * FastAPI OAuth2 login endpoints commonly expect:
       *
       * username=email
       * password=password
       *
       * Therefore we first try form-urlencoded.
       */

      const formData = new URLSearchParams();

      formData.append("username", email);
      formData.append("password", password);

      let response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: formData,
        }
      );

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      /*
       * Fallback for a JSON login implementation.
       */

      if (!response.ok) {
        response = await fetch(
          `${API_BASE_URL}/api/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              email,
              password,
            }),
          }
        );

        try {
          data = await response.json();
        } catch {
          data = null;
        }
      }

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            "Invalid email or password."
        );
      }

      /*
       * Different backend implementations may call
       * the JWT field access_token or token.
       */

      const token =
        data?.access_token ||
        data?.token ||
        data?.accessToken;

      if (!token) {
        throw new Error(
          "Login succeeded, but the server did not return an authentication token."
        );
      }

      let loggedInUser =
        data?.user ||
        data?.user_data ||
        data?.profile ||
        null;

      /*
       * If backend doesn't return user information,
       * decode the JWT payload only to obtain UI information.
       *
       * IMPORTANT:
       * This does NOT replace backend authorization.
       */

      if (!loggedInUser) {
        try {
          const payload = JSON.parse(
            atob(token.split(".")[1])
          );

          loggedInUser = {
            id: payload.sub,
            user_id: payload.sub,
            email:
              payload.email ||
              email,
            name:
              payload.name ||
              payload.full_name ||
              "Teacher",
            role:
              payload.role ||
              "teacher",
          };
        } catch {
          loggedInUser = {
            email,
            name: "Teacher",
            role: "teacher",
          };
        }
      }

      localStorage.setItem(
        "portal_token",
        token
      );

      localStorage.setItem(
        "portal_user",
        JSON.stringify(loggedInUser)
      );

      onLogin({
        token,
        user: loggedInUser,
      });
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.message ||
          "Unable to connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-background-shape shape-one" />
      <div className="login-background-shape shape-two" />

      <div className="login-container">

        <div className="login-brand">
          <div className="login-brand-icon">
            <Cloud size={30} />
          </div>

          <div>
            <h1>CloudClass</h1>
            <p>Assignment & Feedback Portal</p>
          </div>
        </div>

        <div className="login-card">

          <div className="login-card-heading">
            <div className="login-lock-icon">
              <Lock size={20} />
            </div>

            <div>
              <h2>Welcome back</h2>
              <p>
                Sign in to access your learning workspace.
              </p>
            </div>
          </div>

          {error && (
            <div className="login-error">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="login-field">

              <label>Email Address</label>

              <div className="login-input-wrapper">
                <Mail size={18} />

                <input
                  type="email"
                  placeholder="teacher@example.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  disabled={loading}
                />
              </div>
            </div>

            <div className="login-field">

              <label>Password</label>

              <div className="login-input-wrapper">
                <Lock size={18} />

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="loading-spinner"
                  />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>

          </form>

          <div className="login-demo">

            <div className="demo-header">
              <ShieldCheck size={17} />
              <span>Demo Accounts</span>
            </div>

            <div className="demo-row">
              <span>Email</span>
              <strong>
                teacher@example.com
              </strong>
            </div>

            <div className="demo-row">
              <span>Password</span>
              <strong>
                Teacher@123
              </strong>
            </div>

            <div className="demo-row">
              <span>Student</span>
              <strong>student@example.com / Student@123</strong>
            </div>

          </div>

        </div>

        <div className="login-footer">
          <span>
            © 2026 CloudClass
          </span>

          <span>
            Secure Cloud-Based Learning Platform
          </span>
        </div>

      </div>
    </div>
  );
}

/* =========================================================
   UNAUTHORIZED
========================================================= */

function UnauthorizedScreen({ user, onLogout }) {
  return (
    <div className="auth-loading-screen">

      <div className="auth-loading-card">

        <div className="loading-logo">
          <ShieldCheck size={28} />
        </div>

        <h2>Access Restricted</h2>

        <p>
          This workspace is available only to
          teacher accounts.
        </p>

        <p>
          Logged in as:{" "}
          <strong>
            {user?.email || "Unknown user"}
          </strong>
        </p>

        <button
          className="primary-button"
          onClick={onLogout}
        >
          <LogOut size={17} />
          Logout
        </button>

      </div>
    </div>
  );
}

/* =========================================================
   TEACHER PORTAL
========================================================= */

function TeacherPortal({ user, onLogout }) {
  const [page, setPage] =
    useState("dashboard");

  const [mobileMenu, setMobileMenu] =
    useState(false);

  const navigate = (target) => {
    setPage(target);
    setMobileMenu(false);
  };

  return (
    <div className="app-shell">

      {mobileMenu && (
        <div
          className="mobile-overlay"
          onClick={() =>
            setMobileMenu(false)
          }
        />
      )}

      <Sidebar
        page={page}
        navigate={navigate}
        mobileMenu={mobileMenu}
        onLogout={onLogout}
      />

      <div className="main-area">

        <Topbar
          onMenuClick={() =>
            setMobileMenu(true)
          }
          user={user}
          onLogout={onLogout}
        />

        <main className="page-container">

          {page === "dashboard" && (
            <Dashboard
              navigate={navigate}
              user={user}
            />
          )}

          {page === "assignments" && (
            <Assignments
              navigate={navigate}
            />
          )}

          {page === "create-assignment" && (
            <CreateAssignment
              navigate={navigate}
            />
          )}

          {page === "submissions" && (
            <Submissions />
          )}

          {page === "courses" && (
            <Courses />
          )}

          {page === "students" && (
            <Students />
          )}

          {page === "analytics" && (
            <Analytics />
          )}

          {page === "settings" && (
            <SettingsPage
              user={user}
            />
          )}

        </main>
      </div>
    </div>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar({
  page,
  navigate,
  mobileMenu,
  onLogout,
}) {
  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      value: "dashboard",
    },
    {
      label: "Courses",
      icon: BookOpen,
      value: "courses",
    },
    {
      label: "Assignments",
      icon: ClipboardList,
      value: "assignments",
    },
    {
      label: "Submissions",
      icon: FileCheck2,
      value: "submissions",
    },
    {
      label: "Students",
      icon: Users,
      value: "students",
    },
    {
      label: "Analytics",
      icon: BarChart3,
      value: "analytics",
    },
  ];

  return (
    <aside
      className={`sidebar ${
        mobileMenu
          ? "sidebar-open"
          : ""
      }`}
    >

      <div className="brand">

        <div className="brand-icon">
          <Cloud size={23} />
        </div>

        <span>CloudClass</span>

        {mobileMenu && (
          <button
            className="mobile-close-button"
            onClick={() =>
              navigate(page)
            }
          >
            <X size={20} />
          </button>
        )}

      </div>

      <div className="sidebar-section">

        <p className="sidebar-heading">
          MAIN MENU
        </p>

        {menuItems.map((item) => {
          const Icon = item.icon;

          const active =
            page === item.value ||
            (page ===
              "create-assignment" &&
              item.value ===
                "assignments");

          return (
            <button
              key={item.value}
              className={`sidebar-item ${
                active
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                navigate(item.value)
              }
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
          );
        })}

      </div>

      <div className="sidebar-divider" />

      <div className="sidebar-section">

        <p className="sidebar-heading">
          ACCOUNT
        </p>

        <button
          className={`sidebar-item ${
            page === "settings"
              ? "active"
              : ""
          }`}
          onClick={() =>
            navigate("settings")
          }
        >
          <Settings size={19} />
          <span>Settings</span>
        </button>

        <button
          className="sidebar-item"
          onClick={() =>
            navigate("settings")
          }
        >
          <UserCircle size={19} />
          <span>Profile</span>
        </button>

        <button
          className="sidebar-item logout"
          onClick={onLogout}
        >
          <LogOut size={19} />
          <span>Logout</span>
        </button>

      </div>

      <div className="sidebar-bottom-card">

        <div className="security-icon">
          <ShieldCheck size={24} />
        </div>

        <h4>
          Secure & Cloud Based
        </h4>

        <p>
          Your assignments and academic
          data are securely managed.
        </p>

      </div>

    </aside>
  );
}

/* =========================================================
   TOPBAR
========================================================= */

function Topbar({
  onMenuClick,
  user,
  onLogout,
}) {
  const displayName =
    user?.name ||
    user?.full_name ||
    "Prof. Kumar";

  const firstLetter =
    displayName
      .charAt(0)
      .toUpperCase();

  return (
    <header className="topbar">

      <button
        className="mobile-menu-button"
        onClick={onMenuClick}
      >
        <Menu size={22} />
      </button>

      <div className="search-box">

        <Search size={18} />

        <input
          placeholder="Search students, assignments, courses..."
        />

      </div>

      <div className="topbar-right">

        <button className="icon-button notification">
          <Bell size={20} />
          <span />
        </button>

        <div className="topbar-divider" />

        <div className="profile">

          <div className="profile-avatar">
            {firstLetter}
          </div>

          <div className="profile-info">

            <strong>
              {displayName}
            </strong>

            <small>
              Teacher
            </small>

          </div>

          <ChevronDown size={17} />

        </div>

      </div>
    </header>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  navigate,
  user,
}) {
  const displayName =
    user?.name ||
    user?.full_name ||
    "Prof. Kumar";

  return (
    <>
      <div className="page-header">

        <div>

          <h1>
            Good Morning,{" "}
            {displayName} 👋
          </h1>

          <p>
            Here's what's happening
            with your courses today.
          </p>

        </div>

        <button
          className="primary-button"
          onClick={() =>
            navigate(
              "create-assignment"
            )
          }
        >
          <Plus size={18} />
          Create Assignment
        </button>

      </div>

      <div className="stats-grid">

        <StatCard
          title="Total Courses"
          value="4"
          icon={<BookOpen />}
          variant="blue"
        />

        <StatCard
          title="Assignments"
          value="18"
          icon={<ClipboardList />}
          variant="green"
        />

        <StatCard
          title="Submissions"
          value="76"
          icon={<FileCheck2 />}
          variant="purple"
        />

        <StatCard
          title="Pending Reviews"
          value="12"
          icon={<FileText />}
          variant="orange"
        />

      </div>

      <div className="dashboard-grid">

        <SubmissionOverview />

        <UpcomingDeadlines />

      </div>

      <RecentSubmissions
        navigate={navigate}
      />
    </>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  icon,
  variant,
}) {
  return (
    <div className="stat-card">

      <div
        className={`stat-icon ${variant}`}
      >
        {icon}
      </div>

      <div>
        <p>{title}</p>
        <h2>{value}</h2>
      </div>

    </div>
  );
}

/* =========================================================
   SUBMISSION OVERVIEW
========================================================= */

function SubmissionOverview() {
  return (
    <section className="dashboard-card">

      <div className="card-header">

        <div>
          <h3>
            Submissions Overview
          </h3>

          <p>
            Current month
          </p>
        </div>

        <button className="select-button">
          This Month
          <ChevronDown size={15} />
        </button>

      </div>

      <div className="overview-content">

        <div className="donut-chart">

          <div className="donut-inner">
            <strong>76</strong>
            <span>Total</span>
          </div>

        </div>

        <div className="chart-legend">

          <LegendItem
            color="green"
            label="Graded"
            value="52%"
          />

          <LegendItem
            color="orange"
            label="Pending"
            value="16%"
          />

          <LegendItem
            color="red"
            label="Late"
            value="18%"
          />

          <LegendItem
            color="blue"
            label="On Time"
            value="14%"
          />

        </div>

      </div>

    </section>
  );
}

function LegendItem({
  color,
  label,
  value,
}) {
  return (
    <div className="legend-item">

      <span
        className={`legend-dot ${color}`}
      />

      <span>{label}</span>

      <strong>{value}</strong>

    </div>
  );
}

/* =========================================================
   UPCOMING DEADLINES
========================================================= */

function UpcomingDeadlines() {
  return (
    <section className="dashboard-card">

      <div className="card-header">

        <div>
          <h3>
            Upcoming Deadlines
          </h3>

          <p>
            Assignments due soon
          </p>
        </div>

        <button className="text-button">
          View All
          <ArrowRight size={15} />
        </button>

      </div>

      <div className="deadline-list">

        {upcomingDeadlines.map(
          (item) => (
            <div
              className="deadline-item"
              key={item.title}
            >

              <div className="deadline-icon">
                <CalendarDays
                  size={18}
                />
              </div>

              <div className="deadline-info">

                <strong>
                  {item.title}
                </strong>

                <span>
                  {item.course} ·{" "}
                  {item.date}
                </span>

              </div>

              <span className="days-badge">
                {item.remaining}
              </span>

            </div>
          )
        )}

      </div>

    </section>
  );
}

/* =========================================================
   RECENT SUBMISSIONS
========================================================= */

function RecentSubmissions({
  navigate,
}) {
  return (
    <section className="dashboard-card table-card">

      <div className="card-header">

        <div>
          <h3>
            Recent Submissions
          </h3>

          <p>
            Latest student activity
          </p>
        </div>

        <button
          className="text-button"
          onClick={() =>
            navigate("submissions")
          }
        >
          View All
          <ArrowRight size={15} />
        </button>

      </div>

      <SubmissionTable />

    </section>
  );
}

function SubmissionTable() {
  return (
    <div className="table-wrapper">

      <table>

        <thead>

          <tr>
            <th>Student</th>
            <th>Assignment</th>
            <th>Course</th>
            <th>Status</th>
            <th>Submitted At</th>
            <th>Action</th>
          </tr>

        </thead>

        <tbody>

          {recentSubmissions.map(
            (item) => (
              <tr
                key={`${item.student}-${item.assignment}`}
              >

                <td>

                  <div className="student-cell">

                    <div className="small-avatar">
                      {item.student.charAt(
                        0
                      )}
                    </div>

                    <span>
                      {item.student}
                    </span>

                  </div>

                </td>

                <td>
                  {item.assignment}
                </td>

                <td>
                  {item.course}
                </td>

                <td>
                  <StatusBadge
                    status={item.status}
                  />
                </td>

                <td>
                  {item.time}
                </td>

                <td>

                  <button className="view-button">
                    <Eye size={16} />
                    View
                  </button>

                </td>

              </tr>
            )
          )}

        </tbody>

      </table>

    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}) {
  const className = String(
    status || "UNKNOWN"
  )
    .toLowerCase()
    .replace(/\s+/g, "-");

  return (
    <span
      className={`status-badge ${className}`}
    >
      {status}
    </span>
  );
}

/* =========================================================
   ASSIGNMENTS
========================================================= */

function Assignments({
  navigate,
}) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadAssignments = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      const data = await apiRequest("/api/assignments");

      // Support common FastAPI response shapes:
      // []
      // { assignments: [] }
      // { items: [] }
      // { data: [] }
      let items = [];

      if (Array.isArray(data)) {
        items = data;
      } else if (Array.isArray(data?.assignments)) {
        items = data.assignments;
      } else if (Array.isArray(data?.items)) {
        items = data.items;
      } else if (Array.isArray(data?.data)) {
        items = data.data;
      }

      const normalized = items.map((item) => {
        const deadline = item.deadline || item.due_date || item.dueDate;
        const deadlineDate = deadline ? new Date(deadline) : null;
        const validDeadline = deadlineDate && !Number.isNaN(deadlineDate.getTime());

        let status = "Active";
        if (validDeadline && deadlineDate < new Date()) {
          status = "Closed";
        }

        return {
          id: item.id ?? item.assignment_id,
          title: item.title || "Untitled Assignment",
          course:
            item.course_name ||
            item.course?.course_name ||
            item.course?.name ||
            item.course ||
            `Course #${item.course_id ?? "—"}`,
          deadline,
          submissions:
            item.submissions_count != null
              ? String(item.submissions_count)
              : item.submission_count != null
              ? String(item.submission_count)
              : "—",
          status,
          maxMarks: item.max_marks,
        };
      });

      console.log("Assignments loaded from API:", normalized);
      setAssignments(normalized);
    } catch (err) {
      console.error("Failed to load assignments:", err);

      if (err?.status === 401) {
        setError("Your login session has expired. Please log in again.");
      } else if (err?.status === 403) {
        setError("You are not authorized to view these assignments.");
      } else {
        setError(err?.message || "Unable to load assignments.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const filteredAssignments = assignments.filter((assignment) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    return (
      assignment.title.toLowerCase().includes(query) ||
      String(assignment.course).toLowerCase().includes(query)
    );
  });

  const activeCount = assignments.filter(
    (assignment) => assignment.status === "Active"
  ).length;

  const closedCount = assignments.filter(
    (assignment) => assignment.status === "Closed"
  ).length;

  const formatDeadline = (value) => {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <div className="page-header">
        <div>
          <p className="eyebrow">COURSEWORK</p>
          <h1>Assignments</h1>
          <p>Manage all assignments across your courses.</p>
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={() => navigate("create-assignment")}
        >
          <Plus size={18} />
          Create Assignment
        </button>
      </div>

      {error && (
        <div className="form-alert error">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="filter-bar">
        <div className="assignment-search">
          <Search size={17} />
          <input
            id="assignment-search"
            name="assignment-search"
            type="search"
            placeholder="Search assignments..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <button
          className="filter-button"
          type="button"
          onClick={() => loadAssignments(true)}
          disabled={refreshing}
        >
          <Loader2
            size={16}
            className={refreshing ? "loading-spinner" : ""}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <section className="dashboard-card table-card">
        <div className="assignment-tabs">
          <button type="button" className="tab active">
            All ({assignments.length})
          </button>
          <button type="button" className="tab">
            Active ({activeCount})
          </button>
          <button type="button" className="tab">
            Closed ({closedCount})
          </button>
        </div>

        {loading ? (
          <div className="empty-state">
            <Loader2 size={28} className="loading-spinner" />
            <h3>Loading assignments...</h3>
            <p>Fetching assignments from the cloud database.</p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="empty-state">
            <ClipboardList size={36} />
            <h3>
              {assignments.length === 0
                ? "No assignments found"
                : "No matching assignments"}
            </h3>
            <p>
              {assignments.length === 0
                ? "Create an assignment and it will appear here automatically."
                : "Try a different search term."}
            </p>
            {assignments.length === 0 && (
              <button
                className="primary-button"
                type="button"
                onClick={() => navigate("create-assignment")}
              >
                <Plus size={18} />
                Create Assignment
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Assignment</th>
                  <th>Course</th>
                  <th>Deadline</th>
                  <th>Submissions</th>
                  <th>Status</th>
                  <th>Marks</th>
                </tr>
              </thead>

              <tbody>
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td>
                      <strong className="table-title">
                        {assignment.title}
                      </strong>
                    </td>
                    <td>{assignment.course}</td>
                    <td>{formatDeadline(assignment.deadline)}</td>
                    <td>{assignment.submissions}</td>
                    <td>
                      <StatusBadge status={assignment.status} />
                    </td>
                    <td>{assignment.maxMarks ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

/* =========================================================
   CREATE ASSIGNMENT
========================================================= */

function CreateAssignment({
  navigate,
}) {
  const [form, setForm] = useState({
    title: "",
    course: "",
    description: "",
    deadline: "",
    maxMarks: "",
    maxFileSize: "10",
  });

  const [fileTypes, setFileTypes] =
    useState({
      pdf: true,
      docx: true,
      zip: false,
      images: false,
    });

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  const updateField = (
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const toggleFileType = (
    type
  ) => {
    setFileTypes((previous) => ({
      ...previous,
      [type]: !previous[type],
    }));
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError(
        "Assignment title is required."
      );
      return;
    }

    if (!form.course) {
      setError(
        "Please select a course."
      );
      return;
    }

    if (!form.maxMarks) {
      setError(
        "Maximum marks are required."
      );
      return;
    }

    if (!form.deadline) {
      setError(
        "Please select a deadline."
      );
      return;
    }

    const selectedTypes =
      Object.entries(fileTypes)
        .filter(
          ([, enabled]) => enabled
        )
        .map(([type]) => {
          if (type === "images") {
            return "jpg,png,jpeg";
          }

          return type;
        })
        .join(",");

    /*
     * IMPORTANT:
     *
     * Your FastAPI endpoint expects:
     *
     * course_id
     * title
     * description
     * deadline
     * max_marks
     * allowed_file_types
     * max_file_size_mb
     */

    const courseIdMap = {
      cloud: 1,
      security: 2,
      devops: 3,
    };

    const courseId =
      courseIdMap[form.course];

    setLoading(true);

    try {
      const payload = {
        course_id: courseId,
        title: form.title.trim(),
        description:
          form.description.trim(),
        deadline: new Date(
          form.deadline
        ).toISOString(),
        max_marks: Number(
          form.maxMarks
        ),
        allowed_file_types:
          selectedTypes ||
          "pdf,docx",
        max_file_size_mb:
          Number(
            form.maxFileSize
          ),
      };

      const result =
        await apiRequest(
          "/api/assignments",
          {
            method: "POST",
            body: JSON.stringify(
              payload
            ),
          }
        );

      console.log(
        "Assignment created:",
        result
      );

      setSuccess(
        "Assignment created successfully."
      );

      setForm({
        title: "",
        course: "",
        description: "",
        deadline: "",
        maxMarks: "",
        maxFileSize: "10",
      });

      setFileTypes({
        pdf: true,
        docx: true,
        zip: false,
        images: false,
      });

    } catch (err) {
      console.error(
        "Create assignment error:",
        err
      );

      if (err.status === 401) {
        setError(
          "Your login session has expired. Please login again."
        );
      } else if (
        err.status === 403
      ) {
        setError(
          "Your account does not have permission to create assignments."
        );
      } else {
        setError(
          err.message ||
            "Unable to create assignment."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="breadcrumb">

        <button
          onClick={() =>
            navigate("assignments")
          }
        >
          Assignments
        </button>

        <span>/</span>

        <strong>
          Create Assignment
        </strong>

      </div>

      <div className="page-header compact">

        <div>

          <h1>
            Create Assignment
          </h1>

          <p>
            Create a new assignment
            for your students.
          </p>

        </div>

      </div>

      {error && (
        <div className="form-alert error">

          <AlertTriangle size={18} />

          <span>{error}</span>

        </div>
      )}

      {success && (
        <div className="form-alert success">

          <Check size={18} />

          <span>{success}</span>

        </div>
      )}

      <form
        className="assignment-form-card"
        onSubmit={handleSubmit}
      >

        <div className="form-section">

          <div className="form-section-heading">

            <div className="section-number">
              01
            </div>

            <div>

              <h3>
                Assignment Details
              </h3>

              <p>
                Provide the basic
                information about this
                assignment.
              </p>

            </div>

          </div>

          <div className="form-grid">

            <div className="form-group full">

              <label>
                Assignment Title{" "}
                <span>*</span>
              </label>

              <input
                value={form.title}
                onChange={(e) =>
                  updateField(
                    "title",
                    e.target.value
                  )
                }
                placeholder="Enter assignment title"
              />

            </div>

            <div className="form-group">

              <label>
                Course <span>*</span>
              </label>

              <select
                value={form.course}
                onChange={(e) =>
                  updateField(
                    "course",
                    e.target.value
                  )
                }
              >

                <option value="">
                  Select a course
                </option>

                <option value="cloud">
                  Cloud Computing
                </option>

                <option value="security">
                  Cloud Security
                </option>

                <option value="devops">
                  DevOps Engineering
                </option>

              </select>

            </div>

            <div className="form-group">

              <label>
                Maximum Marks{" "}
                <span>*</span>
              </label>

              <input
                type="number"
                min="1"
                max="1000"
                value={form.maxMarks}
                onChange={(e) =>
                  updateField(
                    "maxMarks",
                    e.target.value
                  )
                }
                placeholder="100"
              />

            </div>

            <div className="form-group full">

              <label>
                Description
              </label>

              <textarea
                value={
                  form.description
                }
                onChange={(e) =>
                  updateField(
                    "description",
                    e.target.value
                  )
                }
                placeholder="Enter detailed instructions for the assignment..."
                rows="6"
              />

            </div>

          </div>

        </div>

        <div className="form-divider" />

        <div className="form-section">

          <div className="form-section-heading">

            <div className="section-number">
              02
            </div>

            <div>

              <h3>
                Submission Settings
              </h3>

              <p>
                Configure deadline and
                file requirements.
              </p>

            </div>

          </div>

          <div className="form-grid">

            <div className="form-group">

              <label>
                Deadline <span>*</span>
              </label>

              <div className="input-with-icon">

                <CalendarDays size={17} />

                <input
                  type="datetime-local"
                  value={
                    form.deadline
                  }
                  onChange={(e) =>
                    updateField(
                      "deadline",
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

            <div className="form-group">

              <label>
                Maximum File Size
              </label>

              <div className="input-with-suffix">

                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={
                    form.maxFileSize
                  }
                  onChange={(e) =>
                    updateField(
                      "maxFileSize",
                      e.target.value
                    )
                  }
                />

                <span>MB</span>

              </div>

            </div>

            <div className="form-group full">

              <label>
                Allowed File Types
              </label>

              <div className="file-type-options">

                {[
                  ["pdf", "PDF"],
                  ["docx", "DOCX"],
                  ["zip", "ZIP"],
                  ["images", "Images"],
                ].map(
                  ([key, label]) => (
                    <label
                      className={`file-type-option ${
                        fileTypes[key]
                          ? "selected"
                          : ""
                      }`}
                      key={key}
                    >

                      <input
                        type="checkbox"
                        checked={
                          fileTypes[key]
                        }
                        onChange={() =>
                          toggleFileType(
                            key
                          )
                        }
                      />

                      <span>
                        {label}
                      </span>

                    </label>
                  )
                )}

              </div>

            </div>

          </div>

        </div>

        <div className="form-footer">

          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              navigate(
                "assignments"
              )
            }
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >

            {loading ? (
              <>
                <Loader2
                  size={18}
                  className="loading-spinner"
                />
                Creating...
              </>
            ) : (
              <>
                <Plus size={18} />
                Create Assignment
              </>
            )}

          </button>

        </div>

      </form>
    </>
  );
}

/* =========================================================
   SUBMISSIONS
========================================================= */

function Submissions() {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [error, setError] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [marks, setMarks] = useState("");
  const [feedback, setFeedback] = useState("");
  const [grading, setGrading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [message, setMessage] = useState("");

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiRequest("/api/assignments");
      const items = Array.isArray(data)
        ? data
        : data?.assignments || data?.items || data?.data || [];
      setAssignments(items);

      if (items.length && !selectedAssignmentId) {
        setSelectedAssignmentId(String(items[0].id));
      }
    } catch (err) {
      console.error("Failed to load assignments:", err);
      setError(err?.message || "Unable to load assignments.");
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async (assignmentId) => {
    if (!assignmentId) {
      setSubmissions([]);
      return;
    }

    try {
      setLoadingSubmissions(true);
      setError("");
      const data = await apiRequest(
        `/api/assignments/${assignmentId}/submissions`
      );
      const items = Array.isArray(data)
        ? data
        : data?.submissions || data?.items || data?.data || [];
      setSubmissions(items);
    } catch (err) {
      console.error("Failed to load submissions:", err);
      setSubmissions([]);
      setError(err?.message || "Unable to load submissions.");
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  useEffect(() => {
    if (selectedAssignmentId) {
      loadSubmissions(selectedAssignmentId);
    }
  }, [selectedAssignmentId]);

  const selectedAssignment = assignments.find(
    (item) => String(item.id) === String(selectedAssignmentId)
  );

  const pendingCount = submissions.filter(
    (item) => String(item.submission_status).toUpperCase() !== "GRADED"
  ).length;

  const gradedCount = submissions.filter(
    (item) => item.marks !== null && item.marks !== undefined
  ).length;

  const lateCount = submissions.filter(
    (item) => String(item.submission_status).toUpperCase() === "LATE"
  ).length;

  const openSubmission = (submission) => {
    setSelectedSubmission(submission);
    setMarks(
      submission.marks === null || submission.marks === undefined
        ? ""
        : String(submission.marks)
    );
    setFeedback(submission.feedback || "");
    setMessage("");
    setError("");
  };

  const gradeSubmission = async () => {
    if (!selectedSubmission || !selectedAssignment) return;

    const numericMarks = Number(marks);

    if (!Number.isFinite(numericMarks) || !Number.isInteger(numericMarks)) {
      setError("Marks must be a valid whole number.");
      return;
    }

    if (numericMarks < 0) {
      setError("Marks cannot be negative.");
      return;
    }

    if (numericMarks > Number(selectedAssignment.max_marks)) {
      setError(
        `Marks cannot exceed ${selectedAssignment.max_marks}.`
      );
      return;
    }

    try {
      setGrading(true);
      setError("");
      setMessage("");

      const updated = await apiRequest(
        `/api/submissions/${selectedSubmission.id}/grade`,
        {
          method: "POST",
          body: JSON.stringify({
            marks: numericMarks,
            feedback: feedback.trim(),
          }),
        }
      );

      setSubmissions((current) =>
        current.map((item) =>
          item.id === selectedSubmission.id ? updated : item
        )
      );
      setSelectedSubmission(updated);
      setMarks(String(updated.marks ?? numericMarks));
      setFeedback(updated.feedback || "");
      setMessage("Grade and feedback saved successfully.");
    } catch (err) {
      console.error("Grade submission failed:", err);
      setError(err?.message || "Unable to save the grade.");
    } finally {
      setGrading(false);
    }
  };

  const downloadSubmission = async (submission) => {
    try {
      setDownloading(true);
      setError("");

      const token = localStorage.getItem("portal_token");
      const response = await fetch(
        `${API_BASE_URL}/api/submissions/${submission.id}/download`,
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        }
      );

      if (!response.ok) {
        let detail = `Download failed (${response.status}).`;
        try {
          const data = await response.json();
          detail = data?.detail || data?.message || detail;
        } catch {
          // Keep the fallback message.
        }
        throw new Error(detail);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = submission.file_name || "submission";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Submission download failed:", err);
      setError(err?.message || "Unable to download submission.");
    } finally {
      setDownloading(false);
    }
  };

  const closeReview = () => {
    setSelectedSubmission(null);
    setMarks("");
    setFeedback("");
    setMessage("");
    setError("");
  };

  if (selectedSubmission) {
    return (
      <>
        <div className="page-header">
          <div>
            <button
              className="view-button"
              onClick={closeReview}
              style={{ marginBottom: 14 }}
            >
              ← Back to submissions
            </button>
            <h1>Review Submission</h1>
            <p>
              Review the student's file, enter marks, and provide feedback.
            </p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            <AlertTriangle size={18} />
            <span>{String(error)}</span>
          </div>
        )}

        {message && (
          <div className="alert alert-success" role="status">
            <Check size={18} />
            <span>{String(message)}</span>
          </div>
        )}

        <div className="stats-grid">
          <StatCard
            title="Student"
            value={`#${selectedSubmission.student_id}`}
            icon={<UserCircle />}
            variant="blue"
          />
          <StatCard
            title="Version"
            value={`v${selectedSubmission.version || 1}`}
            icon={<FileText />}
            variant="purple"
          />
          <StatCard
            title="Maximum Marks"
            value={String(selectedAssignment?.max_marks || "-")}
            icon={<CheckCircle2 />}
            variant="green"
          />
          <StatCard
            title="Status"
            value={selectedSubmission.submission_status || "SUBMITTED"}
            icon={<Clock3 />}
            variant="orange"
          />
        </div>

        <div className="dashboard-grid">
          <section className="dashboard-card">
            <div className="card-header">
              <div>
                <h3>Submission Details</h3>
                <p>{selectedAssignment?.title || "Assignment"}</p>
              </div>
            </div>

            <div className="submission-detail-list">
              <div>
                <span>Student ID</span>
                <strong>{selectedSubmission.student_id}</strong>
              </div>
              <div>
                <span>File</span>
                <strong>{selectedSubmission.file_name}</strong>
              </div>
              <div>
                <span>Submitted</span>
                <strong>
                  {selectedSubmission.submitted_at
                    ? new Date(selectedSubmission.submitted_at).toLocaleString()
                    : "-"}
                </strong>
              </div>
              <div>
                <span>Version</span>
                <strong>v{selectedSubmission.version || 1}</strong>
              </div>
            </div>

            <button
              className="primary-button"
              onClick={() => downloadSubmission(selectedSubmission)}
              disabled={downloading}
            >
              {downloading ? (
                <Loader2 size={18} className="spin" />
              ) : (
                <FileText size={18} />
              )}
              {downloading ? "Downloading..." : "Download Submission"}
            </button>
          </section>

          <section className="dashboard-card">
            <div className="card-header">
              <div>
                <h3>Grade & Feedback</h3>
                <p>
                  Maximum: {selectedAssignment?.max_marks || 0} marks
                </p>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="submission-marks">Marks</label>
              <input
                id="submission-marks"
                name="submission-marks"
                type="number"
                min="0"
                max={selectedAssignment?.max_marks || 0}
                value={marks}
                onChange={(event) => setMarks(event.target.value)}
                placeholder="Enter marks"
              />
            </div>

            <div className="form-group">
              <label htmlFor="submission-feedback">Feedback</label>
              <textarea
                id="submission-feedback"
                name="submission-feedback"
                rows="7"
                maxLength="5000"
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                placeholder="Write constructive feedback for the student..."
              />
              <small>{feedback.length}/5000</small>
            </div>

            <button
              className="primary-button"
              onClick={gradeSubmission}
              disabled={grading}
            >
              {grading ? (
                <Loader2 size={18} className="spin" />
              ) : (
                <CheckCircle2 size={18} />
              )}
              {grading ? "Saving..." : "Save Grade & Feedback"}
            </button>
          </section>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Submissions</h1>
          <p>Review, grade, and provide feedback on student assignments.</p>
        </div>
        <button
          className="view-button"
          onClick={() => {
            loadAssignments();
            if (selectedAssignmentId) loadSubmissions(selectedAssignmentId);
          }}
        >
          <Loader2 size={16} className={loading || loadingSubmissions ? "spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          <AlertTriangle size={18} />
          <span>{String(error)}</span>
        </div>
      )}

      <div className="stats-grid">
        <StatCard
          title="Total Submissions"
          value={String(submissions.length)}
          icon={<FileCheck2 />}
          variant="blue"
        />
        <StatCard
          title="Pending Review"
          value={String(pendingCount)}
          icon={<Clock3 />}
          variant="orange"
        />
        <StatCard
          title="Graded"
          value={String(gradedCount)}
          icon={<CheckCircle2 />}
          variant="green"
        />
        <StatCard
          title="Late"
          value={String(lateCount)}
          icon={<AlertCircle />}
          variant="purple"
        />
      </div>

      <section className="dashboard-card table-card">
        <div className="card-header">
          <div>
            <h3>Student Submissions</h3>
            <p>Select an assignment to review its submissions.</p>
          </div>
        </div>

        <div className="form-group" style={{ maxWidth: 520 }}>
          <label htmlFor="submission-assignment">Assignment</label>
          <select
            id="submission-assignment"
            name="submission-assignment"
            value={selectedAssignmentId}
            onChange={(event) => setSelectedAssignmentId(event.target.value)}
            disabled={loading || assignments.length === 0}
          >
            {assignments.length === 0 ? (
              <option value="">No assignments available</option>
            ) : (
              assignments.map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.title}
                </option>
              ))
            )}
          </select>
        </div>

        {loadingSubmissions ? (
          <div className="empty-state">
            <Loader2 size={28} className="spin" />
            <h3>Loading submissions...</h3>
          </div>
        ) : submissions.length === 0 ? (
          <div className="empty-state">
            <FileCheck2 size={36} />
            <h3>No submissions yet</h3>
            <p>Students who submit this assignment will appear here.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>File</th>
                  <th>Version</th>
                  <th>Status</th>
                  <th>Submitted At</th>
                  <th>Marks</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.id}>
                    <td>
                      <div className="student-cell">
                        <div className="small-avatar">
                          {String(submission.student_id).charAt(0)}
                        </div>
                        <span>Student #{submission.student_id}</span>
                      </div>
                    </td>
                    <td>{submission.file_name}</td>
                    <td>v{submission.version || 1}</td>
                    <td>
                      <StatusBadge status={submission.submission_status} />
                    </td>
                    <td>
                      {submission.submitted_at
                        ? new Date(submission.submitted_at).toLocaleString()
                        : "-"}
                    </td>
                    <td>
                      {submission.marks !== null && submission.marks !== undefined
                        ? `${submission.marks}/${selectedAssignment?.max_marks || "-"}`
                        : "Pending"}
                    </td>
                    <td>
                      <button
                        className="view-button"
                        onClick={() => openSubmission(submission)}
                      >
                        <Eye size={16} />
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

/* =========================================================
   COURSES
========================================================= */

function Courses() {
  const courses = [
    {
      name: "Cloud Computing",
      code: "CC401",
      students: 60,
      assignments: 8,
    },
    {
      name: "Cloud Security",
      code: "CS402",
      students: 50,
      assignments: 5,
    },
    {
      name: "DevOps Engineering",
      code: "DE403",
      students: 45,
      assignments: 5,
    },
  ];

  return (
    <>
      <div className="page-header">

        <div>

          <h1>Courses</h1>

          <p>
            Manage your courses
            and student groups.
          </p>

        </div>

        <button className="primary-button">
          <Plus size={18} />
          Add Course
        </button>

      </div>

      <div className="course-grid">

        {courses.map(
          (course) => (
            <div
              className="course-card"
              key={course.code}
            >

              <div className="course-icon">
                <BookOpen size={22} />
              </div>

              <div className="course-code">
                {course.code}
              </div>

              <h3>
                {course.name}
              </h3>

              <div className="course-meta">

                <span>
                  <Users size={15} />
                  {course.students}{" "}
                  Students
                </span>

                <span>
                  <ClipboardList
                    size={15}
                  />
                  {course.assignments}{" "}
                  Assignments
                </span>

              </div>

            </div>
          )
        )}

      </div>
    </>
  );
}

/* =========================================================
   STUDENTS
========================================================= */

function Students() {
  const students = [
    [
      "Rahul Sharma",
      "Cloud Computing",
      "Active",
    ],
    [
      "Ananya Mehta",
      "Cloud Computing",
      "Active",
    ],
    [
      "Kiran Patel",
      "Security",
      "Active",
    ],
    [
      "Priya Nair",
      "DevOps",
      "Active",
    ],
  ];

  return (
    <>
      <div className="page-header">

        <div>

          <h1>Students</h1>

          <p>
            View students enrolled
            in your courses.
          </p>

        </div>

      </div>

      <section className="dashboard-card table-card">

        <div className="table-wrapper">

          <table>

            <thead>

              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Status</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody>

              {students.map(
                (student) => (
                  <tr
                    key={student[0]}
                  >

                    <td>

                      <div className="student-cell">

                        <div className="small-avatar">
                          {student[0].charAt(
                            0
                          )}
                        </div>

                        <strong>
                          {student[0]}
                        </strong>

                      </div>

                    </td>

                    <td>
                      {student[1]}
                    </td>

                    <td>
                      <StatusBadge
                        status={
                          student[2]
                        }
                      />
                    </td>

                    <td>

                      <button className="view-button">
                        <Eye size={16} />
                        View
                      </button>

                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

      </section>
    </>
  );
}

/* =========================================================
   ANALYTICS
========================================================= */

function Analytics() {
  return (
    <>
      <div className="page-header">

        <div>

          <h1>
            Analytics
          </h1>

          <p>
            Monitor assignment
            and student
            performance.
          </p>

        </div>

      </div>

      <div className="analytics-grid">

        <div className="dashboard-card large-chart-card">

          <div className="card-header">

            <div>

              <h3>
                Submission Activity
              </h3>

              <p>
                Last 30 days
              </p>

            </div>

          </div>

          <div className="bar-chart">

            {[
              40,
              55,
              35,
              70,
              60,
              85,
              65,
              90,
              72,
              80,
              60,
              95,
            ].map(
              (height, index) => (
                <div
                  className="bar-wrapper"
                  key={index}
                >

                  <div
                    className="bar"
                    style={{
                      height: `${height}%`,
                    }}
                  />

                </div>
              )
            )}

          </div>

        </div>

        <div className="dashboard-card">

          <div className="card-header">

            <div>

              <h3>
                Performance
              </h3>

              <p>
                Overall class
                average
              </p>

            </div>

          </div>

          <div className="performance-number">
            82<span>%</span>
          </div>

          <div className="progress-track">

            <div
              className="progress-fill"
              style={{
                width: "82%",
              }}
            />

          </div>

          <p className="performance-text">
            Students are
            performing
            consistently across
            your courses.
          </p>

        </div>

      </div>
    </>
  );
}

/* =========================================================
   SETTINGS
========================================================= */

function SettingsPage({
  user,
}) {
  return (
    <>
      <div className="page-header">

        <div>

          <h1>
            Settings
          </h1>

          <p>
            Manage your account
            preferences.
          </p>

        </div>

      </div>

      <section className="dashboard-card settings-card">

        <h3>
          Profile Settings
        </h3>

        <div className="form-grid">

          <div className="form-group">

            <label>
              Full Name
            </label>

            <input
              defaultValue={
                user?.name ||
                user?.full_name ||
                "Prof. Kumar"
              }
            />

          </div>

          <div className="form-group">

            <label>
              Email
            </label>

            <input
              defaultValue={
                user?.email ||
                "teacher@example.com"
              }
            />

          </div>

        </div>

        <button className="primary-button">
          Save Changes
        </button>

      </section>
    </>
  );
}

/* =========================================================
   STUDENT PORTAL
========================================================= */

function StudentPortal({ user, onLogout }) {
  const [page, setPage] = useState("dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState([]);

  const navigate = (target) => {
    setPage(target);
    setMobileMenu(false);
    setMessage("");
    setError("");
    if (target !== "assignment-details") setSelectedAssignment(null);
  };

  const loadStudentData = async () => {
    setLoading(true);
    setError("");
    try {
      const [assignmentData, submissionData, courseData] = await Promise.all([
        apiRequest("/api/assignments"),
        apiRequest("/api/submissions/me"),
        apiRequest("/api/courses"),
      ]);

      const assignmentItems = Array.isArray(assignmentData)
        ? assignmentData
        : assignmentData?.assignments || assignmentData?.items || assignmentData?.data || [];
      const submissionItems = Array.isArray(submissionData)
        ? submissionData
        : submissionData?.submissions || submissionData?.items || submissionData?.data || [];
      const courseItems = Array.isArray(courseData)
        ? courseData
        : courseData?.courses || courseData?.items || courseData?.data || [];

      setAssignments(assignmentItems);
      setSubmissions(submissionItems);
      setCourses(courseItems);
    } catch (err) {
      console.error("Student data load failed:", err);
      setError(err?.message || "Unable to load student data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, []);

  const courseName = (courseId) => {
    const course = courses.find((item) => Number(item.id) === Number(courseId));
    return course?.course_name || `Course #${courseId}`;
  };

  const latestSubmission = (assignmentId) => {
    const matches = submissions
      .filter((item) => Number(item.assignment_id) === Number(assignmentId))
      .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
    return matches[0] || null;
  };

  const openAssignment = (assignment) => {
    setSelectedAssignment(assignment);
    setSelectedFile(null);
    setMessage("");
    setError("");
    setPage("assignment-details");
  };

  const submitAssignment = async () => {
    if (!selectedAssignment || !selectedFile) {
      setError("Please select an assignment file first.");
      return;
    }

    const maxBytes = Number(selectedAssignment.max_file_size_mb || 10) * 1024 * 1024;
    if (selectedFile.size > maxBytes) {
      setError(`File is too large. Maximum allowed size is ${selectedAssignment.max_file_size_mb || 10} MB.`);
      return;
    }

    const extension = selectedFile.name.split(".").pop()?.toLowerCase() || "";
    const allowed = String(selectedAssignment.allowed_file_types || "pdf,docx")
      .toLowerCase()
      .split(",")
      .map((value) => value.trim().replace(/^\./, ""))
      .filter(Boolean);

    if (!allowed.includes(extension)) {
      setError(`File type .${extension} is not allowed. Allowed: ${allowed.join(", ")}.`);
      return;
    }

    const existing = latestSubmission(selectedAssignment.id);
    if (existing?.marks !== null && existing?.marks !== undefined) {
      setError("This submission has already been graded and cannot be resubmitted.");
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      await apiRequest(`/api/assignments/${selectedAssignment.id}/submit`, {
        method: "POST",
        body: formData,
      });

      setMessage("Assignment submitted successfully.");
      setSelectedFile(null);
      await loadStudentData();
    } catch (err) {
      console.error("Assignment submission failed:", err);
      setError(err?.message || "Unable to submit the assignment.");
    } finally {
      setUploading(false);
    }
  };

  const downloadSubmission = async (submissionId, fileName) => {
    try {
      const token = localStorage.getItem("portal_token");
      const response = await fetch(`${API_BASE_URL}/api/submissions/${submissionId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        let detail = "Unable to download file.";
        try {
          const data = await response.json();
          detail = data?.detail || detail;
        } catch {}
        throw new Error(detail);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName || "submission";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err?.message || "Unable to download submission.");
    }
  };

  const filteredAssignments = assignments.filter((assignment) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      String(assignment.title || "").toLowerCase().includes(query) ||
      courseName(assignment.course_id).toLowerCase().includes(query)
    );
  });

  const pendingCount = assignments.filter((assignment) => !latestSubmission(assignment.id)).length;
  const submittedCount = assignments.filter((assignment) => latestSubmission(assignment.id)).length;
  const gradedCount = submissions.filter((submission) => submission.marks !== null && submission.marks !== undefined).length;
  const displayName = user?.name || user?.full_name || "Student";
  const firstLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="app-shell">
      {mobileMenu && (
        <div className="mobile-overlay" onClick={() => setMobileMenu(false)} />
      )}

      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon"><Cloud size={23} /></div>
          <span>CloudClass</span>
          {mobileMenu && (
            <button className="mobile-close-button" onClick={() => setMobileMenu(false)}>
              <X size={20} />
            </button>
          )}
        </div>

        <div className="sidebar-section">
          <p className="sidebar-heading">STUDENT MENU</p>
          {[
            ["dashboard", "Dashboard", LayoutDashboard],
            ["assignments", "Assignments", ClipboardList],
            ["submissions", "My Submissions", FileCheck2],
          ].map(([value, label, Icon]) => (
            <button
              key={value}
              className={`sidebar-item ${page === value || (page === "assignment-details" && value === "assignments") ? "active" : ""}`}
              onClick={() => navigate(value)}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="sidebar-divider" />

        <div className="sidebar-section">
          <p className="sidebar-heading">ACCOUNT</p>
          <button className={`sidebar-item ${page === "profile" ? "active" : ""}`} onClick={() => navigate("profile")}>
            <UserCircle size={19} /><span>Profile</span>
          </button>
          <button className="sidebar-item logout" onClick={onLogout}>
            <LogOut size={19} /><span>Logout</span>
          </button>
        </div>

        <div className="sidebar-bottom-card">
          <div className="security-icon"><ShieldCheck size={24} /></div>
          <h4>Secure & Cloud Based</h4>
          <p>Your assignments and academic data are securely managed.</p>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <button className="mobile-menu-button" onClick={() => setMobileMenu(true)}>
            <Menu size={22} />
          </button>
          <div className="search-box">
            <Search size={18} />
            <input
              id="student-global-search"
              name="student-global-search"
              placeholder="Search assignments, courses..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                if (page !== "assignments") setPage("assignments");
              }}
            />
          </div>
          <div className="topbar-right">
            <button className="icon-button notification"><Bell size={20} /><span /></button>
            <div className="topbar-divider" />
            <div className="profile">
              <div className="profile-avatar">{firstLetter}</div>
              <div className="profile-info">
                <strong>{displayName}</strong>
                <small>Student</small>
              </div>
            </div>
          </div>
        </header>

        <main className="page-container">
          {error && (
            <div className="form-alert error">
              <AlertTriangle size={18} /><span>{error}</span>
            </div>
          )}
          {message && (
            <div className="form-alert success">
              <Check size={18} /><span>{message}</span>
            </div>
          )}

          {loading ? (
            <div className="empty-state">
              <Loader2 size={30} className="loading-spinner" />
              <h3>Loading your workspace...</h3>
              <p>Fetching assignments and submission history.</p>
            </div>
          ) : page === "dashboard" ? (
            <StudentDashboard
              user={user}
              assignments={assignments}
              submissions={submissions}
              pendingCount={pendingCount}
              submittedCount={submittedCount}
              gradedCount={gradedCount}
              courseName={courseName}
              latestSubmission={latestSubmission}
              onOpen={openAssignment}
              onNavigate={navigate}
            />
          ) : page === "assignments" ? (
            <StudentAssignments
              assignments={filteredAssignments}
              search={search}
              setSearch={setSearch}
              courseName={courseName}
              latestSubmission={latestSubmission}
              onOpen={openAssignment}
              onRefresh={loadStudentData}
            />
          ) : page === "assignment-details" && selectedAssignment ? (
            <StudentAssignmentDetails
              assignment={selectedAssignment}
              courseName={courseName}
              submission={latestSubmission(selectedAssignment.id)}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              uploading={uploading}
              onSubmit={submitAssignment}
              onDownload={downloadSubmission}
              onBack={() => navigate("assignments")}
            />
          ) : page === "submissions" ? (
            <StudentSubmissions
              submissions={submissions}
              assignments={assignments}
              courseName={courseName}
              onDownload={downloadSubmission}
              onOpen={openAssignment}
            />
          ) : (
            <StudentProfile user={user} />
          )}
        </main>
      </div>
    </div>
  );
}

function StudentDashboard({
  user,
  assignments,
  submissions,
  pendingCount,
  submittedCount,
  gradedCount,
  courseName,
  latestSubmission,
  onOpen,
  onNavigate,
}) {
  const displayName = user?.name || user?.full_name || "Student";
  const upcoming = assignments
    .filter((item) => new Date(item.deadline) >= new Date())
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 4);

  return (
    <>
      <div className="page-header">
        <div>
          <p className="eyebrow">STUDENT WORKSPACE</p>
          <h1>Welcome, {displayName} 👋</h1>
          <p>Track your coursework, deadlines, submissions and feedback.</p>
        </div>
        <button className="primary-button" onClick={() => onNavigate("assignments")}>
          <ClipboardList size={18} /> View Assignments
        </button>
      </div>

      <div className="stats-grid">
        <StatCard title="Total Assignments" value={assignments.length} icon={<ClipboardList />} variant="blue" />
        <StatCard title="Pending" value={pendingCount} icon={<Clock3 />} variant="orange" />
        <StatCard title="Submitted" value={submittedCount} icon={<FileCheck2 />} variant="purple" />
        <StatCard title="Graded" value={gradedCount} icon={<CheckCircle2 />} variant="green" />
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-card">
          <div className="card-header">
            <div><h3>Upcoming Deadlines</h3><p>Stay ahead of your coursework.</p></div>
            <button className="text-button" onClick={() => onNavigate("assignments")}>View All <ArrowRight size={15} /></button>
          </div>
          <div className="deadline-list">
            {upcoming.length ? upcoming.map((item) => (
              <button key={item.id} className="deadline-item" onClick={() => onOpen(item)} style={{ width: "100%", border: 0, background: "transparent", textAlign: "left", cursor: "pointer" }}>
                <div className="deadline-icon"><CalendarDays size={18} /></div>
                <div className="deadline-info">
                  <strong>{item.title}</strong>
                  <span>{courseName(item.course_id)} · {new Date(item.deadline).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                </div>
                <span className="days-badge">{latestSubmission(item.id) ? "Submitted" : "Pending"}</span>
              </button>
            )) : <div className="empty-state"><p>No upcoming deadlines.</p></div>}
          </div>
        </section>

        <section className="dashboard-card">
          <div className="card-header"><div><h3>Recent Results</h3><p>Your latest graded work.</p></div></div>
          <div className="deadline-list">
            {submissions.filter((item) => item.marks !== null && item.marks !== undefined).slice(0, 4).map((item) => {
              const assignment = assignments.find((a) => Number(a.id) === Number(item.assignment_id));
              return (
                <div className="deadline-item" key={item.id}>
                  <div className="deadline-icon"><CheckCircle2 size={18} /></div>
                  <div className="deadline-info"><strong>{assignment?.title || `Assignment #${item.assignment_id}`}</strong><span>{item.feedback || "No written feedback."}</span></div>
                  <span className="days-badge">{item.marks}/{assignment?.max_marks ?? "—"}</span>
                </div>
              );
            })}
            {!submissions.some((item) => item.marks !== null && item.marks !== undefined) && <div className="empty-state"><p>No graded submissions yet.</p></div>}
          </div>
        </section>
      </div>
    </>
  );
}

function StudentAssignments({ assignments, search, setSearch, courseName, latestSubmission, onOpen, onRefresh }) {
  return (
    <>
      <div className="page-header">
        <div><p className="eyebrow">COURSEWORK</p><h1>My Assignments</h1><p>View your assignments and submit your work before the deadline.</p></div>
        <button className="filter-button" onClick={onRefresh}><Loader2 size={16} /> Refresh</button>
      </div>

      <div className="filter-bar">
        <div className="assignment-search">
          <Search size={17} />
          <input id="student-assignment-search" name="student-assignment-search" placeholder="Search assignments..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {assignments.length === 0 ? (
        <div className="empty-state"><ClipboardList size={38} /><h3>No assignments found</h3><p>Your teacher has not published any assignments yet.</p></div>
      ) : (
        <div className="course-grid">
          {assignments.map((assignment) => {
            const submission = latestSubmission(assignment.id);
            const deadlinePassed = new Date(assignment.deadline) < new Date();
            return (
              <div className="course-card" key={assignment.id} style={{ cursor: "default" }}>
                <div className="course-icon"><ClipboardList size={22} /></div>
                <div className="course-code">{courseName(assignment.course_id)}</div>
                <h3>{assignment.title}</h3>
                <p style={{ color: "#667085", minHeight: 44 }}>{assignment.description}</p>
                <div className="course-meta" style={{ display: "block" }}>
                  <span><CalendarDays size={15} /> {new Date(assignment.deadline).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  <span><FileText size={15} /> {assignment.max_marks} marks · {assignment.max_file_size_mb} MB</span>
                </div>
                <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <StatusBadge status={submission ? (submission.marks !== null && submission.marks !== undefined ? "GRADED" : submission.submission_status) : (deadlinePassed ? "DEADLINE PASSED" : "NOT SUBMITTED")} />
                  <button className="primary-button" onClick={() => onOpen(assignment)}><Eye size={16} /> Open</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function StudentAssignmentDetails({ assignment, courseName, submission, selectedFile, setSelectedFile, uploading, onSubmit, onDownload, onBack }) {
  const graded = submission?.marks !== null && submission?.marks !== undefined;
  const allowed = String(assignment.allowed_file_types || "pdf,docx").toUpperCase();
  const deadline = new Date(assignment.deadline);
  const deadlinePassed = deadline < new Date();

  return (
    <>
      <div className="breadcrumb"><button onClick={onBack}>Assignments</button><span>/</span><strong>Assignment Details</strong></div>
      <div className="page-header compact">
        <div><p className="eyebrow">ASSIGNMENT</p><h1>{assignment.title}</h1><p>{courseName(assignment.course_id)}</p></div>
        <StatusBadge status={graded ? "GRADED" : submission?.submission_status || (deadlinePassed ? "LATE SUBMISSION" : "NOT SUBMITTED")} />
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-card">
          <div className="card-header"><div><h3>Assignment Instructions</h3><p>Read the requirements carefully before submitting.</p></div></div>
          <div style={{ lineHeight: 1.8, color: "#475467", whiteSpace: "pre-wrap" }}>{assignment.description}</div>
          <div className="form-divider" />
          <div className="course-meta" style={{ display: "grid", gap: 12 }}>
            <span><CalendarDays size={16} /> Deadline: {deadline.toLocaleString("en-IN", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
            <span><FileText size={16} /> Maximum Marks: {assignment.max_marks}</span>
            <span><ShieldCheck size={16} /> Allowed Files: {allowed}</span>
            <span><Cloud size={16} /> Maximum Size: {assignment.max_file_size_mb} MB</span>
          </div>
        </section>

        <section className="dashboard-card">
          <div className="card-header"><div><h3>Your Submission</h3><p>Upload your work or review your latest submission.</p></div></div>
          {submission ? (
            <div>
              <div className="deadline-item">
                <div className="deadline-icon"><FileCheck2 size={18} /></div>
                <div className="deadline-info"><strong>{submission.file_name}</strong><span>Version {submission.version} · {new Date(submission.submitted_at).toLocaleString("en-IN")}</span></div>
                <StatusBadge status={submission.submission_status} />
              </div>
              {graded && (
                <div className="dashboard-card" style={{ marginTop: 16, background: "#f8fafc" }}>
                  <h3>Result: {submission.marks}/{assignment.max_marks}</h3>
                  <p style={{ marginBottom: 0 }}>{submission.feedback || "No written feedback was provided."}</p>
                </div>
              )}
              <button className="secondary-button" style={{ marginTop: 16 }} onClick={() => onDownload(submission.id, submission.file_name)}><FileText size={16} /> Download Submission</button>
              {!graded && <p style={{ marginTop: 14, color: "#667085" }}>You can resubmit this assignment while it remains ungraded.</p>}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: "24px 0" }}><FileText size={34} /><h3>Not submitted yet</h3><p>Select your assignment file below.</p></div>
          )}

          {!graded && (
            <div className="form-group" style={{ marginTop: 20 }}>
              <label htmlFor="assignment-upload">Choose assignment file</label>
              <input id="assignment-upload" name="assignment-upload" type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
              {selectedFile && <p style={{ color: "#475467", marginTop: 8 }}>{selectedFile.name} · {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>}
              <button className="primary-button" style={{ marginTop: 14, width: "100%" }} onClick={onSubmit} disabled={!selectedFile || uploading}>
                {uploading ? <><Loader2 size={17} className="loading-spinner" /> Uploading...</> : <><Cloud size={17} /> {submission ? "Resubmit Assignment" : "Submit Assignment"}</>}
              </button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function StudentSubmissions({ submissions, assignments, courseName, onDownload, onOpen }) {
  return (
    <>
      <div className="page-header"><div><p className="eyebrow">MY WORK</p><h1>My Submissions</h1><p>Track every uploaded version, grade and teacher feedback.</p></div></div>
      <section className="dashboard-card table-card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Assignment</th><th>File</th><th>Version</th><th>Submitted</th><th>Status</th><th>Marks</th><th>Action</th></tr></thead>
            <tbody>
              {submissions.map((submission) => {
                const assignment = assignments.find((item) => Number(item.id) === Number(submission.assignment_id));
                return (
                  <tr key={submission.id}>
                    <td><strong className="table-title">{assignment?.title || `Assignment #${submission.assignment_id}`}</strong><div style={{ color: "#667085", fontSize: 12 }}>{courseName(assignment?.course_id)}</div></td>
                    <td>{submission.file_name}</td>
                    <td>v{submission.version}</td>
                    <td>{new Date(submission.submitted_at).toLocaleString("en-IN")}</td>
                    <td><StatusBadge status={submission.submission_status} /></td>
                    <td>{submission.marks ?? "Pending"}{submission.marks !== null && submission.marks !== undefined && assignment ? ` / ${assignment.max_marks}` : ""}</td>
                    <td><button className="view-button" onClick={() => onDownload(submission.id, submission.file_name)}><FileText size={16} /> Download</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {submissions.length === 0 && <div className="empty-state"><FileCheck2 size={38} /><h3>No submissions yet</h3><p>Your submitted assignments will appear here.</p></div>}
        </div>
      </section>
      {submissions.some((s) => s.feedback) && (
        <section className="dashboard-card" style={{ marginTop: 20 }}>
          <div className="card-header"><div><h3>Teacher Feedback</h3><p>Latest comments on your graded work.</p></div></div>
          {submissions.filter((s) => s.feedback).map((s) => {
            const assignment = assignments.find((item) => Number(item.id) === Number(s.assignment_id));
            return <div key={`feedback-${s.id}`} className="deadline-item"><div className="deadline-icon"><CheckCircle2 size={18} /></div><div className="deadline-info"><strong>{assignment?.title || "Assignment"}</strong><span>{s.feedback}</span></div><span className="days-badge">{s.marks ?? "—"} marks</span></div>;
          })}
        </section>
      )}
    </>
  );
}

function StudentProfile({ user }) {
  return (
    <>
      <div className="page-header"><div><p className="eyebrow">ACCOUNT</p><h1>My Profile</h1><p>Your account information.</p></div></div>
      <section className="dashboard-card settings-card">
        <h3>Student Information</h3>
        <div className="form-grid">
          <div className="form-group"><label htmlFor="student-name">Full Name</label><input id="student-name" name="student-name" value={user?.name || user?.full_name || ""} readOnly /></div>
          <div className="form-group"><label htmlFor="student-email">Email</label><input id="student-email" name="student-email" value={user?.email || ""} readOnly /></div>
          <div className="form-group"><label htmlFor="student-role">Role</label><input id="student-role" name="student-role" value="Student" readOnly /></div>
        </div>
      </section>
    </>
  );
}

/* =========================================================
   EXPORT
========================================================= */

export default App;