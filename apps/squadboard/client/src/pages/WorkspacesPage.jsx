import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Shell from '../components/Shell';
import { useAuth } from '../context/AuthContext';

export default function WorkspacesPage() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const load = async () => {
    const { data } = await api.get('/workspaces');
    setWorkspaces(data.workspaces);
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post('/workspaces', { name, description });
    setName('');
    setDescription('');
    await load();
  };

  return (
    <Shell crumb="Workspaces">
      <section className="page-head">
        <div>
          <p className="eyebrow">Command floor</p>
          <h1>Your squads</h1>
          <p className="lede">Pick a workspace or spin up a new one. Roles travel with every board — viewers watch, members move.</p>
        </div>
      </section>

      <div className="split">
        <div className="ws-list">
          {workspaces.map((ws) => {
            const myRole = ws.members?.find((m) => {
              const uid = m.user?._id?.toString?.() || m.user?._id;
              return uid === user?.id || m.user?.email === user?.email;
            })?.role;
            return (
              <Link key={ws._id} to={`/workspaces/${ws._id}`} className="ws-card">
                <h3>{ws.name}</h3>
                <p>{ws.description || 'No description'}</p>
                <div className="meta">
                  <span>{ws.members?.length || 0} members</span>
                  {myRole && <span className="role-pill">{myRole}</span>}
                </div>
                <div className="avatars">
                  {ws.members?.slice(0, 5).map((m) => (
                    <span key={m.user?._id || m.user} className="avatar sm" style={{ background: m.user?.avatarColor }}>
                      {m.user?.name?.charAt(0)}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
          {workspaces.length === 0 && <p className="muted">No workspaces yet — create one.</p>}
        </div>

        <form className="panel stack" onSubmit={create}>
          <h2>New workspace</h2>
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Cape Town Mobile Team" />
          </label>
          <label>
            Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </label>
          <button className="btn primary" type="submit">
            Create
          </button>
        </form>
      </div>
    </Shell>
  );
}
