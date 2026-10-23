import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import Shell from '../components/Shell';
import { getSocket } from '../socket';

export default function WorkspacePage() {
  const { workspaceId } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [projects, setProjects] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [error, setError] = useState('');

  const load = async () => {
    const [ws, proj, dash] = await Promise.all([
      api.get(`/workspaces/${workspaceId}`),
      api.get(`/projects/workspace/${workspaceId}`),
      api.get(`/workspaces/${workspaceId}/dashboard`),
    ]);
    setWorkspace(ws.data.workspace);
    setProjects(proj.data.projects);
    setDashboard(dash.data);
  };

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.message || 'Failed to load'));
    const socket = getSocket();
    socket?.emit('workspace:join', workspaceId);
    return () => socket?.emit('workspace:leave', workspaceId);
  }, [workspaceId]);

  const canManage = ['owner', 'admin'].includes(dashboard?.yourRole);
  const canCreate = ['owner', 'admin', 'member'].includes(dashboard?.yourRole);

  const createProject = async (e) => {
    e.preventDefault();
    await api.post(`/projects/workspace/${workspaceId}`, { name: projectName });
    setProjectName('');
    await load();
  };

  const invite = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/workspaces/${workspaceId}/members`, { email: inviteEmail, role: inviteRole });
      setInviteEmail('');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Invite failed');
    }
  };

  if (!workspace) {
    return (
      <Shell>
        <p className="boot">{error || 'Loading workspace…'}</p>
      </Shell>
    );
  }

  return (
    <Shell crumb={workspace.name}>
      <section className="page-head">
        <div>
          <p className="eyebrow">Workspace · your role: {dashboard?.yourRole}</p>
          <h1>{workspace.name}</h1>
          <p className="lede">{workspace.description}</p>
        </div>
      </section>

      {error && <p className="error">{error}</p>}

      {dashboard && (
        <div className="dash-grid">
          <div className="stat">
            <span>Projects</span>
            <strong>{dashboard.summary.projectCount}</strong>
          </div>
          <div className="stat">
            <span>Tasks</span>
            <strong>{dashboard.summary.taskCount}</strong>
          </div>
          <div className="stat">
            <span>Done</span>
            <strong>{dashboard.summary.done}</strong>
          </div>
          <div className="stat warn">
            <span>Overdue</span>
            <strong>{dashboard.summary.overdue}</strong>
          </div>
        </div>
      )}

      {dashboard?.workload?.length > 0 && (
        <section className="panel">
          <h2>Team workload</h2>
          <div className="workload">
            {dashboard.workload.map((w) => (
              <div key={w.user._id} className="workload-row">
                <span className="avatar sm" style={{ background: w.user.avatarColor }}>
                  {w.user.name.charAt(0)}
                </span>
                <span>{w.user.name}</span>
                <span className="muted">{w.open} open · {w.done} done</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="split">
        <section>
          <div className="section-row">
            <h2>Projects</h2>
          </div>
          <div className="project-list">
            {projects.map((p) => (
              <Link key={p._id} to={`/projects/${p._id}`} className="project-card">
                <h3>{p.name}</h3>
                <p>{p.description || 'Open Kanban board →'}</p>
              </Link>
            ))}
          </div>
          {canCreate && (
            <form className="inline-form" onSubmit={createProject}>
              <input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="New project name"
                required
              />
              <button className="btn primary" type="submit">
                Add project
              </button>
            </form>
          )}
        </section>

        <aside className="stack">
          <section className="panel">
            <h2>Members</h2>
            <ul className="member-list">
              {workspace.members.map((m) => (
                <li key={m.user._id}>
                  <span className="avatar sm" style={{ background: m.user.avatarColor }}>
                    {m.user.name.charAt(0)}
                  </span>
                  <div>
                    <strong>{m.user.name}</strong>
                    <span className="muted">{m.user.email}</span>
                  </div>
                  <span className="role-pill">{m.role}</span>
                </li>
              ))}
            </ul>
          </section>

          {canManage && (
            <form className="panel stack" onSubmit={invite}>
              <h2>Invite teammate</h2>
              <p className="muted">They must already have a SquadBoard account.</p>
              <label>
                Email
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required />
              </label>
              <label>
                Role
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
              </label>
              <button className="btn primary" type="submit">
                Invite
              </button>
            </form>
          )}
        </aside>
      </div>
    </Shell>
  );
}
