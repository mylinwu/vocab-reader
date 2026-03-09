"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import type { AIModelOption } from "../types";

type Props = {
  options: AIModelOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function SearchableModelSelect({
  options,
  value,
  onChange,
  placeholder = "Search models",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handleOutside);
    return () => window.removeEventListener("mousedown", handleOutside);
  }, []);

  const selectedLabel = options.find((option) => option.id === value)?.name || value || "Select a model";

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return options;
    }

    return options.filter((option) =>
      `${option.id} ${option.name}`.toLowerCase().includes(normalized),
    );
  }, [options, query]);

  return (
    <div className="combobox" ref={rootRef}>
      <button type="button" className="field" onClick={() => setOpen((current) => !current)}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selectedLabel}
        </span>
        <ChevronsUpDown size={16} style={{ marginLeft: "auto", opacity: 0.65 }} />
      </button>

      {open ? (
        <div className="combobox-panel">
          <div style={{ padding: 12, borderBottom: "1px solid var(--line)" }}>
            <label
              className="input"
              style={{ display: "flex", alignItems: "center", gap: 10, paddingRight: 12 }}
            >
              <Search size={16} style={{ opacity: 0.55 }} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={placeholder}
                style={{ width: "100%", border: 0, outline: "none", background: "transparent" }}
              />
            </label>
          </div>

          <div className="combobox-list">
            {filtered.length === 0 ? (
              <div style={{ padding: 16, color: "var(--muted)" }}>No models found.</div>
            ) : (
              filtered.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="combobox-item"
                  data-active={option.id === value}
                  onClick={() => {
                    onChange(option.id);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <span>
                    <strong style={{ display: "block" }}>{option.name}</strong>
                    <span style={{ color: "var(--muted)", fontSize: 13 }}>{option.id}</span>
                  </span>
                  <span style={{ opacity: option.id === value ? 1 : 0 }}>
                    <Check size={16} />
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
