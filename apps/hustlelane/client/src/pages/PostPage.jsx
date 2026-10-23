import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import api from '../api';
import Shell from '../components/Shell';
import { useAuth } from '../context/AuthContext';

export default function PostPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [meta, setMeta] = useState({ types: [], metros: [], provinces: [] });
  const [form, setForm] = useState({
    title: '',
    company: '',
    description: '',
    type: 'gig',
    province: 'Gauteng',
    metro: 'Johannesburg',
    remote: true,
    stipendZar: 3000,
    unpaid: false,
    loadSheddingFriendly: true,
    whatsappContact: '',
    tags: 'junior,react',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/opportunities/meta/filters').then((res) => setMeta(res.data));
  }, []);

  if (user?.role !== 'poster' && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const set = (k, cast) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: cast ? cast(v) : v }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/opportunities', {
        ...form,
        stipendZar: form.unpaid ? 0 : Number(form.stipendZar),
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      navigate(`/opportunities/${data.opportunity._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post');
    }
  };

  return (
    <Shell>
      <h1>Post an opportunity</h1>
      <p className="lede">Youth-facing copy wins. Add metro + WhatsApp so seekers can move fast.</p>
      <form className="panel stack post-form" onSubmit={submit}>
        <label>
          Title
          <input value={form.title} onChange={set('title')} required />
        </label>
        <label>
          Company
          <input value={form.company} onChange={set('company')} required />
        </label>
        <label>
          Description
          <textarea value={form.description} onChange={set('description')} rows={5} required />
        </label>
        <div className="row2">
          <label>
            Type
            <select value={form.type} onChange={set('type')}>
              {meta.types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label>
            Province
            <select value={form.province} onChange={set('province')}>
              {meta.provinces.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Metro / area
          <select value={form.metro} onChange={set('metro')}>
            {meta.metros.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label>
          Stipend (ZAR)
          <input type="number" value={form.stipendZar} onChange={set('stipendZar')} disabled={form.unpaid} />
        </label>
        <label>
          WhatsApp contact
          <input value={form.whatsappContact} onChange={set('whatsappContact')} placeholder="27…" />
        </label>
        <label>
          Tags (comma separated)
          <input value={form.tags} onChange={set('tags')} />
        </label>
        <label className="check">
          <input type="checkbox" checked={form.remote} onChange={set('remote')} /> Remote OK
        </label>
        <label className="check">
          <input type="checkbox" checked={form.unpaid} onChange={set('unpaid')} /> Unpaid
        </label>
        <label className="check">
          <input type="checkbox" checked={form.loadSheddingFriendly} onChange={set('loadSheddingFriendly')} />{' '}
          Load-shedding friendly
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn primary" type="submit">
          Publish
        </button>
      </form>
    </Shell>
  );
}
