import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity, BadgeCheck, BarChart3, Bell, BookOpenText, CheckCircle2, ChevronRight,
  CircleAlert, CircleUserRound, ContactRound, Inbox, LayoutDashboard, LogOut,
  Megaphone, MessageCircleMore, PauseCircle, Plus, RefreshCw, Search, Send,
  Settings, ShieldCheck, Sparkles, UserRoundCheck, UsersRound
} from "lucide-react";
import { api, baseUrl } from "./api.js";
import DiagnosticsPage from "./DiagnosticsPage.jsx";
import {
  authConfigured, completeLoginFromRedirect, isDevBypass, logout, sessionIdentity, startLogin
} from "./auth.js";

const NAV = [
  ["overview", "Overview", LayoutDashboard],
  ["inbox", "Inbox", Inbox],
  ["contacts", "Contacts", ContactRound],
  ["templates", "Templates", BookOpenText],
  ["campaigns", "Campaigns", Megaphone],
  ["diagnostics", "API & Safety", Activity],
  ["settings", "Settings", Settings]
];

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function initials(value) {
  return String(value || "?").split(/\s+/).map((x) => x[0]).join("").slice(0, 2).toUpperCase();
}

function formatTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? "—" : new Intl.DateTimeFormat(undefined, {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
  }).format(date);
}

function StatusPill({ value }) {
  const key = String(value || "unknown").toLowerCase();
  return <span className={cx("status-pill", "status-" + key)}>{key.replaceAll("_", " ")}</span>;
}

function Button({ children, kind = "primary", className, ...props }) {
  return <button className={cx("button", "button-" + kind, className)} {...props}>{children}</button>;
}

function EmptyState({ icon: Icon = MessageCircleMore, title, body }) {
  return (
    <div className="empty-state">
      <div className="empty-icon"><Icon size={24} /></div>
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

function ErrorBanner({ error, onRetry }) {
  if (!error) return null;
  return (
    <div className="error-banner">
      <CircleAlert size={18} />
      <div>
        <strong>{error.code || "Request failed"}</strong>
        <span>{error.message}</span>
      </div>
      {onRetry && <Button kind="ghost" onClick={onRetry}><RefreshCw size={15} /> Retry</Button>}
    </div>
  );
}

function LoadingBlock() {
  return <div className="loading-block"><span /><span /><span /></div>;
}

function LoginScreen({ error }) {
  const configured = authConfigured();
  return (
    <main className="login-screen">
      <section className="login-card">
        <div className="brand-mark large"><MessageCircleMore size={27} /></div>
        <div className="eyebrow">CODESTRA COMMUNICATIONS</div>
        <h1>WhatsApp Agent Console</h1>
        <p>Secure tenant-scoped conversations, contacts, campaigns and operator workflows.</p>
        {error && <ErrorBanner error={error} />}
        {!configured ? (
          <div className="setup-warning">
            <CircleAlert size={18} />
            <span>Frontend authentication is not configured. Set the Keycloak environment values before sign-in.</span>
          </div>
        ) : (
          <Button onClick={() => startLogin()}><ShieldCheck size={17} /> Sign in with Codestra</Button>
        )}
        <div className="login-meta">
          <span><BadgeCheck size={15} /> Middleware V3 authority</span>
          <span><ShieldCheck size={15} /> PKCE authentication</span>
        </div>
      </section>
    </main>
  );
}

function Sidebar({ page, setPage, identity }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><MessageCircleMore size={21} /></div>
        <div><strong>Codestra</strong><span>WhatsApp</span></div>
      </div>
      <nav>
        <div className="nav-label">WORKSPACE</div>
        {NAV.map(([id, label, Icon]) => (
          <button key={id} className={cx("nav-item", page === id && "active")} onClick={() => setPage(id)}>
            <Icon size={18} />
            <span>{label}</span>
            {id === "inbox" && <span className="nav-dot" />}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="tenant-chip">
          <div className="avatar small">{initials(identity.subject)}</div>
          <div><strong>{identity.subject || "Operator"}</strong><span>{identity.tenantId || "No tenant"}</span></div>
        </div>
        <button className="icon-button" onClick={logout} title="Sign out"><LogOut size={17} /></button>
      </div>
    </aside>
  );
}

function Topbar({ title, identity, onRefresh, refreshing }) {
  return (
    <header className="topbar">
      <div>
        <div className="eyebrow">WHATSAPP OPERATIONS</div>
        <h2>{title}</h2>
      </div>
      <div className="topbar-actions">
        <button className="icon-button" title="Notifications"><Bell size={18} /></button>
        <button className="icon-button" onClick={onRefresh} title="Refresh">
          <RefreshCw size={18} className={refreshing ? "spin" : ""} />
        </button>
        <div className="profile-badge">
          <div className="avatar">{initials(identity.subject)}</div>
          <div><strong>{identity.subject || "Operator"}</strong><span>{identity.roles?.[0] || "agent"}</span></div>
        </div>
      </div>
    </header>
  );
}

function MetricCard({ icon: Icon, label, value, detail, tone = "green" }) {
  return (
    <article className="metric-card">
      <div className={cx("metric-icon", tone)}><Icon size={19} /></div>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value ?? 0}</div>
      <div className="metric-detail">{detail}</div>
    </article>
  );
}

function OverviewPage({ dashboard, conversations, onOpenInbox, safeMode }) {
  if (!dashboard) return <EmptyState icon={BarChart3} title="Dashboard API not published yet" body="The current backend contract is healthy without the planned dashboard read model. Use API & Safety for live endpoint checks." />;
  return (
    <div className="page-stack">
      {safeMode && (
        <div className="safety-banner">
          <ShieldCheck size={19} />
          <div><strong>Safe mode is active</strong><span>External provider effects remain disabled until production gates are explicitly enabled.</span></div>
        </div>
      )}
      <section className="metric-grid">
        <MetricCard icon={MessageCircleMore} label="Conversations" value={dashboard.conversations?.total} detail={String(dashboard.conversations?.unread || 0) + " unread"} />
        <MetricCard icon={UsersRound} label="Opted-in contacts" value={dashboard.business?.contacts?.opted_in} detail={String(dashboard.business?.contacts?.total || 0) + " total contacts"} tone="blue" />
        <MetricCard icon={UserRoundCheck} label="Waiting for agent" value={dashboard.conversations?.waiting_agent} detail={String(dashboard.conversations?.escalated || 0) + " escalated"} tone="amber" />
        <MetricCard icon={Megaphone} label="Ready campaigns" value={dashboard.business?.campaigns?.ready} detail={String(dashboard.business?.campaigns?.draft || 0) + " drafts"} tone="violet" />
      </section>

      <div className="two-column">
        <section className="panel">
          <div className="panel-head">
            <div><h3>Recent conversations</h3><p>Latest customer activity across the tenant.</p></div>
            <Button kind="ghost" onClick={onOpenInbox}>Open inbox <ChevronRight size={15} /></Button>
          </div>
          <div className="conversation-table">
            {(conversations || []).slice(0, 6).map((item) => (
              <div className="conversation-row" key={item.conversation_id}>
                <div className="avatar customer">{initials(item.customer_identity)}</div>
                <div className="grow"><strong>{item.customer_identity}</strong><span>{item.business_identity}</span></div>
                <StatusPill value={item.status} />
                <div className="unread">{item.unread_count || 0}</div>
                <time>{formatTime(item.updated_at)}</time>
              </div>
            ))}
            {!conversations?.length && <EmptyState title="No conversations yet" body="Inbound conversations will appear here after W3 accepts normalized WhatsApp events." />}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head"><div><h3>Operational readiness</h3><p>Business data and messaging controls.</p></div><Activity size={18} /></div>
          <div className="readiness-list">
            <div><span><CheckCircle2 size={17} /> Contact eligibility</span><strong>{dashboard.business?.contacts?.opted_in || 0} eligible</strong></div>
            <div><span><BookOpenText size={17} /> Templates</span><strong>{dashboard.business?.templates?.approved || 0} approved</strong></div>
            <div><span><Megaphone size={17} /> Campaigns</span><strong>{dashboard.business?.campaigns?.ready || 0} ready</strong></div>
            <div><span><ShieldCheck size={17} /> Provider effects</span><strong>{safeMode ? "Locked" : "Enabled"}</strong></div>
          </div>
        </section>
      </div>
    </div>
  );
}

function InboxPage({ conversations, refreshConversations }) {
  const [selectedId, setSelectedId] = useState(conversations?.[0]?.conversation_id || null);
  const [timeline, setTimeline] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sendText, setSendText] = useState("");
  const [error, setError] = useState(null);

  const selected = useMemo(
    () => conversations?.find((item) => item.conversation_id === selectedId) || conversations?.[0] || null,
    [conversations, selectedId]
  );

  useEffect(() => {
    if (!selected?.conversation_id) return;
    setSelectedId(selected.conversation_id);
    setLoading(true);
    Promise.all([api.conversation(selected.conversation_id), api.timeline(selected.conversation_id)])
      .then(([detail, line]) => {
        setConversation(detail);
        setTimeline(line.items || []);
        setError(null);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, [selected?.conversation_id]);

  async function mutate(action) {
    if (!conversation) return;
    try {
      setError(null);
      let updated;
      if (action === "claim") updated = await api.claim(conversation.conversation_id, conversation.version);
      if (action === "resolve") updated = await api.resolve(conversation.conversation_id, conversation.version, "agent_resolved");
      if (action === "reopen") updated = await api.reopen(conversation.conversation_id, conversation.version, "agent_reopened");
      setConversation(updated);
      await refreshConversations();
    } catch (e) {
      setError(e);
    }
  }

  async function sendMessage(event) {
    event.preventDefault();
    if (!conversation || !sendText.trim()) return;
    try {
      setError(null);
      const result = await api.contacts({ q: conversation.customer_identity, limit: 20 });
      const contact = (result.items || []).find((item) => item.phone === conversation.customer_identity);
      if (!contact) {
        const e = new Error("Create a contact record with consent before sending to this conversation.");
        e.code = "contact_record_required";
        throw e;
      }
      await api.sendMessage({
        contact_id: contact.contact_id,
        campaign_id: "agent-console-direct",
        message: { type: "text", text: sendText.trim() }
      });
      setSendText("");
    } catch (e) {
      setError(e);
    }
  }

  return (
    <div className="inbox-shell">
      <section className="inbox-list panel">
        <div className="panel-head compact"><div><h3>Inbox</h3><p>{conversations?.length || 0} conversations</p></div><Search size={17} /></div>
        <div className="conversation-list-scroll">
          {(conversations || []).map((item) => (
            <button
              key={item.conversation_id}
              className={cx("conversation-card", selected?.conversation_id === item.conversation_id && "selected")}
              onClick={() => setSelectedId(item.conversation_id)}
            >
              <div className="avatar customer">{initials(item.customer_identity)}</div>
              <div className="grow"><strong>{item.customer_identity}</strong><span>{item.status.replaceAll("_", " ")}</span></div>
              <div className="conversation-card-meta"><time>{formatTime(item.updated_at)}</time>{item.unread_count > 0 && <b>{item.unread_count}</b>}</div>
            </button>
          ))}
          {!conversations?.length && <EmptyState title="Inbox is clear" body="New conversations will appear when inbound events are processed." />}
        </div>
      </section>

      <section className="chat-panel panel">
        {!selected ? (
          <EmptyState title="Select a conversation" body="Choose a conversation from the inbox to inspect its timeline." />
        ) : (
          <>
            <div className="chat-head">
              <div className="avatar customer">{initials(selected.customer_identity)}</div>
              <div className="grow"><h3>{selected.customer_identity}</h3><span>{selected.business_identity}</span></div>
              <StatusPill value={conversation?.status || selected.status} />
              {conversation?.status === "resolved"
                ? <Button kind="ghost" onClick={() => mutate("reopen")}>Reopen</Button>
                : <Button kind="ghost" onClick={() => mutate("resolve")}>Resolve</Button>}
            </div>
            <ErrorBanner error={error} />
            <div className="timeline">
              {loading ? <LoadingBlock /> : timeline.filter((entry) => entry.type === "message").map((entry, index) => {
                const message = entry.data;
                return (
                  <div key={message.message_id || index} className={cx("bubble-wrap", message.direction === "outbound" && "outbound")}>
                    <div className="message-bubble">
                      <p>{message.content?.text || "[" + (message.content?.type || "message") + "]"}</p>
                      <time>{formatTime(message.created_at)}</time>
                    </div>
                  </div>
                );
              })}
              {!loading && !timeline.some((entry) => entry.type === "message") && <EmptyState title="No messages yet" body="The conversation timeline has no materialized messages." />}
            </div>
            <form className="composer" onSubmit={sendMessage}>
              <input value={sendText} onChange={(e) => setSendText(e.target.value)} placeholder="Write a reply…" />
              <Button type="submit" disabled={!sendText.trim()}><Send size={17} /> Send</Button>
            </form>
          </>
        )}
      </section>

      <aside className="context-panel panel">
        {conversation ? (
          <>
            <div className="context-profile">
              <div className="avatar xl">{initials(conversation.customer_identity)}</div>
              <h3>{conversation.customer_identity}</h3>
              <span>{conversation.business_identity}</span>
            </div>
            <div className="context-section">
              <label>Status</label><StatusPill value={conversation.status} />
            </div>
            <div className="context-grid">
              <div><span>Unread</span><strong>{conversation.unread_count || 0}</strong></div>
              <div><span>Version</span><strong>{conversation.version}</strong></div>
              <div><span>Assigned to</span><strong>{conversation.assigned_to || "Unassigned"}</strong></div>
              <div><span>Automation</span><strong>{conversation.automation_paused ? "Paused" : "Active"}</strong></div>
            </div>
            <Button kind="secondary" onClick={() => mutate("claim")} disabled={conversation.assigned_to}>
              <UserRoundCheck size={16} /> Claim conversation
            </Button>
          </>
        ) : <EmptyState title="Conversation context" body="Customer and assignment details will appear here." />}
      </aside>
    </div>
  );
}

function ContactsPage() {
  const [result, setResult] = useState({ items: [], total: 0 });
  const [q, setQ] = useState("");
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    api.contacts({ q, limit: 100 }).then((data) => { setResult(data); setError(null); }).catch(setError);
  }, [q]);

  useEffect(() => { load(); }, [load]);

  async function create(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await api.createContact({
        name: form.get("name"),
        phone: form.get("phone"),
        consent_status: form.get("consent_status"),
        tags: String(form.get("tags") || "").split(",").map((x) => x.trim()).filter(Boolean)
      });
      setShowForm(false);
      load();
    } catch (e) { setError(e); }
  }

  return (
    <div className="page-stack">
      <div className="toolbar">
        <div className="search-box"><Search size={17} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search contacts, phone or tags" /></div>
        <Button onClick={() => setShowForm(!showForm)}><Plus size={16} /> New contact</Button>
      </div>
      <ErrorBanner error={error} onRetry={load} />
      {showForm && (
        <form className="inline-form panel" onSubmit={create}>
          <div><label>Name</label><input name="name" required /></div>
          <div><label>Phone</label><input name="phone" placeholder="+18095550100" required /></div>
          <div><label>Consent</label><select name="consent_status"><option value="unknown">Unknown</option><option value="opted_in">Opted in</option><option value="opted_out">Opted out</option></select></div>
          <div><label>Tags</label><input name="tags" placeholder="vip, transport" /></div>
          <Button type="submit">Save contact</Button>
        </form>
      )}
      <section className="panel data-panel">
        <div className="panel-head"><div><h3>Contacts</h3><p>{result.total} tenant-scoped records</p></div></div>
        <div className="data-table">
          <div className="table-row table-head"><span>Contact</span><span>Phone</span><span>Consent</span><span>Tags</span><span>Updated</span></div>
          {result.items.map((contact) => (
            <div className="table-row" key={contact.contact_id}>
              <span className="contact-cell"><div className="avatar small">{initials(contact.name)}</div><strong>{contact.name}</strong></span>
              <span>{contact.phone}</span>
              <span><StatusPill value={contact.suppressed ? "suppressed" : contact.consent_status} /></span>
              <span>{contact.tags?.join(", ") || "—"}</span>
              <span>{formatTime(contact.updated_at)}</span>
            </div>
          ))}
        </div>
        {!result.items.length && <EmptyState icon={ContactRound} title="No contacts yet" body="Add a consent-aware contact to begin controlled outbound messaging." />}
      </section>
    </div>
  );
}

function TemplatesPage() {
  const [result, setResult] = useState({ items: [], total: 0 });
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const load = useCallback(() => api.templates({ limit: 100 }).then((d) => { setResult(d); setError(null); }).catch(setError), []);
  useEffect(() => { load(); }, [load]);

  async function create(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await api.createTemplate({
        name: form.get("name"),
        language: form.get("language"),
        category: form.get("category"),
        status: "draft",
        body: form.get("body"),
        variables: []
      });
      setShowForm(false);
      load();
    } catch (e) { setError(e); }
  }

  return (
    <div className="page-stack">
      <div className="toolbar"><div><h3>Message templates</h3><p className="muted">Local business templates. Provider approval remains a separate controlled step.</p></div><Button onClick={() => setShowForm(!showForm)}><Plus size={16} /> New template</Button></div>
      <ErrorBanner error={error} />
      {showForm && (
        <form className="template-form panel" onSubmit={create}>
          <div className="form-grid"><div><label>Name</label><input name="name" required /></div><div><label>Language</label><input name="language" defaultValue="en" required /></div><div><label>Category</label><select name="category"><option>utility</option><option>marketing</option><option>authentication</option></select></div></div>
          <div><label>Body</label><textarea name="body" rows="4" required placeholder="Hello, your appointment is confirmed." /></div>
          <Button type="submit">Save draft</Button>
        </form>
      )}
      <div className="card-grid">
        {result.items.map((item) => (
          <article className="template-card panel" key={item.template_id}>
            <div className="template-card-head"><div className="metric-icon blue"><BookOpenText size={17} /></div><StatusPill value={item.status} /></div>
            <h3>{item.name}</h3>
            <p>{item.body}</p>
            <div className="template-meta"><span>{item.language}</span><span>{item.category}</span><span>v{item.version}</span></div>
          </article>
        ))}
      </div>
      {!result.items.length && <EmptyState icon={BookOpenText} title="No templates yet" body="Create a draft template for campaign and agent workflows." />}
    </div>
  );
}

function CampaignsPage() {
  const [campaigns, setCampaigns] = useState({ items: [], total: 0 });
  const [templates, setTemplates] = useState([]);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    try {
      const [campaignData, templateData] = await Promise.all([api.campaigns({ limit: 100 }), api.templates({ limit: 100 })]);
      setCampaigns(campaignData);
      setTemplates(templateData.items || []);
      setError(null);
    } catch (e) { setError(e); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function create(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await api.createCampaign({
        name: form.get("name"),
        template_id: form.get("template_id"),
        audience_count: Number(form.get("audience_count")),
        bulk_approved: form.get("bulk_approved") === "on",
        status: "draft"
      });
      setShowForm(false);
      load();
    } catch (e) { setError(e); }
  }

  return (
    <div className="page-stack">
      <div className="toolbar"><div><h3>Campaign workspace</h3><p className="muted">Draft and validate business campaigns before any Middleware effect is allowed.</p></div><Button onClick={() => setShowForm(!showForm)} disabled={!templates.length}><Plus size={16} /> New campaign</Button></div>
      <ErrorBanner error={error} />
      {showForm && (
        <form className="inline-form panel" onSubmit={create}>
          <div><label>Name</label><input name="name" required /></div>
          <div><label>Template</label><select name="template_id" required>{templates.map((t) => <option key={t.template_id} value={t.template_id}>{t.name}</option>)}</select></div>
          <div><label>Audience count</label><input name="audience_count" type="number" min="1" defaultValue="1" required /></div>
          <label className="checkbox"><input name="bulk_approved" type="checkbox" /> Bulk approved</label>
          <Button type="submit">Save draft</Button>
        </form>
      )}
      <section className="panel data-panel">
        <div className="data-table">
          <div className="table-row table-head"><span>Campaign</span><span>Status</span><span>Audience</span><span>Validation</span><span>Updated</span></div>
          {campaigns.items.map((campaign) => (
            <div className="table-row" key={campaign.campaign_id}>
              <span><strong>{campaign.name}</strong><small>{campaign.campaign_id}</small></span>
              <span><StatusPill value={campaign.status} /></span>
              <span>{campaign.audience_count}</span>
              <span className={campaign.validation?.valid ? "good" : "warn"}>{campaign.validation?.valid ? "Ready" : (campaign.validation?.errors || []).join(", ")}</span>
              <span>{formatTime(campaign.updated_at)}</span>
            </div>
          ))}
        </div>
        {!campaigns.items.length && <EmptyState icon={Megaphone} title="No campaigns yet" body={templates.length ? "Create a campaign draft using one of your templates." : "Create a template first, then build a campaign."} />}
      </section>
    </div>
  );
}

function SettingsPage({ identity, profile, dashboard }) {
  return (
    <div className="settings-grid">
      <section className="panel settings-card">
        <div className="panel-head"><div><h3>API connection</h3><p>Frontend-to-business API boundary.</p></div><ShieldCheck size={18} /></div>
        <dl>
          <div><dt>API base</dt><dd>{baseUrl || "Not configured"}</dd></div>
          <div><dt>Authentication</dt><dd>{isDevBypass() ? "Development bypass" : "Keycloak PKCE"}</dd></div>
          <div><dt>Tenant</dt><dd>{profile?.tenant_id || identity.tenantId || "—"}</dd></div>
          <div><dt>Safe mode</dt><dd>{dashboard?.safe_mode ? "Enabled" : "Disabled"}</dd></div>
        </dl>
      </section>
      <section className="panel settings-card">
        <div className="panel-head"><div><h3>Operator access</h3><p>Roles returned by the WhatsApp API.</p></div><CircleUserRound size={18} /></div>
        <div className="role-list">{(profile?.roles || identity.roles || []).map((role) => <span key={role}>{role}</span>)}</div>
      </section>
      <section className="panel settings-card">
        <div className="panel-head"><div><h3>Architecture</h3><p>Provider effects stay behind Middleware V3.</p></div><Sparkles size={18} /></div>
        <div className="architecture-flow">
          <span>Frontend</span><ChevronRight size={15} /><span>WhatsApp API</span><ChevronRight size={15} /><span>Middleware V3</span><ChevronRight size={15} /><span>Evolution</span>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const [booting, setBooting] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [page, setPage] = useState("overview");
  const [profile, setProfile] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const identity = sessionIdentity();

  useEffect(() => {
    completeLoginFromRedirect().catch(setAuthError).finally(() => setBooting(false));
  }, []);

  const refresh = useCallback(async () => {
    if (!sessionIdentity().authenticated) return;
    setRefreshing(true);
    try {
      const [me, dash, inbox] = await Promise.allSettled([
        api.me(),
        api.dashboard(),
        api.conversations({ limit: 100 })
      ]);

      if (me.status === "fulfilled") setProfile(me.value);
      if (dash.status === "fulfilled") setDashboard(dash.value);
      if (inbox.status === "fulfilled") setConversations(inbox.value.items || []);

      const rejected = [me, dash, inbox].filter((result) => result.status === "rejected");
      const hardFailure = rejected.find((result) => result.reason?.status !== 404);
      setError(hardFailure?.reason || null);
    } catch (e) {
      setError(e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!booting && sessionIdentity().authenticated) refresh();
  }, [booting, refresh]);

  if (booting) return <main className="boot-screen"><div className="brand-mark large"><MessageCircleMore size={27} /></div><LoadingBlock /></main>;
  if (!sessionIdentity().authenticated) return <LoginScreen error={authError} />;

  const title = NAV.find(([id]) => id === page)?.[1] || "WhatsApp";

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} identity={profile ? { ...identity, subject: profile.subject, tenantId: profile.tenant_id, roles: profile.roles } : identity} />
      <div className="main-shell">
        <Topbar title={title} identity={profile ? { ...identity, subject: profile.subject, roles: profile.roles } : identity} onRefresh={refresh} refreshing={refreshing} />
        <main className="content">
          <ErrorBanner error={error} onRetry={refresh} />
          {page === "overview" && <OverviewPage dashboard={dashboard} conversations={conversations} safeMode={dashboard?.safe_mode} onOpenInbox={() => setPage("inbox")} />}
          {page === "inbox" && <InboxPage conversations={conversations} refreshConversations={refresh} />}
          {page === "contacts" && <ContactsPage />}
          {page === "templates" && <TemplatesPage />}
          {page === "campaigns" && <CampaignsPage />}
          {page === "diagnostics" && <DiagnosticsPage />}
          {page === "settings" && <SettingsPage identity={identity} profile={profile} dashboard={dashboard} />}
        </main>
      </div>
    </div>
  );
}
