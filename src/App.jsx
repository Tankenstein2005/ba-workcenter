import { useEffect, useState } from "react";
import { Routes, Route, NavLink, Link } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage.jsx";
import AvailabilityPage from "./pages/AvailabilityPage.jsx";
import BookingsPage from "./pages/BookingsPage.jsx";
import PublicBookingPage from "./pages/PublicBookingPage.jsx";
import ConfirmationPage from "./pages/ConfirmationPage.jsx";

function EventTypesIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5" width="16" height="4" rx="2" />
      <rect x="4" y="10" width="10" height="4" rx="2" />
      <rect x="4" y="15" width="13" height="4" rx="2" />
    </svg>
  );
}

function BookingsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="6" width="16" height="14" rx="3" />
      <path d="M8 4v4" />
      <path d="M16 4v4" />
      <path d="M4 10h16" />
    </svg>
  );
}

function AvailabilityIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 4v8l5 3" />
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const storedValue = window.localStorage.getItem("ba-sidebar-collapsed");
    setSidebarCollapsed(storedValue === "true");
  }, []);

  function toggleSidebar() {
    setSidebarCollapsed((current) => {
      const nextValue = !current;
      window.localStorage.setItem("ba-sidebar-collapsed", String(nextValue));
      return nextValue;
    });
  }

  return (
    <div
      className={sidebarCollapsed ? "app-shell sidebar-collapsed" : "app-shell"}
    >
      <aside className={sidebarCollapsed ? "sidebar is-collapsed" : "sidebar"}>
        <div>
          <div className="sidebar-topbar">
            <div className="brand">
              <Link
                className="brand-mark brand-mark-link"
                to="/"
                aria-label="Go to dashboard"
              >
                B
              </Link>
              <div className="brand-copy">
                <h1>
                  <Link className="brand-link" to="/">
                    Broken Arrow
                  </Link>
                </h1>
                <p>Scheduling workspace</p>
              </div>
            </div>
            <button
              type="button"
              className="sidebar-toggle"
              onClick={toggleSidebar}
              aria-label={
                sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
              aria-pressed={sidebarCollapsed}
            >
              {sidebarCollapsed ? ">" : "<"}
            </button>
          </div>

          <nav className="nav-links">
            <NavLink to="/" end title="Event types">
              <span className="nav-icon" aria-hidden="true">
                <EventTypesIcon />
              </span>
              <span className="nav-label">Event types</span>
            </NavLink>
            <NavLink to="/bookings" title="Bookings">
              <span className="nav-icon" aria-hidden="true">
                <BookingsIcon />
              </span>
              <span className="nav-label">Bookings</span>
            </NavLink>
            <NavLink to="/availability" title="Availability">
              <span className="nav-icon" aria-hidden="true">
                <AvailabilityIcon />
              </span>
              <span className="nav-label">Availability</span>
            </NavLink>
          </nav>
        </div>

        <div className="sidebar-footer">
          <p>Client-ready scheduling system</p>
        </div>
      </aside>
      <main className="dashboard-main">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/availability" element={<AvailabilityPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/book/:slug" element={<PublicBookingPage />} />
      <Route path="/confirmation/:reference" element={<ConfirmationPage />} />
      <Route path="/*" element={<DashboardLayout />} />
    </Routes>
  );
}
