import { useEffect, useState } from 'react';
import api from '../api';
import Shell from '../components/Shell';
import { useAuth } from '../context/AuthContext';

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);

  const load = () => api.get('/applications/mine').then((res) => setApplications(res.data.applications));

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/applications/${id}/status`, { status });
    await load();
  };

  const isPoster = user?.role === 'poster' || user?.role === 'admin';

  return (
    <Shell>
      <h1>{isPoster ? 'Incoming applications' : 'Your applications'}</h1>
      <div className="app-list">
        {applications.map((a) => (
          <article key={a._id} className="panel app-row">
            <div>
              <h3>{a.opportunity?.title || 'Opportunity'}</h3>
              <p className="muted">
                {isPoster
                  ? `${a.seeker?.name} · ${a.seeker?.metro || ''}`
                  : `${a.opportunity?.company} · ${a.opportunity?.metro}`}
              </p>
              {a.coverNote && <p>{a.coverNote}</p>}
              <span className="type">{a.status}</span>
            </div>
            {isPoster && (
              <div className="row-actions">
                {['reviewing', 'shortlisted', 'accepted', 'rejected'].map((s) => (
                  <button key={s} type="button" className="chip" onClick={() => updateStatus(a._id, s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </article>
        ))}
        {applications.length === 0 && <p className="muted">Nothing here yet.</p>}
      </div>
    </Shell>
  );
}
