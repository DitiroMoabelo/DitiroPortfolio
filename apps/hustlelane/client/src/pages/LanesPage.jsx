import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Shell from '../components/Shell';

export default function LanesPage() {
  const [filters, setFilters] = useState({
    source: 'all',
    q: '',
    skills: '',
    location: '',
    category: '',
    saFriendlyOnly: true,
  });
  const [meta, setMeta] = useState({ remotiveCategories: [], adzuna: { configured: false }, notes: [] });
  const [result, setResult] = useState({ jobs: [], sources: {}, errors: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/lanes/meta').then((res) => setMeta(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    const params = {
      source: filters.source,
      q: filters.q || undefined,
      skills: filters.skills || undefined,
      location: filters.location || undefined,
      category: filters.category || undefined,
      saFriendlyOnly: filters.saFriendlyOnly ? 'true' : 'false',
    };
    api
      .get('/lanes', { params })
      .then((res) => {
        if (!cancelled) setResult(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Could not load external lanes');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filters]);

  return (
    <Shell>
      <section className="hero-strip">
        <p className="kicker">Imported lanes · legal APIs only</p>
        <h1>Remote &amp; ZA boards</h1>
        <p className="lede">
          Remotive remote roles (SA-friendly filter) plus Adzuna South Africa when keys are configured — not LinkedIn
          scrapes.
        </p>
      </section>

      <div className="source-status">
        <span className={`pill ${result.sources?.remotive?.ok !== false ? 'on' : 'off'}`}>
          Remotive · {result.sources?.remotive?.count ?? '…'}
        </span>
        <span className={`pill ${meta.adzuna?.configured ? 'on' : 'warn'}`}>
          Adzuna ZA · {meta.adzuna?.configured ? `${result.sources?.adzuna?.count ?? 0} live` : 'keys needed'}
        </span>
      </div>

      {!meta.adzuna?.configured && (
        <p className="banner-note">
          Adzuna SA import is offline on this deployment. Remotive remote lanes still work. Keys are stored only on the
          server — never in the browser.
        </p>
      )}

      <div className="filters lanes-filters">
        <select value={filters.source} onChange={(e) => setFilters((f) => ({ ...f, source: e.target.value }))}>
          <option value="all">All sources</option>
          <option value="remotive">Remotive only</option>
          <option value="adzuna">Adzuna ZA only</option>
        </select>
        <input
          placeholder="Keywords (e.g. react intern)"
          value={filters.q}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
        />
        <input
          placeholder="Skills comma-separated"
          value={filters.skills}
          onChange={(e) => setFilters((f) => ({ ...f, skills: e.target.value }))}
        />
        <input
          placeholder="Location (Joburg, Cape Town…)"
          value={filters.location}
          onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
        />
        <select value={filters.category} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}>
          {(meta.remotiveCategories || []).map((c) => (
            <option key={c.value || 'all'} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <label className="check">
          <input
            type="checkbox"
            checked={filters.saFriendlyOnly}
            onChange={(e) => setFilters((f) => ({ ...f, saFriendlyOnly: e.target.checked }))}
          />
          SA-friendly remote
        </label>
      </div>

      {loading && <p className="muted">Pulling lanes…</p>}
      {error && <p className="error">{error}</p>}
      {result.errors?.length > 0 && (
        <p className="muted">
          Partial load: {result.errors.map((e) => `${e.source}: ${e.message}`).join(' · ')}
        </p>
      )}

      <div className="feed">
        {result.jobs.map((job, i) => (
          <Link
            key={job.id}
            to={`/lanes/${job.source}/${job.externalId}`}
            className="op-card lane-card"
            style={{ animationDelay: `${i * 0.03}s` }}
          >
            <div className="op-top">
              <span className="type">{job.sourceLabel}</span>
              {job.remote && <span className="tag">Remote</span>}
              {job.saFriendly && job.source === 'remotive' && <span className="tag ls">SA-friendly</span>}
              {job.category && <span className="tag">{job.category}</span>}
            </div>
            <h2>{job.title}</h2>
            <p className="company">{job.company}</p>
            <p className="place">{job.location}</p>
            {job.skills?.length > 0 && (
              <div className="tags">
                {job.skills.slice(0, 5).map((s) => (
                  <span key={s} className="tag">
                    {s}
                  </span>
                ))}
              </div>
            )}
            {job.salaryText && <p className="pay">{job.salaryText}</p>}
          </Link>
        ))}
        {!loading && result.jobs.length === 0 && <p className="muted">No imported listings matched — loosen filters.</p>}
      </div>
    </Shell>
  );
}
