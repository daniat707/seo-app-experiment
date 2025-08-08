import { useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function App() {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [res, setRes] = useState(null);

  const canUpload = useMemo(() => !!file && !busy, [file, busy]);

  const onFile = (e) => {
    setErr("");
    setRes(null);
    setFile(e.target.files?.[0] || null);
  };

  const upload = async () => {
    if (!file) return;
    try {
      setBusy(true);
      setErr("");
      setRes(null);

      const fd = new FormData();
      fd.append("file", file);

      const r = await fetch(`${API_URL}/upload`, { method: "POST", body: fd });
      if (!r.ok) throw new Error((await r.text()) || `HTTP ${r.status}`);
      const data = await r.json();
      setRes(data);
    } catch (e) {
      setErr(e.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const downloadCSV = () => {
    if (!res?.keywords_ranked?.length) return;
    const rows = [
      ["keyword", "popularity"],
      ...res.keywords_ranked.map((k) => [k.keyword, k.popularity ?? ""]),
    ];
    const csv = rows.map((r) => r.map(escapeCSV).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "keywords.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadMD = () => {
    if (!res?.seo_copy_markdown) return;
    const blob = new Blob([res.seo_copy_markdown], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "seo-draft.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadDOCX = () => {
    if (!res?.docx_filename) return;
    window.open(`${API_URL}/download/${res.docx_filename}`, "_blank");
  };

  return (
    <div className="wrap">
      <header>
        <h1>SEO Keyword Finder</h1>
        <p className="sub">
          Upload a PDF or DOCX and get English keywords + a template-driven SEO
          draft.
        </p>
      </header>

      <section className="card">
        <input type="file" accept=".pdf,.docx" onChange={onFile} disabled={busy} />
        <button onClick={upload} disabled={!canUpload}>
          {busy ? "Processing…" : "Analyze"}
        </button>
        {file && <div className="hint">Selected: {file.name}</div>}
        {err && <div className="error">{err}</div>}
      </section>

      {res && (
        <>
          <section className="card">
            <h2>Overview</h2>
            <div className="kv">
              <div>
                <span>Detected source language:</span>{" "}
                {res.language_detected || "—"}
              </div>
            </div>

            {!!res.primary_topics?.length && (
              <>
                <h3>Primary topics</h3>
                <div className="chips">
                  {res.primary_topics.map((t, i) => (
                    <span className="chip" key={i}>
                      {t}
                    </span>
                  ))}
                </div>
              </>
            )}
          </section>

          {!!res.by_intent && (
            <section className="card">
              <h2>Keywords by intent</h2>
              <div className="grid2">
                <IntentList title="Informational" items={res.by_intent?.informational} />
                <IntentList title="Commercial" items={res.by_intent?.commercial} />
                <IntentList title="Transactional" items={res.by_intent?.transactional} />
                <IntentList title="Navigational" items={res.by_intent?.navigational} />
              </div>
            </section>
          )}

          {!!res.questions?.length && (
            <section className="card">
              <h2>Common questions</h2>
              <ul className="bullets">
                {res.questions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </section>
          )}

          {!!res.keywords_ranked?.length && (
            <section className="card">
              <div className="row">
                <h2>Trending keywords (last 3 months)</h2>
                <button onClick={downloadCSV}>Download CSV</button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Keyword</th>
                    <th>Popularity (0–100)</th>
                  </tr>
                </thead>
                <tbody>
                  {res.keywords_ranked.map((k, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{k.keyword}</td>
                      <td>{k.popularity ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="footnote">
                Popularity is Google Trends’ relative interest (averaged) for
                “today 3-m”.
              </div>
            </section>
          )}

          {res?.seo_copy_markdown && (
            <section className="card">
              <div className="row">
                <h2>SEO Draft (English, template-driven)</h2>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={downloadMD}>Download .md</button>
                  {res.docx_filename && (
                    <button onClick={downloadDOCX}>Download .docx</button>
                  )}
                </div>
              </div>
              <textarea
                readOnly
                value={res.seo_copy_markdown}
                style={{
                  width: "100%",
                  height: 420,
                  background: "#0f1217",
                  color: "#e6eef5",
                  borderRadius: 10,
                  padding: 12,
                  border: "1px solid #1e2630",
                }}
              />
            </section>
          )}
        </>
      )}

      <footer>
        <div>
          Backend URL: <code>{API_URL}</code>
        </div>
      </footer>
    </div>
  );
}

function IntentList({ title, items }) {
  if (!items?.length) return null;
  return (
    <div>
      <h3>{title}</h3>
      <ul className="bullets">
        {items.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    </div>
  );
}

function escapeCSV(v) {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}