import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Shell from '../components/Shell';
import { getSocket } from '../socket';
import { useAuth } from '../context/AuthContext';

function zar(n) {
  if (!n) return 'Unpaid / stipend TBD';
  return `R${Number(n).toLocaleString('en-ZA')}`;
}

export default function FeedPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ type: '', metro: '', loadSheddingFriendly: false, q: '' });
  const [meta, setMeta] = useState({ types: [], metros: [] });
  const [items, setItems] = useState([]);

  const load = async () => {
    const params = {};
    if (filters.type) params.type = filters.type;
    if (filters.metro) params.metro = filters.metro;
    if (filters.loadSheddingFriendly) params.loadSheddingFriendly = 'true';
    if (filters.q) params.q = filters.q;
    const { data } = await api.get('/opportunities', { params });
    setItems(data.opportunities);
  };

  useEffect(() => {
    api.get('/opportunities/meta/filters').then((res) => setMeta(res.data));
  }, []);

  useEffect(() => {
    load().catch(console.error);
  }, [filters]);

  useEffect(() => {
    const socket = getSocket();
    const onCreated = (op) => setItems((prev) => [op, ...prev]);
    socket?.on('opportunity:created', onCreated);
    return () => socket?.off('opportunity:created', onCreated);
  }, []);

  return (
    <Shell>
      <section className="hero-strip">
        <p className="kicker">Sawubona · {user?.metro || user?.province || 'Mzansi'}</p>
        <h1>Your next lane</h1>
        <p className="lede">
          Hi {user?.name?.split(' ')[0]} — community posts below. For Remotive remote + Adzuna ZA imports, open{' '}
          <Link to="/lanes" className="linkish">
            Lanes
          </Link>
          .
        </p>
      </section>

      <div className="filters">
        <input
          placeholder="Search titles, skills…"
          value={filters.q}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
        />
        <select value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}>
          <option value="">All types</option>
          {meta.types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select value={filters.metro} onChange={(e) => setFilters((f) => ({ ...f, metro: e.target.value }))}>
          <option value="">All metros</option>
          {meta.metros.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <label className="check">
          <input
            type="checkbox"
            checked={filters.loadSheddingFriendly}
            onChange={(e) => setFilters((f) => ({ ...f, loadSheddingFriendly: e.target.checked }))}
          />
          ⚡ Friendly
        </label>
      </div>

      <div className="feed">
        {items.map((op, i) => (
          <Link key={op._id} to={`/opportunities/${op._id}`} className="op-card" style={{ animationDelay: `${i * 0.04}s` }}>
            <div className="op-top">
              <span className="type">{op.type}</span>
              {op.loadSheddingFriendly && <span className="tag ls">Load-shedding OK</span>}
              {op.remote && <span className="tag">Remote</span>}
            </div>
            <h2>{op.title}</h2>
            <p className="company">{op.company}</p>
            <p className="place">
              {op.metro} · {op.province}
            </p>
            <p className="pay">{op.unpaid ? 'Unpaid' : zar(op.stipendZar)}</p>
          </Link>
        ))}
        {items.length === 0 && <p className="muted">No matches — loosen the filters.</p>}
      </div>
    </Shell>
  );
}
