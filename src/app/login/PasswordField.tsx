"use client";

import { useState } from "react";

export function PasswordField({
  name,
  placeholder,
}: {
  name: string;
  placeholder: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        name={name}
        required
        placeholder={placeholder}
        className="w-full rounded-full border border-rule bg-surface px-4 py-2.5 pr-12 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute top-1/2 right-4 -translate-y-1/2 text-xs font-medium text-ink-soft hover:text-ink"
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
