import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Shell({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="shell">
      <div className="top-stripe" aria-hidden="true" />
      <header className="topbar">
        <Link to="/" className="brand" aria-label="HustleLane home">
          <span className="brand-mark">HL</span>
          <span className="brand-text">
            HUSTLE<em>LANE</em>
          </span>
        </Link>
        <nav>
          <NavLink to="/" end>
            Feed
          </NavLink>
          <NavLink to="/lanes">Lanes</NavLink>
          <NavLink to="/applications">Applications</NavLink>
          {(user?.role === 'poster' || user?.role === 'admin') && <NavLink to="/post">Post</NavLink>}
        </nav>
        <div className="top-right">
          <NotificationBell />
          <span className="who">
            <span className="avatar" style={{ background: user?.avatarColor }}>
              {user?.name?.charAt(0)}
            </span>
            <span className="who-meta">
              <strong>{user?.name?.split(' ')[0]}</strong>
              <small>{user?.role}</small>
            </span>
          </span>
          <button type="button" className="btn ghost" onClick={logout}>
            Out
          </button>
        </div>
      </header>
      <main className="main fade-in">{children}</main>
    </div>
  );
}
