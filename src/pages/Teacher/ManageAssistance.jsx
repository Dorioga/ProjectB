import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import DataTable from "../../components/atoms/DataTable";
import Modal from "../../components/atoms/Modal";
import RegisterAssistance from "./RegisterAssistance";
import SedeSelect from "../../components/atoms/SedeSelect";
import GradeSelector from "../../components/atoms/GradeSelector";
import PeriodSelector from "../../components/atoms/PeriodSelector";
import SimpleButton from "../../components/atoms/SimpleButton";
import Loader from "../../components/atoms/Loader";
import useTeacher from "../../lib/hooks/useTeacher";
import useAuth from "../../lib/hooks/useAuth";
import useData from "../../lib/hooks/useData";
import { useNotify } from "../../lib/hooks/useNotify";

/**
 * Formatea una fecha ISO a dd/mm/yyyy
 */
const formatDate = (isoStr) => {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const year = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return isoStr;
  }
};

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

const ManageAssistance = () => {
  const { getAssistanceValues, getTeacherSede, getTeacherGrades } =
    useTeacher();
  const { idSede, nameSede, idDocente, token, rol, idInstitution } = useAuth();
  const { loadInstitutionSedes } = useData();
  const notify = useNotify();

  // Refs estables para evitar bucles en useEffect (patrón ManageLogro)
  const getAssistanceValuesRef = useRef(getAssistanceValues);
  useEffect(() => {
    getAssistanceValuesRef.current = getAssistanceValues;
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
  const [gradeId, setGradeId] = useState("");
  const [periodId, setPeriodId] = useState("");
  const [startDate, setStartDate] = useState(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState(getLastDayOfMonth());

  // ── Sedes del docente ─────────────────────────────────────────────────────
  const [teacherSedes, setTeacherSedes] = useState([]);
  const [loadingTeacherSedes, setLoadingTeacherSedes] = useState(false);

  // ── Tabla ─────────────────────────────────────────────────────────────────
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Params para GradeSelector del docente (mismo patrón que ManageLogro)
  const teacherGradesParams = useMemo(
    () => ({
      ...(idDocente && { idTeacher: Number(idDocente) }),
      ...(sedeId ? { idSede: Number(sedeId) } : { idSede: Number(idSede) }),
    }),
    [idDocente, sedeId, idSede],
  );

  // Data de sedes para SedeSelect: si es docente usa las del docente,
  // si no, null (SedeSelect carga las de la institución automáticamente)
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
        console.error("ManageAssistance - getTeacherSede error:", err);
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

  // ── Cargar sedes de la institución (admin / no docente) ───────────────────
  useEffect(() => {
    if (isDocente) return;
    if (!idInstitution || typeof loadInstitutionSedes !== "function") return;
    loadInstitutionSedes(idInstitution).catch((err) =>
      console.warn("ManageAssistance - loadInstitutionSedes failed:", err),
    );
  }, [isDocente, idInstitution, loadInstitutionSedes]);

  // ── Auto-fetch (solo docente) cuando todos los filtros están completos ────
  useEffect(() => {
    if (!isDocente) return;
    if (!sedeId || !gradeId || !periodId || !startDate || !endDate) return;

    let mounted = true;
    const fetch = async () => {
      setIsLoading(true);
      setHasSearched(true);
      try {
        const payload = {
          startDate,
          endDate,
          idSede: Number(sedeId),
          idGrade: Number(gradeId),
          idPeriod: Number(periodId),
        };
        console.log("ManageAssistance (docente) - payload:", payload);
        const res = await getAssistanceValuesRef.current(payload);
        const rows = Array.isArray(res) ? res : (res?.data ?? []);
        if (mounted) {
          setTableData(rows);
          if (rows.length === 0)
            notifyRef.current.info(
              "No se encontraron asistencias con los filtros seleccionados.",
            );
        }
      } catch (err) {
        console.error("ManageAssistance - error:", err);
        if (mounted) {
          setTableData([]);
          notifyRef.current.error(
            err?.message || "Error al consultar asistencias.",
          );
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetch();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDocente, sedeId, gradeId, periodId, startDate, endDate]);

  // ── Handlers de cascada (admin) ───────────────────────────────────────────
  const handleSedeChange = (e) => {
    setSedeId(e.target.value);
    setGradeId("");
  };

  // Validar que todos los filtros estén completos (para botón buscar — admin)
  const isFormReady = Boolean(
    sedeId && gradeId && periodId && startDate && endDate,
  );

  // Buscar asistencias (solo admin — docente usa auto-fetch)
  const handleSearch = useCallback(async () => {
    if (!isFormReady) {
      notify.warning("Completa todos los filtros antes de buscar.");
      return;
    }
    try {
      setIsLoading(true);
      setHasSearched(true);
      const payload = {
        startDate,
        endDate,
        idSede: Number(sedeId),
        idGrade: Number(gradeId),
        idPeriod: Number(periodId),
      };
      console.log("ManageAssistance (admin) - payload:", payload);
      const response = await getAssistanceValues(payload);
      const rows = Array.isArray(response)
        ? response
        : (response?.data ?? response?.result ?? []);
      setTableData(Array.isArray(rows) ? rows : []);
    } catch (error) {
      console.error("ManageAssistance - error:", error);
      notify.error(error?.message || "Error al obtener las asistencias.");
      setTableData([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    isFormReady,
    sedeId,
    gradeId,
    periodId,
    startDate,
    endDate,
    getAssistanceValues,
    notify,
  ]);

  // Limpiar filtros y tabla
  const handleClear = () => {
    setSedeId("");
    setGradeId("");
    setPeriodId("");
    setStartDate(getFirstDayOfMonth());
    setEndDate(getLastDayOfMonth());
    setTableData([]);
    setHasSearched(false);
  };

  // ── Columnas ──────────────────────────────────────────────────────────────
  const columns = useMemo(
    () => [
      {
        accessorKey: "id_assistance",
        header: "ID",
        meta: { hideOnSM: true },
      },
      {
        accessorKey: "nombre_estudiante",
        header: "Estudiante",
      },
      {
        accessorKey: "nombre_asignatura",
        header: "Asignatura",
        meta: { hideOnLG: true },
      },
      {
        id: "grado_grupo",
        header: "Grado / Grupo",
        accessorFn: (row) =>
          [row.nombre_grado, row.grupo].filter(Boolean).join(" – "),
        meta: { hideOnLG: true },
      },
      {
        accessorKey: "fecha_assistance",
        header: "Fecha",
        cell: ({ getValue }) => formatDate(getValue()),
      },
      {
        accessorKey: "presente",
        header: "Presente",
        cell: ({ getValue }) => {
          const val = getValue();
          const isPresent =
            String(val).toLowerCase() === "si" ||
            String(val).toLowerCase() === "sí" ||
            val === true ||
            val === 1;
          return (
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                isPresent
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {isPresent ? "Sí" : "No"}
            </span>
          );
        },
      },
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
    ],
    [],
  );

  return (
    <div className="p-6 h-full gap-4 flex flex-col">
      {/* Encabezado */}
      <div className="w-full flex justify-between items-center bg-primary text-surface p-3 rounded-lg">
        <h2 className="text-2xl font-bold">Gestión de Asistencias</h2>
        <div className="w-52">
          <SimpleButton
            type="button"
            onClick={() => setIsRegisterOpen(true)}
            msj="Registrar asistencia"
            icon="Plus"
            bg="bg-secondary"
            text="text-surface"
          />
        </div>
      </div>

      {/* Panel de filtros */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-2">
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

        {/* Sede — docente ve sus sedes asignadas; admin ve las de la institución */}
        <SedeSelect
          value={sedeId}
          onChange={handleSedeChange}
          data={isDocente ? teacherSedeData : null}
          loading={isDocente ? loadingTeacherSedes : false}
        />

        {/* Grado — docente usa customFetchMethod con sus grados asignados */}
        <GradeSelector
          label="Grado"
          value={gradeId}
          onChange={(e) => setGradeId(e.target.value)}
          placeholder={
            sedeId ? "Selecciona un grado" : "Selecciona sede primero"
          }
          sedeId={sedeId}
          autoLoad={true}
          disabled={!sedeId}
          {...(isDocente && {
            customFetchMethod: getTeacherGrades,
            additionalParams: teacherGradesParams,
          })}
        />

        {/* Período */}
        <PeriodSelector
          label="Período"
          value={periodId}
          onChange={(e) => setPeriodId(e.target.value)}
          autoLoad={true}
        />

        {/* Botones solo para admin — docente hace auto-fetch */}
        {!isDocente && (
          <div className="flex gap-2 items-end md:col-span-5">
            <SimpleButton
              msj="Buscar"
              icon="Search"
              bg="bg-primary"
              text="text-surface"
              noRounded={false}
              disabled={!isFormReady || isLoading}
              onClick={handleSearch}
            />
            <SimpleButton
              msj=""
              icon="X"
              bg="bg-gray-200"
              text="text-gray-700"
              noRounded={false}
              onClick={handleClear}
              msjtooltip="Limpiar filtros"
            />
          </div>
        )}
      </div>

      {/* Tabla de resultados */}
      <div className="flex-1 mt-4">
        {isLoading ? (
          <Loader message="Cargando asistencias..." size={96} />
        ) : !hasSearched ? (
          <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
            {isDocente ? (
              "Selecciona sede, grado y período para ver las asistencias."
            ) : (
              <>
                Selecciona los filtros y presiona{" "}
                <strong className="ml-1">Buscar</strong>.
              </>
            )}
          </div>
        ) : (
          <DataTable
            key="assistance-table"
            data={tableData}
            columns={columns}
            fileName="Export_Asistencias"
            showDownloadButtons={tableData.length > 0}
            pageSize={20}
          />
        )}

        {hasSearched && !isLoading && tableData.length === 0 && (
          <div className="mt-4 text-center text-gray-500 text-sm">
            No se encontraron registros para los filtros seleccionados.
          </div>
        )}
      </div>
      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Registrar asistencia"
        size="7xl"
      >
        <RegisterAssistance onClose={() => setIsRegisterOpen(false)} />
      </Modal>
    </div>
  );
};

export default ManageAssistance;
