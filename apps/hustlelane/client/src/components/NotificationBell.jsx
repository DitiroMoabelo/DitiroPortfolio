import { useEffect, useState } from 'react';
import api from '../api';
import { getSocket } from '../socket';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    api.get('/notifications').then((res) => {
      setItems(res.data.notifications);
      setUnread(res.data.unread);
    }).catch(() => {});
    const socket = getSocket();
    const onNew = (n) => {
      setItems((prev) => [n, ...prev]);
      setUnread((u) => u + 1);
    };
    socket?.on('notification:new', onNew);
    return () => socket?.off('notification:new', onNew);
  }, []);

  return (
    <div className="notif">
      <button type="button" className="btn ghost" onClick={() => setOpen((o) => !o)}>
        Alerts {unread > 0 && <em>{unread}</em>}
      </button>
      {open && (
        <div className="notif-panel">
          <button
            type="button"
            className="linkish"
            onClick={() => {
              api.patch('/notifications/read-all');
              setUnread(0);
            }}
          >
            Mark read
          </button>
          <ul>
            {items.map((n) => (
              <li key={n._id}>
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
