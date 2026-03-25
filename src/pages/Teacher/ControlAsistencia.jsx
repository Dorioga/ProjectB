import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import DataTable from "../../components/atoms/DataTable";
import SedeSelect from "../../components/atoms/SedeSelect";
import JourneySelect from "../../components/atoms/JourneySelect";
import SimpleButton from "../../components/atoms/SimpleButton";
import Loader from "../../components/atoms/Loader";
import useTeacher from "../../lib/hooks/useTeacher";
import useAuth from "../../lib/hooks/useAuth";
import useData from "../../lib/hooks/useData";
import { useNotify } from "../../lib/hooks/useNotify";

/**
 * Retorna el primer día del mes actual en formato YYYY-MM-DD
 */
const getFirstDayOfMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
};

/**
 * Retorna el último día del mes actual en formato YYYY-MM-DD
 */
const getLastDayOfMonth = () => {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`;
};

const ControlAsistencia = () => {
  const { getAssistanceBySedeAsignatures, getTeacherSede } = useTeacher();
  const { idSede, nameSede, idDocente, token, rol, idInstitution } = useAuth();
  const { loadInstitutionSedes } = useData();
  const notify = useNotify();

  // Refs estables para evitar bucles
  const getDataRef = useRef(getAssistanceBySedeAsignatures);
  useEffect(() => {
    getDataRef.current = getAssistanceBySedeAsignatures;
  });
  const notifyRef = useRef(notify);
  useEffect(() => {
    notifyRef.current = notify;
  });

  // ── Rol ───────────────────────────────────────────────────────────────────
  const isDocente = useMemo(
    () => String(rol).toLowerCase() === "docente" || String(rol) === "7",
    [rol],
  );

  // ── Filtros ───────────────────────────────────────────────────────────────
  const [sedeId, setSedeId] = useState("");
  const [workDayId, setWorkDayId] = useState("");
  const [startDate, setStartDate] = useState(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState(getLastDayOfMonth());

  // ── Sedes del docente ─────────────────────────────────────────────────────
  const [teacherSedes, setTeacherSedes] = useState([]);
  const [loadingTeacherSedes, setLoadingTeacherSedes] = useState(false);

  // ── Tabla ─────────────────────────────────────────────────────────────────
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Data de sedes para SedeSelect
  const teacherSedeData = useMemo(() => {
    if (!isDocente) return null;
    if (teacherSedes.length) return teacherSedes;
    if (idSede && nameSede) return [{ id: idSede, name: nameSede }];
    return null;
  }, [isDocente, idSede, nameSede, teacherSedes]);

  // ── Cargar sedes del docente ───────────────────────────────────────────────
  useEffect(() => {
    if (!isDocente) {
      setTeacherSedes([]);
      return;
    }
    let mounted = true;
    const load = async () => {
      if (!idDocente || !getTeacherSede || !token) {
        if (mounted) setTeacherSedes([]);
        return;
      }
      if (mounted) setLoadingTeacherSedes(true);
      try {
        const res = await getTeacherSede({ idTeacher: Number(idDocente) });
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        const mapped = list.filter(Boolean).map((s) => ({
          id: String(s?.id ?? s?.id_sede ?? "").trim(),
          name: String(s?.name ?? s?.nombre ?? s?.nombre_sede ?? "").trim(),
        }));
        if (mounted) setTeacherSedes(mapped);
      } catch (err) {
        console.error("ControlAsistencia - getTeacherSede error:", err);
        if (mounted) setTeacherSedes([]);
      } finally {
        if (mounted) setLoadingTeacherSedes(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [isDocente, idDocente, getTeacherSede, token]);

  // ── Cargar sedes de la institución (admin) ────────────────────────────────
  useEffect(() => {
    if (isDocente) return;
    if (!idInstitution || typeof loadInstitutionSedes !== "function") return;
    loadInstitutionSedes(idInstitution).catch((err) =>
      console.warn("ControlAsistencia - loadInstitutionSedes failed:", err),
    );
  }, [isDocente, idInstitution, loadInstitutionSedes]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSedeChange = (e) => {
    setSedeId(e.target.value);
    setWorkDayId("");
  };

  const isFormReady = Boolean(sedeId && workDayId && startDate && endDate);

  const handleSearch = useCallback(async () => {
    if (!isFormReady) {
      notify.warning("Completa todos los filtros antes de buscar.");
      return;
    }
    try {
      setIsLoading(true);
      setHasSearched(true);
      const payload = {
        idSede: Number(sedeId),
        idWorkDay: Number(workDayId),
        startDate,
        endDate,
      };
      const response = await getAssistanceBySedeAsignatures(payload);
      const rows = Array.isArray(response)
        ? response
        : (response?.data ?? response?.result ?? []);
      setTableData(Array.isArray(rows) ? rows : []);
      if (Array.isArray(rows) && rows.length === 0) {
        notify.info(
          "No se encontraron registros con los filtros seleccionados.",
        );
      }
    } catch (error) {
      console.error("ControlAsistencia - error:", error);
      notify.error(
        error?.message || "Error al consultar asignaturas de asistencia.",
      );
      setTableData([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    isFormReady,
    sedeId,
    workDayId,
    startDate,
    endDate,
    getAssistanceBySedeAsignatures,
    notify,
  ]);

  const handleClear = () => {
    setSedeId("");
    setWorkDayId("");
    setStartDate(getFirstDayOfMonth());
    setEndDate(getLastDayOfMonth());
    setTableData([]);
    setHasSearched(false);
  };

  // ── Columnas ──────────────────────────────────────────────────────────────
  const columns = useMemo(
    () => [
      {
        accessorKey: "nombre_sede",
        header: "Sede",
        meta: { hideOnXL: true },
      },
      {
        accessorKey: "nombre_jornada",
        header: "Jornada",
        meta: { hideOnXL: true },
      },
      {
        accessorKey: "grado",
        header: "Grado",
        meta: { hideOnLG: true },
      },
      {
        accessorKey: "nombre_asignatura",
        header: "Asignatura",
      },
      {
        accessorKey: "docente",
        header: "Docente",
      },
      {
        accessorKey: "estado_asistencia",
        header: "Estado Asistencia",
        cell: ({ getValue }) => {
          const val = getValue();
          const sinAsistencia = String(val).toLowerCase() === "sin asistencia";
          return (
            <span
              className={`px-2 py-0.5 rounded-sm text-xs font-semibold ${
                sinAsistencia
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {val}
            </span>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="p-6 h-full gap-4 flex flex-col">
      {/* Encabezado */}
      <div className="w-full flex justify-between items-center bg-primary text-surface p-3 rounded-lg">
        <h2 className="text-2xl font-bold">Control de Asistencia</h2>
      </div>

      {/* Panel de filtros */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-2">
        {/* Sede */}
        <SedeSelect
          value={sedeId}
          onChange={handleSedeChange}
          data={isDocente ? teacherSedeData : null}
          loading={isDocente ? loadingTeacherSedes : false}
        />

        {/* Jornada (WorkDay) */}
        <JourneySelect
          label="Jornada"
          value={workDayId}
          onChange={(e) => setWorkDayId(e.target.value)}
          placeholder="Selecciona una jornada"
          disabled={!sedeId}
        />

        {/* Fecha inicio */}
        <div>
          <label className="block text-sm font-medium mb-1">Fecha inicio</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 border rounded bg-surface"
          />
        </div>

        {/* Fecha fin */}
        <div>
          <label className="block text-sm font-medium mb-1">Fecha fin</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 border rounded bg-surface"
          />
        </div>

        {/* Botones */}
        <div className="flex gap-2 items-end">
          <SimpleButton
            msj="Buscar"
            icon="Search"
            bg="bg-primary"
            text="text-surface"
            noRounded={false}
            disabled={!isFormReady || isLoading}
            onClick={handleSearch}
          />
        </div>
      </div>

      {/* Tabla de resultados */}
      <div className="flex-1 mt-4">
        {isLoading ? (
          <Loader message="Cargando datos de asistencia..." size={96} />
        ) : !hasSearched ? (
          <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
            Selecciona los filtros y presiona{" "}
            <strong className="ml-1">Buscar</strong>.
          </div>
        ) : (
          <DataTable
            key="control-asistencia-table"
            data={tableData}
            columns={columns}
            fileName="Export_Control_Asistencia"
            showDownloadButtons={tableData.length > 0}
            pageSize={50}
          />
        )}

        {hasSearched && !isLoading && tableData.length === 0 && (
          <div className="mt-4 text-center text-gray-500 text-sm">
            No se encontraron registros para los filtros seleccionados.
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlAsistencia;
