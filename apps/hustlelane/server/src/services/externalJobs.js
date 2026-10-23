/**
 * Legal aggregators only — Remotive (public API) + Adzuna (requires keys).
 * Normalized shape for the HustleLane "Lanes" UI.
 */

const cache = new Map();
const CACHE_MS = 10 * 60 * 1000;

function cacheGet(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_MS) {
    cache.delete(key);
    return null;
  }
  return hit.value;
}

function cacheSet(key, value) {
  cache.set(key, { at: Date.now(), value });
}

function stripHtml(html = '') {
  return String(html)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchesSkills(job, skills) {
  if (!skills?.length) return true;
  const hay = `${job.title} ${(job.skills || []).join(' ')} ${job.description || ''}`.toLowerCase();
  return skills.every((s) => hay.includes(s.toLowerCase()));
}

/** Locations that are workable for SA remote seekers */
const SA_FRIENDLY_LOC = [
  'worldwide',
  'anywhere',
  'remote',
  'africa',
  'south africa',
  'za',
  'emea',
  'global',
  'utc',
  'timezone',
];

function isSaFriendlyRemote(location = '') {
  const loc = location.toLowerCase();
  if (!loc || loc === 'null') return true;
  return SA_FRIENDLY_LOC.some((k) => loc.includes(k));
}

function normalizeRemotive(job) {
  return {
    id: `remotive:${job.id}`,
    externalId: String(job.id),
    source: 'remotive',
    sourceLabel: 'Remotive',
    title: job.title,
    company: job.company_name,
    description: stripHtml(job.description || '').slice(0, 1200),
    descriptionHtml: job.description || '',
    location: job.candidate_required_location || 'Remote',
    remote: true,
    saFriendly: isSaFriendlyRemote(job.candidate_required_location),
    skills: Array.isArray(job.tags) ? job.tags.map((t) => String(t).trim()).filter(Boolean) : [],
    category: job.category || 'Remote',
    jobType: job.job_type || '',
    salaryText: job.salary || '',
    url: job.url,
    publishedAt: job.publication_date || null,
    logo: job.company_logo || '',
  };
}

function normalizeAdzuna(job) {
  const area = Array.isArray(job.location?.area) ? job.location.area.join(', ') : '';
  const where = job.location?.display_name || area || 'South Africa';
  const skills = [];
  if (job.category?.label) skills.push(job.category.label);
  return {
    id: `adzuna:${job.id}`,
    externalId: String(job.id),
    source: 'adzuna',
    sourceLabel: 'Adzuna ZA',
    title: job.title,
    company: job.company?.display_name || 'Company on Adzuna',
    description: stripHtml(job.description || '').slice(0, 1200),
    descriptionHtml: job.description || '',
    location: where,
    remote: /remote/i.test(`${job.title} ${job.description || ''}`),
    saFriendly: true,
    skills,
    category: job.category?.label || 'Jobs ZA',
    jobType: job.contract_time || job.contract_type || '',
    salaryText:
      job.salary_min || job.salary_max
        ? `R${Math.round(job.salary_min || 0).toLocaleString('en-ZA')}${
            job.salary_max ? ` – R${Math.round(job.salary_max).toLocaleString('en-ZA')}` : '+'
          }`
        : '',
    url: job.redirect_url || job.adref || '',
    publishedAt: job.created || null,
    logo: '',
  };
}

export function getAdzunaStatus() {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  return {
    configured: Boolean(appId && appKey),
    country: process.env.ADZUNA_COUNTRY || 'za',
  };
}

async function fetchRemotive({ category, search } = {}) {
  const key = `remotive:${category || ''}:${search || ''}`;
  const cached = cacheGet(key);
  if (cached) return cached;

  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (search) params.set('search', search);
  const url = `https://remotive.com/api/remote-jobs${params.toString() ? `?${params}` : ''}`;

  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'HustleLane/1.0 (portfolio demo)' },
  });
  if (!res.ok) {
    throw new Error(`Remotive error ${res.status}`);
  }
  const data = await res.json();
  const jobs = (data.jobs || []).map(normalizeRemotive);
  cacheSet(key, jobs);
  return jobs;
}

async function fetchAdzuna({ what, where, page = 1 } = {}) {
  const status = getAdzunaStatus();
  if (!status.configured) {
    return { configured: false, jobs: [], message: 'Add ADZUNA_APP_ID and ADZUNA_APP_KEY to enable SA Adzuna listings.' };
  }

  const key = `adzuna:${status.country}:${what || ''}:${where || ''}:${page}`;
  const cached = cacheGet(key);
  if (cached) return { configured: true, jobs: cached };

  const params = new URLSearchParams({
    app_id: process.env.ADZUNA_APP_ID,
    app_key: process.env.ADZUNA_APP_KEY,
    results_per_page: '30',
  });
  // Adzuna expects the hyphenated param name
  params.set('content-type', 'application/json');
  if (what) params.set('what', what);
  if (where) params.set('where', where);

  const url = `https://api.adzuna.com/v1/api/jobs/${status.country}/search/${page}?${params}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'HustleLane/1.0 (portfolio demo)' },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Adzuna error ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  const jobs = (data.results || []).map(normalizeAdzuna);
  cacheSet(key, jobs);
  return { configured: true, jobs };
}

/**
 * Combined / filtered external lanes.
 */
export async function searchExternalLanes(query = {}) {
  const {
    source = 'all', // all | remotive | adzuna
    q = '',
    skills = '',
    location = '',
    saFriendlyOnly = 'true',
    category = '',
  } = query;

  const skillList = String(skills)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const what = q || skillList.join(' ');
  const errors = [];
  let remotive = [];
  let adzunaMeta = { configured: getAdzunaStatus().configured, jobs: [] };

  const wantRemotive = source === 'all' || source === 'remotive';
  const wantAdzuna = source === 'all' || source === 'adzuna';

  if (wantRemotive) {
    try {
      remotive = await fetchRemotive({
        category: category || undefined,
        search: what || undefined,
      });
    } catch (err) {
      errors.push({ source: 'remotive', message: err.message });
    }
  }

  if (wantAdzuna) {
    try {
      adzunaMeta = await fetchAdzuna({
        what: what || 'developer OR internship OR learnership',
        where: location || undefined,
      });
    } catch (err) {
      errors.push({ source: 'adzuna', message: err.message });
      adzunaMeta = { configured: getAdzunaStatus().configured, jobs: [] };
    }
  }

  let jobs = [];
  if (wantRemotive) jobs = jobs.concat(remotive);
  if (wantAdzuna) jobs = jobs.concat(adzunaMeta.jobs || []);

  if (saFriendlyOnly === 'true' || saFriendlyOnly === true) {
    jobs = jobs.filter((j) => j.source === 'adzuna' || j.saFriendly);
  }

  if (location) {
    const loc = location.toLowerCase();
    jobs = jobs.filter((j) => j.location.toLowerCase().includes(loc) || j.source === 'remotive');
  }

  if (skillList.length) {
    jobs = jobs.filter((j) => matchesSkills(j, skillList));
  }

  if (q && !what) {
    const needle = q.toLowerCase();
    jobs = jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(needle) ||
        j.company.toLowerCase().includes(needle) ||
        j.skills.some((s) => s.toLowerCase().includes(needle))
    );
  }

  jobs.sort((a, b) => String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')));

  return {
    jobs,
    count: jobs.length,
    sources: {
      remotive: { ok: !errors.find((e) => e.source === 'remotive'), count: remotive.length },
      adzuna: {
        ok: adzunaMeta.configured && !errors.find((e) => e.source === 'adzuna'),
        configured: Boolean(adzunaMeta.configured),
        count: (adzunaMeta.jobs || []).length,
        message: adzunaMeta.message,
      },
    },
    errors,
  };
}

export async function getExternalJob(id) {
  // id format source:externalId
  const [source, ...rest] = String(id).split(':');
  const externalId = rest.join(':');
  if (!source || !externalId) return null;

  if (source === 'remotive') {
    const jobs = await fetchRemotive({});
    return jobs.find((j) => j.externalId === externalId) || null;
  }

  if (source === 'adzuna') {
    const result = await fetchAdzuna({ what: '' });
    const found = (result.jobs || []).find((j) => j.externalId === externalId);
    if (found) return found;
    // Fallback: search by id isn't supported; return null
    return null;
  }

  return null;
}

export const REMOTIVE_CATEGORIES = [
  { value: '', label: 'All remote categories' },
  { value: 'software-dev', label: 'Software Development' },
  { value: 'customer-support', label: 'Customer Support' },
  { value: 'design', label: 'Design' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales / Business' },
  { value: 'product', label: 'Product' },
  { value: 'data', label: 'Data' },
  { value: 'devops', label: 'DevOps / Sysadmin' },
  { value: 'finance-legal', label: 'Finance / Legal' },
  { value: 'hr', label: 'HR' },
  { value: 'qa', label: 'QA' },
  { value: 'writing', label: 'Writing' },
];
