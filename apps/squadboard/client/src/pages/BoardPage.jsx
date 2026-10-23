import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import Shell from '../components/Shell';
import { getSocket } from '../socket';

export default function BoardPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [role, setRole] = useState('viewer');
  const [title, setTitle] = useState('');
  const [dragId, setDragId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState('');

  const canEdit = ['owner', 'admin', 'member'].includes(role);

  const columns = useMemo(() => {
    const cols = [...(project?.columns || [])].sort((a, b) => a.order - b.order);
    return cols;
  }, [project]);

  const load = async () => {
    const { data } = await api.get(`/projects/${projectId}`);
    setProject(data.project);
    setTasks(data.tasks);
    setRole(data.yourRole);
  };

  useEffect(() => {
    load().catch(console.error);
    const socket = getSocket();
    socket?.emit('project:join', projectId);

    const onCreated = (task) => setTasks((prev) => (prev.some((t) => t._id === task._id) ? prev : [...prev, task]));
    const onUpdated = (task) =>
      setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
    const onDeleted = ({ taskId }) => setTasks((prev) => prev.filter((t) => t._id !== taskId));

    socket?.on('task:created', onCreated);
    socket?.on('task:updated', onUpdated);
    socket?.on('task:deleted', onDeleted);

    return () => {
      socket?.emit('project:leave', projectId);
      socket?.off('task:created', onCreated);
      socket?.off('task:updated', onUpdated);
      socket?.off('task:deleted', onDeleted);
    };
  }, [projectId]);

  const addTask = async (e) => {
    e.preventDefault();
    if (!canEdit) return;
    await api.post(`/tasks/project/${projectId}`, { title, status: 'todo' });
    setTitle('');
    await load();
  };

  const moveTask = async (taskId, status) => {
    if (!canEdit) return;
    await api.patch(`/tasks/${taskId}`, { status });
  };

  const onDrop = async (status) => {
    if (!dragId || !canEdit) return;
    await moveTask(dragId, status);
    setDragId(null);
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!selected || !canEdit) return;
    const { data } = await api.post(`/tasks/${selected._id}/comments`, { body: comment });
    setSelected(data.task);
    setComment('');
    setTasks((prev) => prev.map((t) => (t._id === data.task._id ? data.task : t)));
  };

  if (!project) {
    return (
      <Shell>
        <p className="boot">Loading board…</p>
      </Shell>
    );
  }

  return (
    <Shell crumb={project.name}>
      <section className="page-head board-head">
        <div>
          <Link to={`/workspaces/${project.workspace}`} className="linkish">
            ← Workspace
          </Link>
          <p className="eyebrow">Live board · {role}</p>
          <h1>{project.name}</h1>
          <p className="lede">
            Drag cards across columns — Socket.io keeps the squad in sync
            {!canEdit && ' · your role is read-only'}
          </p>
        </div>
        {canEdit && (
          <form className="inline-form" onSubmit={addTask}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New task…" required />
            <button className="btn primary" type="submit">
              Add
            </button>
          </form>
        )}
      </section>

      <div className="board">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key).sort((a, b) => a.order - b.order);
          return (
            <div
              key={col.key}
              className="column"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(col.key)}
            >
              <header>
                <h2>{col.title}</h2>
                <span>{colTasks.length}</span>
              </header>
              <div className="cards">
                {colTasks.map((task) => (
                  <article
                    key={task._id}
                    className={`task priority-${task.priority}`}
                    draggable={canEdit}
                    onDragStart={() => setDragId(task._id)}
                    onClick={() => setSelected(task)}
                  >
                    <h3>{task.title}</h3>
                    <div className="task-meta">
                      <span className="prio">{task.priority}</span>
                      {task.assignees?.slice(0, 3).map((a) => (
                        <span key={a._id} className="avatar xs" style={{ background: a.avatarColor }} title={a.name}>
                          {a.name.charAt(0)}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="drawer-backdrop" onClick={() => setSelected(null)}>
          <aside className="drawer" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="linkish" onClick={() => setSelected(null)}>
              Close
            </button>
            <h2>{selected.title}</h2>
            <p className="muted">{selected.description || 'No description'}</p>
            <p>
              Status: <strong>{selected.status}</strong> · Priority: <strong>{selected.priority}</strong>
            </p>
            <h3>Comments</h3>
            <ul className="comments">
              {(selected.comments || []).map((c) => (
                <li key={c._id}>
                  <strong>{c.author?.name || 'User'}</strong>
                  <span>{c.body}</span>
                </li>
              ))}
            </ul>
            {canEdit && (
              <form className="stack" onSubmit={addComment}>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} required />
                <button className="btn primary" type="submit">
                  Comment
                </button>
              </form>
            )}
          </aside>
        </div>
      )}
    </Shell>
  );
}
