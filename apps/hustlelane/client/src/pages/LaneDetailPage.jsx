import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import Shell from '../components/Shell';

export default function LaneDetailPage() {
  const { source, externalId } = useParams();
  const [job, setJob] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/lanes/job/${source}/${externalId}`)
      .then((res) => setJob(res.data.job))
      .catch((err) => setError(err.response?.data?.message || 'Could not load listing'));
  }, [source, externalId]);

  if (error) {
    return (
      <Shell>
        <Link to="/lanes" className="linkish">
          ← Lanes
        </Link>
        <p className="error">{error}</p>
      </Shell>
    );
  }

  if (!job) {
    return (
      <Shell>
        <p className="boot">Loading lane…</p>
      </Shell>
    );
  }

  return (
    <Shell>
      <Link to="/lanes" className="linkish">
        ← Lanes
      </Link>
      <article className="detail">
        <div className="op-top">
          <span className="type">{job.sourceLabel}</span>
          {job.remote && <span className="tag">Remote</span>}
          {job.saFriendly && <span className="tag ls">SA-friendly</span>}
        </div>
        <h1>{job.title}</h1>
        <p className="company">{job.company}</p>
        <p className="place">{job.location}</p>
        {job.salaryText && <p className="pay">{job.salaryText}</p>}
        <p className="body">{job.description}</p>
        {job.skills?.length > 0 && (
          <div className="tags">
            {job.skills.map((s) => (
              <span key={s} className="tag">
                {s}
              </span>
            ))}
          </div>
        )}
        <div className="actions">
          <a className="btn primary" href={job.url} target="_blank" rel="noopener noreferrer">
            Apply on {job.sourceLabel}
          </a>
        </div>
        <p className="muted">
          External listing — applications happen on the source site. Community HustleLane posts still use in-app apply +
          WhatsApp.
        </p>
      </article>
    </Shell>
  );
}
