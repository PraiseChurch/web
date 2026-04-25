"use client";

import React, { useState } from "react";

type Props = {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
};

export const EnumListEditor: React.FC<Props> = ({
  label,
  values,
  onChange,
}) => {
  const [draft, setDraft] = useState("");

  const add = () => {
    const trimmed = draft.trim().toUpperCase();
    if (!trimmed || values.includes(trimmed)) return;
    onChange([...values, trimmed]);
    setDraft("");
  };

  const remove = (value: string) => {
    onChange(values.filter((v) => v !== value));
  };

  return (
    <div>
      <p className="text-sm font-sans font-bold uppercase tracking-widest mb-2">
        {label}
      </p>
      <ul className="space-y-1 mb-3">
        {values.map((v) => (
          <li key={v} className="flex items-center gap-2">
            <span className="font-sans text-sm">{v}</span>
            <button
              type="button"
              onClick={() => remove(v)}
              className="text-xs text-red-600 underline"
            >
              remove
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="ADD VALUE"
          className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm font-sans uppercase"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-1.5 text-sm bg-black text-white rounded font-sans font-bold"
        >
          Add
        </button>
      </div>
    </div>
  );
};
