"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="text-sm font-semibold text-[var(--primary)]">
        شكراً لاشتراكك! سنرسل لك أحدث المقالات قريباً.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="بريدك الإلكتروني"
        required
        aria-label="البريد الإلكتروني"
        className="flex-1 h-12 px-4 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-white text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
      />
      <button
        type="submit"
        className="h-12 px-8 rounded-[var(--radius-lg)] bg-[var(--primary)] text-white text-sm font-bold hover:bg-[var(--primary-hover)] transition-colors shrink-0">
        اشترك
      </button>
    </form>
  );
}
