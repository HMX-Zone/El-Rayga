"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CAMP } from "@/lib/rooms";

export default function ContactForm() {
  const t = useTranslations("contact");
  const [form, setForm] = useState({ name: "", when: "", msg: "" });
  const [err, setErr] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.msg.trim()) { setErr(true); return; }
    const text = encodeURIComponent(
      `Hi El Rayga! I'm ${form.name}.${form.when ? ` Dates: ${form.when}.` : ""} ${form.msg}`
    );
    window.open(`https://wa.me/${CAMP.phoneRaw}?text=${text}`, "_blank", "noopener");
  }

  return (
    <form id="contact-form" className="form-grid" onSubmit={submit} noValidate>
      <div className={`field ${err && !form.name.trim() ? "err" : ""}`}>
        <label htmlFor="cf-name">{t("name")}</label>
        <input id="cf-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div className="field">
        <label htmlFor="cf-when">{t("dates")}</label>
        <input id="cf-when" placeholder={t("datesPlaceholder")} value={form.when} onChange={(e) => setForm({ ...form, when: e.target.value })} />
      </div>
      <div className={`field full ${err && !form.msg.trim() ? "err" : ""}`}>
        <label htmlFor="cf-msg">{t("message")}</label>
        <textarea id="cf-msg" rows={5} placeholder={t("messagePlaceholder")} value={form.msg}
          onChange={(e) => setForm({ ...form, msg: e.target.value })}
          style={{ width: "100%", padding: ".9em 1.05em", border: "1px solid var(--line-strong)", borderRadius: 13, background: "rgba(255,255,255,.6)", font: "inherit" }} />
      </div>
      <div className="full">
        <button className="btn coral" type="submit"><span>{t("openWhatsApp")}</span><span className="arr">→</span></button>
      </div>
    </form>
  );
}
