import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const DEMO_ENABLED_BUILD = import.meta.env.VITE_ENABLE_DEMO === 'true';

export default function LoginPage() {
  const { user, login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [demoAccounts, setDemoAccounts] = useState(DEMO_ENABLED_BUILD);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'seeker',
    metro: 'Braamfontein',
    province: 'Gauteng',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get('/auth/config')
      .then((res) => setDemoAccounts(Boolean(res.data.demoAccounts) || DEMO_ENABLED_BUILD))
      .catch(() => setDemoAccounts(DEMO_ENABLED_BUILD));
  }, []);

  if (user) return <Navigate to="/" replace />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const fillDemo = (email) => {
    setMode('login');
    setForm((f) => ({ ...f, email, password: 'demo1234' }));
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.password || form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <section className="auth-hero">
        <div className="lane-stripes" aria-hidden="true" />
        <div className="hero-copy">
          <p className="kicker">South Africa · youth · hustle</p>
          <h1 className="auth-brand">
            HUSTLE
            <span>LANE</span>
          </h1>
          <p className="hero-line">Find the next learnership, gig, or internship in your metro — not another feed clone.</p>
          <div className="hero-pills">
            <span>Soweto</span>
            <span>Braamfontein</span>
            <span>Khayelitsha</span>
            <span>Durban</span>
          </div>
        </div>
      </section>

      <section className="auth-card">
        <div className="auth-card-inner">
          <p className="panel-label">{mode === 'login' ? 'Jump in' : 'Claim your lane'}</p>
          <h2>{mode === 'login' ? 'Sign in' : 'Join HustleLane'}</h2>
          <form onSubmit={submit} className="stack">
            {mode === 'register' && (
              <>
                <label>
                  Name
                  <input value={form.name} onChange={set('name')} required minLength={2} maxLength={80} />
                </label>
                <label>
                  I am a
                  <select value={form.role} onChange={set('role')}>
                    <option value="seeker">Opportunity seeker</option>
                    <option value="poster">Employer / poster</option>
                  </select>
                </label>
                <label>
                  Metro
                  <input value={form.metro} onChange={set('metro')} placeholder="e.g. Soweto" maxLength={80} />
                </label>
              </>
            )}
            <label>
              Email
              <input type="email" value={form.email} onChange={set('email')} required autoComplete="username" />
            </label>
            <label>
              Password
              <input
                type="password"
                value={form.password}
                onChange={set('password')}
                required
                minLength={8}
                maxLength={128}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="Min 8 characters"
              />
            </label>
            {error && <p className="error">{error}</p>}
            <button className="btn primary block" disabled={busy} type="submit">
              {busy ? '…' : mode === 'login' ? 'Enter the lane' : 'Create account'}
            </button>
          </form>
          <button type="button" className="linkish" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'New here? Register' : 'Have an account? Sign in'}
          </button>
          {demoAccounts && (
            <div className="demos">
              <p className="muted">
                Local demo only · fills password <code>demo1234</code>
              </p>
              <button type="button" className="chip" onClick={() => fillDemo('nomsa@hustlelane.dev')}>
                Seeker · Nomsa
              </button>
              <button type="button" className="chip" onClick={() => fillDemo('kagiso@hustlelane.dev')}>
                Poster · Kagiso
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
