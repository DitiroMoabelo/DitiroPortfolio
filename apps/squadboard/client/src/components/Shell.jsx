import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

export default function Shell({ children, crumb }) {
  const { user, logout } = useAuth();

  return (
    <div className="shell">
      <div className="shell-rail" aria-hidden="true" />
      <header className="topbar">
        <div className="topbar-left">
          <Link to="/" className="brand" aria-label="SquadBoard home">
            <span className="brand-mark">SB</span>
            <span className="brand-text">
              Squad<em>Board</em>
            </span>
          </Link>
          {crumb && (
            <span className="crumb">
              <span className="crumb-slash">/</span>
              {crumb}
            </span>
          )}
        </div>
        <div className="topbar-right">
          <NotificationBell />
          <div className="user-chip">
            <div className="avatar" style={{ background: user?.avatarColor }} title={user?.email}>
              {user?.name?.charAt(0)}
            </div>
            <span className="user-name">{user?.name?.split(' ')[0]}</span>
          </div>
          <button type="button" className="btn ghost" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>
      <main className="main fade-in">{children}</main>
    </div>
  );
}
