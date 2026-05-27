import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import DataTable from "../../components/atoms/DataTable";
import SedeSelect from "../../components/atoms/SedeSelect";
import PeriodSelector from "../../components/atoms/PeriodSelector";
import SimpleButton from "../../components/atoms/SimpleButton";
import Loader from "../../components/atoms/Loader";
import useTeacher from "../../lib/hooks/useTeacher";
import useAuth from "../../lib/hooks/useAuth";
import { useNotify } from "../../lib/hooks/useNotify";
import tourControlNotas from "../../tour/tourControlNotas";

// ── Constantes de pestañas ────────────────────────────────────────────────
const TAB_CREATE = "create";
const TAB_ASSIGN = "assign";

const ControlNotas = () => {
  const { controlCreateNote, controlAsignNote } = useTeacher();
  const { idSede, nameSede } = useAuth();
  const notify = useNotify();

  const notifyRef = useRef(notify);
  useEffect(() => {
    notifyRef.current = notify;
  });

  // ── Filtros ───────────────────────────────────────────────────────────────
  const [sedeId, setSedeId] = useState("");
  const [periodId, setPeriodId] = useState("");

  // ── Datos de las pestañas ─────────────────────────────────────────────────
  const [createData, setCreateData] = useState([]);
  const [assignData, setAssignData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ── Pestaña activa ────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState(TAB_CREATE);

  // ── Refs de funciones ─────────────────────────────────────────────────────
  const controlCreateNoteRef = useRef(controlCreateNote);
  useEffect(() => {
    controlCreateNoteRef.current = controlCreateNote;
  });
  const controlAsignNoteRef = useRef(controlAsignNote);
  useEffect(() => {
    controlAsignNoteRef.current = controlAsignNote;
  });

  // ── Cargar datos cuando sede y período están seleccionados ─────────────────
  const loadData = useCallback(async (sede, periodo) => {
    if (!sede || !periodo) return;
    setIsLoading(true);
    const payload = { id_sede: Number(sede), id_periodo: Number(periodo) };
    try {
      const [resCreate, resAssign] = await Promise.all([
        controlCreateNoteRef.current(payload),
        controlAsignNoteRef.current(payload),
      ]);
      setCreateData(Array.isArray(resCreate) ? resCreate : []);
      setAssignData(Array.isArray(resAssign) ? resAssign : []);
    } catch (err) {
      console.error("ControlNotas - loadData error:", err);
      notifyRef.current.error("Error al cargar el control de notas.");
      setCreateData([]);
      setAssignData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sedeId && periodId) {
      loadData(sedeId, periodId);
    }
  }, [sedeId, periodId, loadData]);

  // ── Handlers de filtros ───────────────────────────────────────────────────
  const handleSedeChange = (e) => {
    setSedeId(e.target.value);
  };

  const handlePeriodChange = (e) => {
    setPeriodId(e.target.value);
  };

  // ── Columnas Pestaña 1: Notas Creadas ─────────────────────────────────────
  const columnsCreate = useMemo(
    () => [
      {
        accessorKey: "docente",
        header: "Docente",
        meta: { hideOnLG: true },
        accessorFn: (row) => row.docente || "SIN DOCENTE",
      },
      {
        accessorKey: "nombre_grado",
        header: "Grado",
      },
      {
        accessorKey: "grupo",
        header: "Grupo",
      },
      {
        accessorKey: "nombre_asignatura",
        header: "Asignatura",
      },
      {
        accessorKey: "nombre_nota",
        header: "Nota",
        accessorFn: (row) => row.nombre_nota ?? "—",
      },
      {
        accessorKey: "porcentaje",
        header: "Porcentaje (%)",
        accessorFn: (row) =>
          row.porcentaje != null ? `${row.porcentaje}%` : "—",
      },
      {
        accessorKey: "fecha_creacion_nota",
        header: "Fecha creación",
        accessorFn: (row) => {
          if (!row.fecha_creacion_nota) return "—";
          try {
            const d = new Date(row.fecha_creacion_nota);
            const day = String(d.getUTCDate()).padStart(2, "0");
            const month = String(d.getUTCMonth() + 1).padStart(2, "0");
            const year = d.getUTCFullYear();
            return `${day}/${month}/${year}`;
          } catch {
            return row.fecha_creacion_nota;
          }
        },
      },

      {
        accessorKey: "nombre_periodo",
        header: "Período",
        accessorFn: (row) => row.nombre_periodo ?? "—",
      },
      {
        accessorKey: "estado_notas",
        header: "Estado",
        cell: ({ row }) => {
          const estado = row.original.estado_notas ?? "—";
          let cls = "bg-green-100 text-green-700";
          if (estado === "SIN NOTAS CREADAS") cls = "bg-red-100 text-red-700";
          else if (estado === "SIN DOCENTE")
            cls = "bg-yellow-100 text-yellow-700";
          return (
            <span className={`px-2 py-1 block text-xs font-semibold ${cls}`}>
              {estado}
            </span>
          );
        },
      },
    ],
    [],
  );

  // ── Columnas Pestaña 2: Notas Asignadas ───────────────────────────────────
  const columnsAssign = useMemo(
    () => [
      {
        accessorKey: "docente",
        header: "Docente",
        meta: { hideOnLG: true },
        accessorFn: (row) => row.docente || "SIN DOCENTE",
      },
      {
        accessorKey: "nombre",
        header: "Estudiante",
      },
      {
        accessorKey: "nombre_grado",
        header: "Grado",
      },
      {
        accessorKey: "grupo",
        header: "Grupo",
      },
      {
        accessorKey: "nombre_asignatura",
        header: "Asignatura",
      },
      {
        accessorKey: "total_notas_creadas",
        header: "Notas creadas",
        accessorFn: (row) => row.total_notas_creadas ?? "0",
      },
      {
        accessorKey: "total_notas_asignadas",
        header: "Notas asignadas",
        accessorFn: (row) => row.total_notas_asignadas ?? "0",
      },
      {
        accessorKey: "estado_calificacion",
        header: "Estado",
        cell: ({ row }) => {
          const estado = row.original.estado_calificacion ?? "—";
          let cls = "bg-green-100 text-green-700";
          if (estado === "SIN NOTAS CREADAS") cls = "bg-red-100 text-red-700";
          else if (estado === "SIN NINGUNA NOTA")
            cls = "bg-orange-100 text-orange-700";
          else if (estado === "EN PROCESO")
            cls = "bg-yellow-100 text-yellow-700";
          return (
            <span className={`px-2 py-1 block text-xs font-semibold ${cls}`}>
              {estado}
            </span>
          );
        },
      },
    ],
    [],
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 h-full gap-4 flex flex-col">
      {/* Encabezado */}
      <div
        id="tour-cn-header"
        className="w-full grid gap-2 grid-cols-1 lg:grid-cols-5 xl:grid-cols-4 justify-between items-center bg-primary text-surface p-3 rounded-lg"
      >
        <div className=" lg:col-span-3 flex items-center">
          <h1 className="text-2xl font-bold ">Control de Notas</h1>
        </div>
        <SimpleButton
          icon="HelpCircle"
          bg="bg-secondary"
          text="text-surface"
          noRounded={false}
          onClick={tourControlNotas}
        />
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div id="tour-cn-sede">
          <SedeSelect
            label="Sede"
            value={sedeId}
            onChange={handleSedeChange}
            placeholder="Selecciona una sede"
          />
        </div>
        <div id="tour-cn-periodo">
          <PeriodSelector
            label="Período"
            value={periodId}
            onChange={handlePeriodChange}
            placeholder="Selecciona un período"
          />
        </div>
      </div>

      {/* Indicador de carga inicial */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader size={64} message="Cargando control de notas..." />
        </div>
      )}

      {/* Pestañas y tabla (solo cuando hay datos o después de buscar) */}
      {!isLoading && sedeId && periodId && (
        <>
          {/* Tabs */}
          <div className="flex gap-0 border-b border-gray-300">
            <button
              id="tour-cn-tab-create"
              onClick={() => setActiveTab(TAB_CREATE)}
              className={`px-5 py-2 text-sm font-semibold transition-colors rounded-tl rounded-tr cursor-pointer ${
                activeTab === TAB_CREATE
                  ? "bg-primary text-white border-2 border-primary"
                  : "bg-secondary text-primary hover:bg-gray-100"
              }`}
            >
              Registro Notas Creadas
            </button>
            <button
              id="tour-cn-tab-assign"
              onClick={() => setActiveTab(TAB_ASSIGN)}
              className={`px-5 py-2 text-sm font-semibold transition-colors rounded-tl rounded-tr cursor-pointer ${
                activeTab === TAB_ASSIGN
                  ? "bg-primary text-white border-2 border-primary"
                  : "bg-secondary text-primary hover:bg-gray-100"
              }`}
            >
              Registro Notas Asignadas
            </button>
          </div>

          {/* Contenido de las pestañas */}
          <div id="tour-cn-table">
            {activeTab === TAB_CREATE && (
              <DataTable
                data={createData}
                columns={columnsCreate}
                fileName="control_notas_creadas"
                groupBy="docente"
                loading={isLoading}
                loaderMessage="Cargando notas creadas..."
                groupSummary={(rows, isOpen) => {
                  if (!isOpen) return null;
                  const counts = {};
                  rows.forEach((r) => {
                    const estado = r.original.estado_notas ?? "—";
                    counts[estado] = (counts[estado] || 0) + 1;
                  });
                  const colorMap = {
                    "SIN NOTAS CREADAS": "bg-red-100 text-red-700",
                    "SIN DOCENTE": "bg-yellow-100 text-yellow-700",
                  };
                  return (
                    <div className="flex items-center gap-2 flex-wrap">
                      {Object.entries(counts).map(([estado, count]) => (
                        <span
                          key={estado}
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            colorMap[estado] ?? "bg-green-100 text-green-700"
                          }`}
                        >
                          {estado}: {count}
                        </span>
                      ))}
                    </div>
                  );
                }}
              />
            )}
            {activeTab === TAB_ASSIGN && (
              <DataTable
                data={assignData}
                columns={columnsAssign}
                fileName="control_notas_asignadas"
                groupBy="docente"
                loading={isLoading}
                loaderMessage="Cargando notas asignadas..."
                groupSummary={(rows, isOpen) => {
                  if (!isOpen) return null;
                  const counts = {};
                  rows.forEach((r) => {
                    const estado = r.original.estado_calificacion ?? "—";
                    counts[estado] = (counts[estado] || 0) + 1;
                  });
                  const colorMap = {
                    "SIN NOTAS CREADAS": "bg-red-100 text-red-700",
                    "SIN NINGUNA NOTA": "bg-orange-100 text-orange-700",
                    "EN PROCESO": "bg-yellow-100 text-yellow-700",
                  };
                  return (
                    <div className="flex items-center gap-2 flex-wrap">
                      {Object.entries(counts).map(([estado, count]) => (
                        <span
                          key={estado}
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            colorMap[estado] ?? "bg-green-100 text-green-700"
                          }`}
                        >
                          {estado}: {count}
                        </span>
                      ))}
                    </div>
                  );
                }}
              />
            )}
          </div>
        </>
      )}

      {/* Mensaje cuando no se han seleccionado filtros */}
      {!isLoading && (!sedeId || !periodId) && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <p className="text-lg font-medium">
            Selecciona una sede y un período para ver el control de notas.
          </p>
        </div>
      )}
    </div>
  );
};

export default ControlNotas;
