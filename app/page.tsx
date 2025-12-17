"use client";

import { useState } from "react";

type CompanyProfile = {
  businessModel: string;
  audience: "b2b" | "b2c";
  channels: string[];
  maturity: "early" | "established";
  signals: {
    hasPricing: boolean;
    hasBlog: boolean;
    hasCareers: boolean;
    hasDemoCTA: boolean;
  };
};

type Rec = {
  id: string;
  title: string;
  core_action: string;
  why_it_works: string;
  url: string;
  score: number;
  reasons: string[];
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [step, setStep] = useState<"idle" | "scanning" | "matching" | "done" | "error">("idle");
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [recs, setRecs] = useState<Rec[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    try {
      setError(null);
      setRecs([]);
      setProfile(null);

      const clean = url.trim();
      if (!clean) return;

      setStep("scanning");
      const profRes = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: clean })
      });
      if (!profRes.ok) throw new Error("Failed to scan website.");
      const prof = (await profRes.json()) as CompanyProfile;
      setProfile(prof);

      setStep("matching");
      const recRes = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: prof, limit: 10 })
      });
      if (!recRes.ok) throw new Error("Failed to match ideas.");
      const data = await recRes.json();
      setRecs(data.recommendations);

      setStep("done");
    } catch (e: any) {
      setStep("error");
      setError(e?.message ?? "Something broke.");
    }
  }

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "40px 16px", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Marketing ideas for your startup</h1>
      <p style={{ color: "#555", marginBottom: 20 }}>
        Paste your website URL. You’ll get tactical ideas mapped to proven newsletter playbooks.
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://gong.io"
          style={{
            flex: 1,
            padding: "12px 14px",
            border: "1px solid #ddd",
            borderRadius: 10,
            fontSize: 14
          }}
        />
        <button
          onClick={run}
          disabled={step === "scanning" || step === "matching"}
          style={{
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid #111",
            background: "#111",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          Get ideas
        </button>
      </div>

      {step === "scanning" && <Status line="Scanning website…" />}
      {step === "matching" && <Status line="Matching ideas…" />}
      {step === "error" && <Status line={error ?? "Error"} error />}

      {profile && (
        <div style={{ marginTop: 12, padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Detected profile</div>
          <div style={{ color: "#444", fontSize: 14 }}>
            <b>Model:</b> {profile.businessModel} {" · "}
            <b>Audience:</b> {profile.audience} {" · "}
            <b>Channels:</b> {profile.channels.join(", ") || "unknown"} {" · "}
            <b>Stage:</b> {profile.maturity}
          </div>
        </div>
      )}

      <div style={{ marginTop: 20, display: "grid", gap: 12 }}>
        {recs.map((r) => (
          <a
            key={r.id}
            href={r.url}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "block",
              textDecoration: "none",
              border: "1px solid #eee",
              borderRadius: 14,
              padding: 14,
              color: "#111"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontWeight: 800 }}>{r.title}</div>
              <div style={{ fontSize: 12, color: "#666" }}>{Math.round(r.score * 100)}%</div>
            </div>

            <div style={{ marginTop: 8, fontSize: 14, color: "#222" }}>
              <b>Do this:</b> {r.core_action}
            </div>

            <div style={{ marginTop: 6, fontSize: 14, color: "#444" }}>
              <b>Why:</b> {r.why_it_works}
            </div>

            <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700 }}>
              Read the original →
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}

function Status({ line, error }: { line: string; error?: boolean }) {
  return (
    <div
      style={{
        marginTop: 10,
        padding: 12,
        borderRadius: 12,
        border: "1px solid",
        borderColor: error ? "#ffcccc" : "#eee",
        background: error ? "#fff5f5" : "#fafafa",
        color: error ? "#a40000" : "#333",
        fontSize: 14
      }}
    >
      {line}
    </div>
  );
}
