import { useMemo, useState } from "react";
import { ArrowLeft, Search } from "lucide-react";

import HistoryScene from "./HistoryScene";
import HistoryToken from "./HistoryToken";

import {
  getHistoryCategories,
  getHistoryPeriods,
  getHistoryCountries,
  filterHistory,
} from "../data/historyData";

export default function HistoryGroup({ onBack }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [periodId, setPeriodId] = useState("");
  const [countryCode, setCountryCode] = useState("");

  const categories = useMemo(() => getHistoryCategories(), []);
  const periods = useMemo(() => getHistoryPeriods(), []);
  const countries = useMemo(() => getHistoryCountries(), []);

  const filteredHistory = useMemo(
    () => filterHistory({ search, categoryId, periodId, countryCode }),
    [search, categoryId, periodId, countryCode],
  );

  const hasFilters =
    search || categoryId || periodId || countryCode || selectedEvent;

  const clearFilters = () => {
    setSearch("");
    setCategoryId("");
    setPeriodId("");
    setCountryCode("");
    setSelectedEvent(null);
  };

  const selectClass =
    "w-full mt-1 rounded-[14px] border border-[#d0d7de] bg-white px-3 py-2 text-sm text-gray-700 focus:border-[#1976d2] focus:ring-2 focus:ring-[#1976d2]/30 outline-none cursor-pointer";

  return (
    <div className="relative h-full w-full overflow-hidden bg-gray-100">
      <HistoryScene
        historyData={filteredHistory}
        onHistorySelect={setSelectedEvent}
        selectedHistory={selectedEvent}
      />

      <div className="absolute left-6 top-6 w-[340px] max-w-[85vw] max-h-[calc(100vh-48px)] overflow-y-auto bg-white rounded-2xl shadow-2xl p-5 z-[100]">
        <button
          onClick={onBack}
          className="mb-3 flex items-center gap-1 text-sm font-semibold text-[#1976d2] hover:underline cursor-pointer"
        >
          <ArrowLeft size={16} />
          Volver a países
        </button>

        <div className="text-xs font-bold uppercase tracking-wide text-[#7c3aed]">
          Historia
        </div>

        <h2 className="mt-1 text-xl font-bold text-gray-800">
          Explorar acontecimientos
        </h2>

        <div className="relative mt-4">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar acontecimiento..."
            className="w-full rounded-[14px] border border-[#d0d7de] bg-white py-2.5 pl-9 pr-3 text-sm text-gray-800 focus:border-[#1976d2] focus:ring-2 focus:ring-[#1976d2]/30 outline-none"
          />
        </div>

        <div className="mt-2 space-y-2">
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className={selectClass}
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={periodId}
            onChange={(event) => setPeriodId(event.target.value)}
            className={selectClass}
          >
            <option value="">Todos los períodos</option>
            {periods.map((period) => (
              <option key={period.id} value={period.id}>
                {period.name}
              </option>
            ))}
          </select>

          <select
            value={countryCode}
            onChange={(event) => setCountryCode(event.target.value)}
            className={selectClass}
          >
            <option value="">Todos los países</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="text-sm text-gray-500">
            <strong className="text-gray-800">{filteredHistory.length}</strong>{" "}
            {filteredHistory.length === 1
              ? "acontecimiento"
              : "acontecimientos"}
          </div>

          <button
            onClick={clearFilters}
            disabled={!hasFilters}
            className={`rounded-lg px-3 py-2 text-xs font-semibold ${
              hasFilters
                ? "bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200"
                : "bg-gray-50 text-gray-400 cursor-default"
            }`}
          >
            Limpiar
          </button>
        </div>
      </div>

      <HistoryToken
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
