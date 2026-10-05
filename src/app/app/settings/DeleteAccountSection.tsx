"use client";

import { useState } from "react";
import { deleteAccount } from "@/app/actions/account";

export function DeleteAccountSection() {
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  return (
    <div className="rounded-md border border-wire/40 bg-wire/5 p-5">
      <h2 className="font-display text-lg font-semibold tracking-tight text-wire">
        Danger zone
      </h2>
      <p className="mt-1 text-sm text-ink-soft">
        Permanently delete your account and everything in it — expert
        profiles, pitches, backlinks, and your subscription. This can&apos;t
        be undone.
      </p>

      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="mt-4 rounded-full border border-wire px-4 py-1.5 text-sm font-medium text-wire transition-colors hover:bg-wire/10"
        >
          Delete account
        </button>
      ) : (
        <form action={deleteAccount} className="mt-4 space-y-3">
          <label className="block text-sm text-ink-soft">
            Type <span className="font-mono font-semibold">DELETE</span> to
            confirm.
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="mt-1.5 w-full max-w-xs rounded-full border border-rule bg-surface px-4 py-2 text-sm text-ink focus:border-wire focus:outline-none focus:ring-2 focus:ring-wire/40"
            />
          </label>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={confirmText !== "DELETE"}
              className="rounded-full bg-wire px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-wire/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Permanently delete
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirming(false);
                setConfirmText("");
              }}
              className="rounded-full border border-rule px-4 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:border-ink"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
