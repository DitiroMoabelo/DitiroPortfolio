import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMOS = [
  { role: 'Owner', email: 'thabo@squadboard.dev', hint: 'Full control' },
  { role: 'Admin', email: 'lerato@squadboard.dev', hint: 'Manage squad' },
  { role: 'Member', email: 'sipho@squadboard.dev', hint: 'Move cards' },
  { role: 'Viewer', email: 'ayesha@squadboard.dev', hint: 'Read only' },
];

export default function LoginPage() {
  const { user, login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError('Enter a password (at least 6 characters).');
      return;
    }
    setBusy(true);
    setError('');
    try {
      if (mode === 'login') await login(email, password);
      else await register(name, email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-stage">
        <div className="auth-grid" aria-hidden="true" />
        <div className="auth-stamp">SB</div>
        <p className="auth-kicker">MERN · RBAC · realtime</p>
        <h1 className="auth-brand">
          Squad
          <span>Board</span>
        </h1>
        <p className="auth-tagline">The playbook your team actually opens.</p>
        <ul className="auth-beats">
          <li>
            <strong>01</strong> Roles that block bad moves
          </li>
          <li>
            <strong>02</strong> Kanban that updates live
          </li>
          <li>
            <strong>03</strong> Dashboards for workload truth
          </li>
        </ul>
        <div className="auth-orbit" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-panel-inner">
          <p className="panel-label">{mode === 'login' ? 'Enter the board' : 'Create your lane'}</p>
          <h2>{mode === 'login' ? 'Sign in' : 'Register'}</h2>
          <form onSubmit={submit} className="stack">
            {mode === 'register' && (
              <label>
                Name
                <input value={name} onChange={(e) => setName(e.target.value)} required />
              </label>
            )}
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label>
              Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </label>
            {error && <p className="error">{error}</p>}
            <button className="btn primary block" disabled={busy} type="submit">
              {busy ? 'Connecting…' : mode === 'login' ? 'Open workspace' : 'Join SquadBoard'}
            </button>
          </form>
          <button type="button" className="linkish" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Need an account? Register' : 'Have an account? Sign in'}
          </button>
          <div className="demo-box">
            <p className="muted">
              Try a role · password <code>demo1234</code>
            </p>
            <div className="demo-grid">
              {DEMOS.map((d) => (
                <button
                  key={d.email}
                  type="button"
                  className="demo-chip"
                onClick={() => {
                  setMode('login');
                  setEmail(d.email);
                  setPassword('demo1234');
                  setError('');
                }}
                >
                  <span>{d.role}</span>
                  <small>{d.hint}</small>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
