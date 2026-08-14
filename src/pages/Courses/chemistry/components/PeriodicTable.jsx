import periodicTable, { CATEGORY_META } from "../data/periodicTable";

function ElementCell({ element, onClick, style }) {
  const meta = CATEGORY_META[element.category] ?? CATEGORY_META.desconocido;

  return (
    <button
      type="button"
      onClick={() => onClick(element)}
      style={{ ...style, backgroundColor: meta.color }}
      title={`${element.name} (${element.symbol})`}
      className="rounded-md p-1 text-center leading-tight cursor-pointer shadow-sm hover:ring-2 hover:ring-[#1976d2] hover:scale-105 active:scale-95 transition-transform"
    >
      <span className="block text-[9px] sm:text-[10px] font-medium text-gray-700">
        {element.number}
      </span>
      <span className="block text-sm sm:text-base font-bold text-gray-900">
        {element.symbol}
      </span>
      <span className="block text-[8px] sm:text-[9px] text-gray-800 truncate">
        {element.name}
      </span>
    </button>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 max-w-2xl">
      {Object.entries(CATEGORY_META).map(([key, meta]) => (
        <span
          key={key}
          className="flex items-center gap-1.5 text-[11px] sm:text-xs text-gray-600"
        >
          <span
            className="w-3 h-3 rounded-sm shrink-0"
            style={{ backgroundColor: meta.color }}
          />
          {meta.label}
        </span>
      ))}
    </div>
  );
}

export default function PeriodicTable({ onElementClick }) {
  const mainElements = periodicTable.filter((e) => e.group != null);
  const lanthanides = periodicTable.filter((e) => e.series === "lantánido");
  const actinides = periodicTable.filter((e) => e.series === "actínido");

  return (
    <div className="min-h-full flex flex-col items-center justify-center gap-5 p-4 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center">
        Tabla Periódica de los Elementos
      </h2>

      <div className="overflow-x-auto w-full flex justify-center">
        <div
          className="grid w-full"
          style={{
            gridTemplateColumns: "repeat(18, minmax(0, 1fr))",
            gap: "3px",
            minWidth: "660px",
            maxWidth: "920px",
          }}
        >
          {mainElements.map((el) => (
            <ElementCell
              key={el.number}
              element={el}
              onClick={onElementClick}
              style={{ gridColumn: el.group, gridRow: el.period }}
            />
          ))}

          <div
            className="flex items-center justify-end pr-2 text-[10px] font-semibold text-gray-400"
            style={{ gridColumn: "1 / span 3", gridRow: 9 }}
          >
            Lantánidos
          </div>
          {lanthanides.map((el) => (
            <ElementCell
              key={el.number}
              element={el}
              onClick={onElementClick}
              style={{ gridColumn: 4 + el.seriesIndex, gridRow: 9 }}
            />
          ))}

          <div
            className="flex items-center justify-end pr-2 text-[10px] font-semibold text-gray-400"
            style={{ gridColumn: "1 / span 3", gridRow: 10 }}
          >
            Actínidos
          </div>
          {actinides.map((el) => (
            <ElementCell
              key={el.number}
              element={el}
              onClick={onElementClick}
              style={{ gridColumn: 4 + el.seriesIndex, gridRow: 10 }}
            />
          ))}
        </div>
      </div>

      <Legend />
    </div>
  );
}
