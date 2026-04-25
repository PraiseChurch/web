"use client";

import React, { useState, useTransition } from "react";
import { addAdmin, removeAdmin } from "../_actions/users";

type Props = {
  initialEmails: string[];
  currentEmail: string;
};

export const AdminAllowlistTable: React.FC<Props> = ({
  initialEmails,
  currentEmail,
}) => {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [draftEmail, setDraftEmail] = useState("");

  const handleAdd = () => {
    setError(null);
    startTransition(async () => {
      try {
        await addAdmin(draftEmail);
        setDraftEmail("");
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  };

  const handleRemove = (email: string) => {
    if (!confirm(`Remove ${email}?`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await removeAdmin(email);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-serif font-bold mb-6">Admins</h1>

      <div className="bg-white border border-gray-200 rounded mb-6">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left p-3 font-sans font-bold text-xs uppercase tracking-widest">
                Email
              </th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {initialEmails.map((email) => {
              const isSelf = email === currentEmail;
              return (
                <tr key={email}>
                  <td className="p-3 font-sans">
                    {email}
                    {isSelf && (
                      <span className="ml-2 text-xs text-gray-500">(you)</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemove(email)}
                      disabled={pending || isSelf}
                      title={isSelf ? "You can't remove yourself here" : ""}
                      className="text-sm text-red-600 disabled:text-gray-400"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-gray-200 rounded p-4">
        <h2 className="text-sm font-sans font-bold uppercase tracking-widest mb-3">
          Add admin
        </h2>
        <div className="flex gap-2">
          <input
            type="email"
            value={draftEmail}
            onChange={(e) => setDraftEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder="email@example.com"
            className="flex-1 border border-gray-300 rounded px-3 py-2"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={pending || !draftEmail.trim()}
            className="px-4 py-2 bg-black text-white rounded text-sm font-sans font-bold disabled:opacity-50"
          >
            Add admin
          </button>
        </div>
        <p className="mt-3 text-xs text-gray-600 font-sans">
          Tell them to sign in at <code>/admin/login</code> with the matching
          Google account.
        </p>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}
    </main>
  );
};
