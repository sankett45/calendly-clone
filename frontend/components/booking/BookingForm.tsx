"use client";

import { useState, FormEvent } from "react";
import dayjs from "dayjs";
import { Slot, EventType, QuestionDefinition, fmtTime, fmtDate } from "@/lib/api";

interface Props {
  event: EventType; slot: Slot; selectedDate: dayjs.Dayjs;
  onSubmit: (name: string, email: string, notes: string, answers: {key:string;value:string}[]) => Promise<void>;
  onBack: () => void;
}

export default function BookingForm({ event, slot, selectedDate, onSubmit, onBack }: Props) {
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [notes,   setNotes]   = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const questions: QuestionDefinition[] = event.custom_questions ?? [];
  const setAnswer = (key: string, value: string) =>
    setAnswers(p => ({ ...p, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    for (const q of questions) {
      if (q.required && !(answers[q.key] ?? "").trim()) {
        setError(`Please answer: ${q.label}`); return;
      }
    }
    setLoading(true); setError("");
    try {
      const al = Object.entries(answers).filter(([,v]) => v.trim()).map(([key,value]) => ({ key, value }));
      await onSubmit(name.trim(), email.trim(), notes.trim(), al);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
      setLoading(false);
    }
  };

  const inp: React.CSSProperties = {
    width: "100%", padding: "9px 12px", fontSize: 13,
    border: "1px solid #d1d5db", borderRadius: 8, background: "#fff",
    fontFamily: "'Inter', system-ui, sans-serif", color: "#111827",
    outline: "none", transition: "border-color 0.15s, box-shadow 0.15s",
    boxSizing: "border-box",
  };

  const labelSt: React.CSSProperties = {
    display: "block", fontSize: 11, fontWeight: 600,
    color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em",
    marginBottom: 5,
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Slot summary */}
      <div style={{
        padding: "12px 14px", borderRadius: 8, background: "#eff6ff",
        border: "1px solid #bfdbfe", marginBottom: 20,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#006BFF", marginBottom: 3 }}>
          {event.duration_minutes} min · {event.title}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{fmtDate(selectedDate)}</div>
        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
          {fmtTime(slot.start_local)} – {fmtTime(slot.end_local)}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={labelSt}>Name <span style={{ color: "#ef4444" }}>*</span></label>
          <input type="text" required value={name} onChange={e => setName(e.target.value)}
            placeholder="Your full name" style={inp}
            onFocus={e => { (e.target as HTMLInputElement).style.borderColor = "#006BFF"; (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(0,107,255,.12)"; }}
            onBlur={e  => { (e.target as HTMLInputElement).style.borderColor = "#d1d5db"; (e.target as HTMLInputElement).style.boxShadow = "none"; }}
          />
        </div>

        <div>
          <label style={labelSt}>Email <span style={{ color: "#ef4444" }}>*</span></label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com" style={inp}
            onFocus={e => { (e.target as HTMLInputElement).style.borderColor = "#006BFF"; (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(0,107,255,.12)"; }}
            onBlur={e  => { (e.target as HTMLInputElement).style.borderColor = "#d1d5db"; (e.target as HTMLInputElement).style.boxShadow = "none"; }}
          />
        </div>

        {questions.map(q => (
          <div key={q.key}>
            <label style={labelSt}>
              {q.label}{q.required && <span style={{ color: "#ef4444" }}> *</span>}
            </label>
            {q.type === "textarea" ? (
              <textarea rows={3} value={answers[q.key] ?? ""} onChange={e => setAnswer(q.key, e.target.value)}
                placeholder={q.placeholder} style={{ ...inp, resize: "vertical" as const }} />
            ) : (
              <input type={q.type === "phone" ? "tel" : q.type === "url" ? "url" : "text"}
                value={answers[q.key] ?? ""} onChange={e => setAnswer(q.key, e.target.value)}
                placeholder={q.placeholder} style={inp} />
            )}
          </div>
        ))}

        <div>
          <label style={labelSt}>Notes <span style={{ color: "#9ca3af", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
          <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Anything to share before the meeting..."
            style={{ ...inp, resize: "vertical" as const }} />
        </div>

        {error && (
          <div style={{ padding: "10px 14px", borderRadius: 8, background: "#fef2f2",
                        border: "1px solid #fecaca", fontSize: 13, color: "#dc2626" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
          <button type="button" onClick={onBack} style={{
            padding: "10px 16px", borderRadius: 8, border: "1px solid #d1d5db",
            background: "transparent", fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 13, fontWeight: 500, color: "#6b7280", cursor: "pointer",
          }}>Back</button>
          <button type="submit" disabled={loading} style={{
            flex: 1, padding: "10px 16px", borderRadius: 8, border: "none",
            background: loading ? "#9ca3af" : "#006BFF",
            color: "#fff", fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 1px 3px rgba(0,107,255,.3)", transition: "background 0.15s",
          }}>
            {loading ? "Scheduling…" : "Schedule Event"}
          </button>
        </div>
      </form>
    </div>
  );
}