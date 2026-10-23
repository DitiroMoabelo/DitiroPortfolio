import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import Shell from '../components/Shell';
import { useAuth } from '../context/AuthContext';

export default function OpportunityPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [op, setOp] = useState(null);
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get(`/opportunities/${id}`).then((res) => setOp(res.data.opportunity));
  }, [id]);

  const apply = async (e) => {
    e.preventDefault();
    try {
      await api.post('/applications', { opportunityId: id, coverNote: note });
      setMsg('Application submitted.');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Could not apply');
    }
  };

  if (!op) {
    return (
      <Shell>
        <p className="boot">Loading…</p>
      </Shell>
    );
  }

  const wa = op.whatsappContact || op.postedBy?.whatsapp;
  const waLink = wa
    ? `https://wa.me/${wa.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I saw “${op.title}” on HustleLane`)}`
    : null;

  return (
    <Shell>
      <Link to="/" className="linkish">
        ← Feed
      </Link>
      <article className="detail">
        <div className="op-top">
          <span className="type">{op.type}</span>
          {op.loadSheddingFriendly && <span className="tag ls">Load-shedding friendly</span>}
        </div>
        <h1>{op.title}</h1>
        <p className="company">{op.company}</p>
        <p className="place">
          {op.metro}, {op.province} {op.remote ? '· Remote OK' : ''}
        </p>
        <p className="pay">{op.unpaid ? 'Unpaid' : `R${Number(op.stipendZar).toLocaleString('en-ZA')} stipend`}</p>
        <p className="body">{op.description}</p>
        <div className="tags">
          {(op.tags || []).map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>

        <div className="actions">
          {waLink && (
            <a className="btn wa" href={waLink} target="_blank" rel="noreferrer">
              WhatsApp poster
            </a>
          )}
        </div>

        {user?.role === 'seeker' && (
          <form className="panel stack" onSubmit={apply}>
            <h2>Apply in-app</h2>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} placeholder="Short cover note…" />
            <button className="btn primary" type="submit">
              Submit application
            </button>
            {msg && <p className="muted">{msg}</p>}
          </form>
        )}
      </article>
    </Shell>
  );
}
