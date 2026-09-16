import React, { useEffect, useMemo, useState } from 'react';

async function api(url, options = {}) {
  const response = await fetch(url, { credentials: 'same-origin', headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

const blankProject = { name: '', type: '', body: '', challenge: '', approach: '', result: '', url: '', tech: '' };
const blankService = { name: '', tagline: '', description: '', sortOrder: 0 };

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setError(''); setBusy(true);
    try { const data = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }); onLogin(data.user); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  return <main className="admin-shell"><div className="admin-login"><p className="admin-kicker">THE HIDDEN CHAMBER / ADMIN</p><h1>Enter the<br /><em>Archive.</em></h1><p>Manage the portfolio content, projects, services and contact enquiries.</p><form onSubmit={submit}><label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="username" required placeholder="admin@example.com" /></label><label>Password<input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" required placeholder="Your password" /></label><button disabled={busy}>{busy ? 'CHECKING…' : 'ENTER DASHBOARD ↗'}</button>{error && <div className="admin-error" role="alert">{error}</div>}</form><a href="/">← Return to portfolio</a></div></main>;
}

function Metric({ label, value, tone = '' }) { return <div className={`admin-metric ${tone}`}><span>{label}</span><strong>{value}</strong></div>; }

function ProjectEditor({ editing, onSaved, onCancel }) {
  const [form, setForm] = useState(editing ? { ...editing, tech: Array.isArray(editing.tech) ? editing.tech.join(', ') : '' } : blankProject);
  const [error, setError] = useState('');
  const update = (key, value) => setForm((state) => ({ ...state, [key]: value }));
  async function submit(event) {
    event.preventDefault(); setError('');
    const payload = { ...form, tech: form.tech.split(',').map((x) => x.trim()).filter(Boolean), sortOrder: Number(form.sortOrder || 0), featured: form.featured !== false };
    delete payload.id; delete payload.createdAt; delete payload.updatedAt;
    try { await api(editing ? `/api/projects/${editing.id}` : '/api/projects', { method: editing ? 'PUT' : 'POST', body: JSON.stringify(payload) }); onSaved(); }
    catch (e) { setError(e.message); }
  }
  return <form className="admin-editor" onSubmit={submit}><div className="admin-editor-head"><h3>{editing ? 'Edit project' : 'Add project'}</h3><button type="button" onClick={onCancel}>Close</button></div>{['name', 'type', 'url'].map((key) => <label key={key}>{key}<input value={form[key] || ''} onChange={(e) => update(key, e.target.value)} required={key !== 'url'} /></label>)}{['body', 'challenge', 'approach', 'result'].map((key) => <label key={key}>{key}<textarea value={form[key] || ''} onChange={(e) => update(key, e.target.value)} required /></label>)}<label>tech (comma separated)<input value={form.tech || ''} onChange={(e) => update('tech', e.target.value)} /></label><button type="submit">SAVE PROJECT ↗</button>{error && <div className="admin-error">{error}</div>}</form>;
}

function ServiceEditor({ editing, onSaved, onCancel }) {
  const [form, setForm] = useState(editing ? editing : blankService); const [error, setError] = useState('');
  const update = (key, value) => setForm((state) => ({ ...state, [key]: value }));
  async function submit(event) {
    event.preventDefault(); setError(''); const payload = { name: form.name, tagline: form.tagline, description: form.description, sortOrder: Number(form.sortOrder || 0) };
    try { await api(editing ? `/api/services/${editing.id}` : '/api/services', { method: editing ? 'PUT' : 'POST', body: JSON.stringify(payload) }); onSaved(); } catch (e) { setError(e.message); }
  }
  return <form className="admin-editor" onSubmit={submit}><div className="admin-editor-head"><h3>{editing ? 'Edit service' : 'Add service'}</h3><button type="button" onClick={onCancel}>Close</button></div><label>Name<input value={form.name || ''} onChange={(e) => update('name', e.target.value)} required /></label><label>Tagline<input value={form.tagline || ''} onChange={(e) => update('tagline', e.target.value)} required /></label><label>Description<textarea value={form.description || ''} onChange={(e) => update('description', e.target.value)} required /></label><label>Sort order<input value={form.sortOrder || 0} onChange={(e) => update('sortOrder', e.target.value)} type="number" /></label><button type="submit">SAVE SERVICE ↗</button>{error && <div className="admin-error">{error}</div>}</form>;
}

function Dashboard({ user, onLogout }) {
  const [tab, setTab] = useState('overview'); const [summary, setSummary] = useState(null); const [projects, setProjects] = useState([]); const [services, setServices] = useState([]); const [messages, setMessages] = useState([]); const [editor, setEditor] = useState(null); const [notice, setNotice] = useState(''); const [error, setError] = useState('');
  const load = async () => { setError(''); try { const [s, p, sv, m] = await Promise.all([api('/api/dashboard/summary').catch(() => null), api('/api/projects'), api('/api/services'), api('/api/contact')]); setSummary(s); setProjects(p); setServices(sv); setMessages(m); } catch (e) { setError(e.message); } };
  useEffect(() => { load(); }, []);
  const newCount = useMemo(() => messages.filter((m) => m.status === 'new').length, [messages]);
  async function remove(kind, id) { if (!window.confirm('Delete this record?')) return; try { await api(`/api/${kind}/${id}`, { method: 'DELETE' }); setNotice('Record deleted'); load(); } catch (e) { setError(e.message); } }
  async function markRead(id) { try { await api(`/api/contact/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'read' }) }); load(); } catch (e) { setError(e.message); } }
  async function logout() { await api('/api/auth/logout', { method: 'POST' }).catch(() => {}); onLogout(); }
  return <main className="admin-shell"><header className="admin-topbar"><a className="admin-brand" href="/">GOWTHAM <small>HISTORICAL SEO PORTFOLIO</small></a><div><span>{user?.email}</span><button onClick={logout}>LOG OUT</button></div></header><div className="admin-layout"><aside className="admin-sidebar"><p>ARCHIVE CONTROL</p>{[['overview', 'Overview'], ['projects', 'Projects'], ['services', 'Services'], ['messages', `Messages${newCount ? ` · ${newCount}` : ''}`]].map(([key, label]) => <button key={key} className={tab === key ? 'active' : ''} onClick={() => { setTab(key); setEditor(null); }}>{label}</button>)}</aside><section className="admin-content">{error && <div className="admin-error" role="alert">{error}</div>}{notice && <div className="admin-notice">{notice}</div>}{tab === 'overview' && <><p className="admin-kicker">THE WATCHTOWER / OVERVIEW</p><h1>Portfolio<br /><em>control.</em></h1><div className="admin-metrics"><Metric label="Projects" value={summary?.projects ?? projects.length} tone="gold" /><Metric label="Services" value={summary?.services ?? services.length} tone="blue" /><Metric label="New enquiries" value={summary?.newMessages ?? newCount} tone="red" /><Metric label="Tracked events" value={summary?.events ?? '—'} tone="green" /></div><div className="admin-panel"><h2>Recent enquiries</h2>{messages.slice(0, 5).map((m) => <div className="admin-message-row" key={m.id}><div><b>{m.name}</b><small>{m.email} · {new Date(m.createdAt).toLocaleDateString()}</small></div><span className={m.status}>{m.status}</span></div>)}{messages.length === 0 && <p>No enquiries yet.</p>}</div></>}{tab === 'projects' && <><div className="admin-section-head"><div><p className="admin-kicker">THE MARKET / PROJECTS</p><h1>Project<br /><em>records.</em></h1></div><button onClick={() => setEditor({ type: 'project', record: null })}>+ ADD PROJECT</button></div>{editor?.type === 'project' && <ProjectEditor editing={editor.record} onSaved={() => { setEditor(null); setNotice('Project saved'); load(); }} onCancel={() => setEditor(null)} />}<div className="admin-records">{projects.map((p) => <article className="admin-record" key={p.id}><div><span>{p.type}</span><h3>{p.name}</h3><p>{p.body}</p></div><div className="admin-record-actions"><button onClick={() => setEditor({ type: 'project', record: p })}>EDIT</button><button onClick={() => remove('projects', p.id)}>DELETE</button></div></article>)}</div></>}{tab === 'services' && <><div className="admin-section-head"><div><p className="admin-kicker">THE WORKSHOP / SERVICES</p><h1>Service<br /><em>records.</em></h1></div><button onClick={() => setEditor({ type: 'service', record: null })}>+ ADD SERVICE</button></div>{editor?.type === 'service' && <ServiceEditor editing={editor.record} onSaved={() => { setEditor(null); setNotice('Service saved'); load(); }} onCancel={() => setEditor(null)} />}<div className="admin-records">{services.map((service) => <article className="admin-record" key={service.id}><div><span>{service.tagline}</span><h3>{service.name}</h3><p>{service.description}</p></div><div className="admin-record-actions"><button onClick={() => setEditor({ type: 'service', record: service })}>EDIT</button><button onClick={() => remove('services', service.id)}>DELETE</button></div></article>)}</div></>}{tab === 'messages' && <><p className="admin-kicker">THE HIDDEN CHAMBER / CONTACT</p><h1>Project<br /><em>enquiries.</em></h1><div className="admin-records">{messages.map((m) => <article className="admin-record admin-message" key={m.id}><div><span>{new Date(m.createdAt).toLocaleString()} · {m.status}</span><h3>{m.name}</h3><p>{m.message}</p><small>{m.email}{m.website ? ` · ${m.website}` : ''}</small></div><div className="admin-record-actions">{m.status === 'new' && <button onClick={() => markRead(m.id)}>MARK READ</button>}<button onClick={() => remove('contact', m.id)}>DELETE</button></div></article>)}{messages.length === 0 && <div className="admin-panel"><p>No enquiries yet.</p></div>}</div></>}</section></div></main>;
}

export default function AdminDashboard() {
  const [user, setUser] = useState(undefined);
  useEffect(() => { api('/api/auth/me').then((data) => setUser(data.user)).catch(() => setUser(null)); }, []);
  if (user === undefined) return <main className="admin-shell admin-loading">Loading archive…</main>;
  if (!user) return <Login onLogin={setUser} />;
  return <Dashboard user={user} onLogout={() => setUser(null)} />;
}
