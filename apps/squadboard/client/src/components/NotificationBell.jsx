import { useEffect, useState } from 'react';
import api from '../api';
import { getSocket } from '../socket';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);

  const load = async () => {
    const { data } = await api.get('/notifications');
    setItems(data.notifications);
    setUnread(data.unread);
  };

  useEffect(() => {
    load().catch(() => {});
    const socket = getSocket();
    if (!socket) return undefined;
    const onNew = (n) => {
      setItems((prev) => [n, ...prev].slice(0, 50));
      setUnread((u) => u + 1);
    };
    socket.on('notification:new', onNew);
    return () => socket.off('notification:new', onNew);
  }, []);

  const markAll = async () => {
    await api.patch('/notifications/read-all');
    setUnread(0);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="notif-wrap">
      <button type="button" className="btn ghost bell" onClick={() => setOpen((o) => !o)}>
        Alerts
        {unread > 0 && <span className="badge">{unread}</span>}
      </button>
      {open && (
        <div className="notif-panel">
          <div className="notif-head">
            <strong>Notifications</strong>
            <button type="button" className="linkish" onClick={markAll}>
              Mark all read
            </button>
          </div>
          {items.length === 0 && <p className="muted pad">No notifications yet.</p>}
          <ul>
            {items.map((n) => (
              <li key={n._id} className={n.read ? '' : 'unread'}>
                <strong>{n.title}</strong>
                <span>{n.body}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
