"use client";

import { useState } from "react";

export function PasswordField({
  name,
  label,
  placeholder,
}: {
  name: string;
  label: string;
  placeholder: string;
}) {
  const [visible, setVisible] = useState(false);
  const id = `field-${name}`;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-semibold tracking-wide text-ink-soft"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          name={name}
          required
          placeholder={placeholder}
          className="w-full rounded-full border border-rule bg-surface px-4 py-2.5 pr-16 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-full border border-rule bg-paper px-2.5 py-1 text-xs font-medium text-ink-soft transition-colors hover:border-ink/40 hover:text-ink"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}
