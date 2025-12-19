// App.jsx
import { Routes, Route, NavLink, useNavigate, BrowserRouter } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import CreateEventPage from './pages/CreateEventPage';
import MyEventsPage from './pages/MyEventsPage';
import RequestBookingPage from './pages/RequestBookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import { getCurrentUser, logout } from './auth';
import RegisterPage from './pages/RegisterPage';
import { createRoot } from 'react-dom/client';
import './App.css';

function NavBar() {
  const user = getCurrentUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="app-shell">
      <nav className="nav-root">
        <div className="nav-left">
          <span className="brand-logo">🌀</span>
          <NavLink to="/" className="brand-name">
            Campus Nexus
          </NavLink>
        </div>

        <div className="nav-center">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              'nav-link ' + (isActive ? 'nav-link-active' : '')
            }
          >
            Calendar
          </NavLink>

          {user && (user.role === 'club_head' || user.role === 'faculty') && (
            <>
              <NavLink
                to="/events/create"
                className={({ isActive }) =>
                  'nav-link ' + (isActive ? 'nav-link-active' : '')
                }
              >
                Create Event
              </NavLink>
              <NavLink
                to="/events/mine"
                className={({ isActive }) =>
                  'nav-link ' + (isActive ? 'nav-link-active' : '')
                }
              >
                My Events
              </NavLink>
              <NavLink
                to="/bookings/request"
                className={({ isActive }) =>
                  'nav-link ' + (isActive ? 'nav-link-active' : '')
                }
              >
                Request Venue
              </NavLink>
              <NavLink
                to="/bookings/mine"
                className={({ isActive }) =>
                  'nav-link ' + (isActive ? 'nav-link-active' : '')
                }
              >
                My Bookings
              </NavLink>
            </>
          )}

          {user && user.role === 'admin' && (
            <NavLink
              to="/admin/bookings"
              className={({ isActive }) =>
                'nav-link ' + (isActive ? 'nav-link-active' : '')
              }
            >
              Admin Bookings
            </NavLink>
          )}
        </div>

        <div className="nav-right">
  {user ? (
    <>
      <span className="user-chip">
        {user.name} <span className="user-role">{user.role}</span>
      </span>
      <button className="ghost-btn" onClick={handleLogout}>
        Logout
      </button>
    </>
  ) : (
    <>
      <NavLink
        to="/login"
        className={({ isActive }) =>
          'nav-link nav-link-cta ' + (isActive ? 'nav-link-active' : '')
        }
      >
        Login
      </NavLink>
      <NavLink
        to="/register"
        className={({ isActive }) =>
          'nav-link ' + (isActive ? 'nav-link-active' : '')
        }
      >
        Sign up
      </NavLink>
    </>
  )}
</div>

      </nav>
    </header>
  );
}

function App() {
  return (
    <div className="app-layout">
      <NavBar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/events/create" element={<CreateEventPage />} />
          <Route path="/events/mine" element={<MyEventsPage />} />
          <Route path="/bookings/request" element={<RequestBookingPage />} />
          <Route path="/bookings/mine" element={<MyBookingsPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/bookings" element={<AdminBookingsPage />} />
        </Routes>
      </main>
    </div>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
export default App; 