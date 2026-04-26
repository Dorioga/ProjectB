import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import useAuth from "../../lib/hooks/useAuth";
import { getSlotValues } from "../../services/slotService";
import DataTable from "../../components/atoms/DataTable";
import Loader from "../../components/atoms/Loader";

const YEAR_OPTIONS = [2025, 2026, 2027, 2028, 2029, 2030];

/** Lee una CSS variable del :root en tiempo de ejecución */
function getCSSVar(varName) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
}

/** Mapeo de nombre corto → CSS variable del tema */
const THEME_COLORS = {
  primary: "--color-primary",
  secondary: "--color-secondary",
  accent: "--color-accent",
  error: "--color-error",
  info: "--color-info",
  warning: "--color-warning",
  muted: "--color-muted",
};

function buildChartData(slots, key) {
  const counts = {};
  slots.forEach((s) => {
    const val = s[key] ?? "Sin dato";
    counts[val] = (counts[val] || 0) + 1;
  });
  return Object.entries(counts).map(([name, total]) => ({ name, total }));
}

/**
 * color: clave de THEME_COLORS (ej. "primary", "secondary") o
 *        cualquier valor CSS válido (ej. "#ff0000")
 */
const ChartCard = ({ title, data, color = "primary" }) => {
  const fill = THEME_COLORS[color] ? getCSSVar(THEME_COLORS[color]) : color;

  return (
    <div className="bg-surface rounded-2xl shadow p-4 flex flex-col gap-2">
      <h3 className="font-semibold text-sm">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="total" name="Cupos" fill={fill} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const TABLE_COLUMNS = [
  { accessorKey: "id_reseva_slot_interna", header: "ID" },
  { accessorKey: "nombre_sede", header: "Sede" },
  { accessorKey: "nombre_jornada", header: "Jornada" },
  { accessorKey: "grado", header: "Grado" },
  { accessorKey: "tipo", header: "Tipo" },
  {
    accessorKey: "fecha_reserva",
    header: "Fecha de reserva",
    cell: ({ getValue }) => {
      const raw = getValue();
      if (!raw) return "-";
      return new Date(raw).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    },
  },
];

const Slots = () => {
  const { idInstitution } = useAuth();

  const currentYear = new Date().getFullYear();
  const defaultYear = YEAR_OPTIONS.includes(currentYear)
    ? currentYear
    : YEAR_OPTIONS[0];

  const [selectedYear, setSelectedYear] = useState(defaultYear);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState(null);

  const [filterSede, setFilterSede] = useState("");
  const [filterJornada, setFilterJornada] = useState("");
  const [filterGrado, setFilterGrado] = useState("");
  const [filterTipo, setFilterTipo] = useState("");

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setFilterSede("");
    setFilterJornada("");
    setFilterGrado("");
    setFilterTipo("");
    try {
      const payload = {
        idInstitution: Number(idInstitution),
        year: Number(selectedYear),
      };
      const res = await getSlotValues(payload);
      setSlots(Array.isArray(res) ? res : []);
      setHasLoaded(true);
    } catch (err) {
      console.error("Slots - handleSearch:", err);
      setError("Ocurrió un error al cargar los cupos. Intente nuevamente.");
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const sedeOptions = useMemo(
    () => [...new Set(slots.map((s) => s.nombre_sede).filter(Boolean))].sort(),
    [slots],
  );
  const jornadaOptions = useMemo(
    () =>
      [...new Set(slots.map((s) => s.nombre_jornada).filter(Boolean))].sort(),
    [slots],
  );
  const gradoOptions = useMemo(
    () => [...new Set(slots.map((s) => s.grado).filter(Boolean))].sort(),
    [slots],
  );
  const tipoOptions = useMemo(
    () => [...new Set(slots.map((s) => s.tipo).filter(Boolean))].sort(),
    [slots],
  );

  const filteredSlots = useMemo(() => {
    return slots.filter((s) => {
      if (filterSede && s.nombre_sede !== filterSede) return false;
      if (filterJornada && s.nombre_jornada !== filterJornada) return false;
      if (filterGrado && s.grado !== filterGrado) return false;
      if (filterTipo && s.tipo !== filterTipo) return false;
      return true;
    });
  }, [slots, filterSede, filterJornada, filterGrado, filterTipo]);

  const chartBySede = useMemo(
    () => buildChartData(filteredSlots, "nombre_sede"),
    [filteredSlots],
  );
  const chartByJornada = useMemo(
    () => buildChartData(filteredSlots, "nombre_jornada"),
    [filteredSlots],
  );
  const chartByGrado = useMemo(
    () => buildChartData(filteredSlots, "grado"),
    [filteredSlots],
  );
  const chartByTipo = useMemo(
    () => buildChartData(filteredSlots, "tipo"),
    [filteredSlots],
  );

  return (
    <div className="p-6 h-full gap-4 flex flex-col">
      {/* ── Encabezado ──────────────────────────────────────────────────── */}
      <div className="w-full grid gap-2 grid-cols-1 lg:grid-cols-5 justify-between items-center bg-primary text-surface p-3 rounded-lg">
        <h1 className="text-2xl font-bold ">Cupos</h1>
      </div>

      {/* Filtro */}
      <div className="flex items-end gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium ">Año</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border  rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-5 py-2 rounded-lg bg-secondary disabled:opacity-50 text-surface text-sm font-medium transition-colors"
        >
          {loading ? "Cargando..." : "Consultar"}
        </button>
      </div>

      {/* Filtros secundarios (se muestran una vez cargados los datos) */}
      {hasLoaded && slots.length > 0 && (
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Sede</label>
            <select
              value={filterSede}
              onChange={(e) => setFilterSede(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todas</option>
              {sedeOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Jornada</label>
            <select
              value={filterJornada}
              onChange={(e) => setFilterJornada(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todas</option>
              {jornadaOptions.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Grado</label>
            <select
              value={filterGrado}
              onChange={(e) => setFilterGrado(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todos</option>
              {gradoOptions.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">De donde viene</label>
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todos</option>
              {tipoOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Loader */}
      {loading && <Loader message="Cargando cupos..." size={64} />}

      {/* Gráficas */}
      {!loading && hasLoaded && (
        <>
          {slots.length === 0 ? (
            <div className="text-center py-10">
              No se encontraron cupos para el año seleccionado.
            </div>
          ) : filteredSlots.length === 0 ? (
            <div className="text-center py-10">
              No hay cupos que coincidan con los filtros seleccionados.
            </div>
          ) : (
            <div className="flex flex-col gap-6 p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ChartCard
                  title="Cupos por Sede"
                  data={chartBySede}
                  color="secondary"
                />
                <ChartCard
                  title="Cupos por Jornada"
                  data={chartByJornada}
                  color="secondary"
                />
                <ChartCard
                  title="Cupos por Grado"
                  data={chartByGrado}
                  color="secondary"
                />
                <ChartCard
                  title="Cupos por Tipo"
                  data={chartByTipo}
                  color="secondary"
                />
              </div>

              {/* Tabla */}
              <div className=" rounded-2xl shadow gap-4 flex flex-col">
                <div className="w-full grid gap-2 grid-cols-1 lg:grid-cols-5 justify-between items-center bg-primary text-surface p-3 rounded-lg">
                  <h3 className="font-semibold  text-xl bg-primary ">
                    Detalle de cupos
                  </h3>
                </div>
                <div className="p-4">
                  <DataTable
                    data={filteredSlots}
                    columns={TABLE_COLUMNS}
                    fileName={`cupos-${selectedYear}`}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Slots;
