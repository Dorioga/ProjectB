import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";

import periodicTable from "../data/periodicTable";

export default function ElementSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);

  const element = periodicTable.find((e) => e.number === Number(value));

  const filtered = periodicTable.filter((e) => {
    const q = query.trim().toLowerCase();

    if (!q) return true;

    return (
      e.name.toLowerCase().includes(q) ||
      e.symbol.toLowerCase().includes(q) ||
      String(e.number) === q
    );
  });

  useEffect(() => {
    if (!open) return;

    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full rounded-[14px] border border-[#d0d7de] bg-white px-3 py-2 text-sm focus:border-[#1976d2] focus:ring-2 focus:ring-[#1976d2]/30 outline-none cursor-pointer flex items-center justify-between gap-2"
      >
        <span className="truncate">
          {element
            ? `${element.number} — ${element.name} (${element.symbol})`
            : "Seleccionar elemento"}
        </span>
        <ChevronDown size={16} className="shrink-0 text-gray-400" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-[14px] border border-gray-200 bg-white shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, símbolo o número"
              className="w-full text-sm outline-none"
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filtered.map((e) => (
              <button
                key={e.number}
                type="button"
                onClick={() => {
                  onChange(e.number);
                  setOpen(false);
                  setQuery("");
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer ${
                  e.number === Number(value) ? "bg-[#1976d2]/10 font-medium" : ""
                }`}
              >
                {e.number} — {e.name} ({e.symbol})
              </button>
            ))}

            {filtered.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-400">
                Sin resultados
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
