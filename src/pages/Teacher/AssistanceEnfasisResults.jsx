import { useState, useEffect, useMemo, useRef } from "react";
import DataTable from "../../components/atoms/DataTable";
import PeriodSelector from "../../components/atoms/PeriodSelector";
import SedeSelect from "../../components/atoms/SedeSelect";
import Loader from "../../components/atoms/Loader";
import useTeacher from "../../lib/hooks/useTeacher";
import useAuth from "../../lib/hooks/useAuth";
import useData from "../../lib/hooks/useData";
import { useNotify } from "../../lib/hooks/useNotify";
import {
  getAssistanceStudentEmphasisResults,
  getInstitutionEmphasisArea,
  getTeacherAsignatures,
} from "../../services/enfasisService";

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

const getFirstDayOfMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
};

const getLastDayOfMonth = () => {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`;
};

const AssistanceEnfasisResults = () => {
  const { rol, idDocente, idInstitution, idSede, nameSede } = useAuth();
  const { loadInstitutionSedes, institutionSedes } = useData();
  const { getTeacherSede } = useTeacher();
  const notify = useNotify();

  const getResultsRef = useRef(getAssistanceStudentEmphasisResults);
  useEffect(() => {
    getResultsRef.current = getAssistanceStudentEmphasisResults;
  });
  const notifyRef = useRef(notify);
  useEffect(() => {
    notifyRef.current = notify;
  });

  const isRol3 = useMemo(() => String(rol) === "3", [rol]);
  const isDocente = useMemo(
    () => String(rol).toLowerCase() === "docente" || String(rol) === "7",
    [rol],
  );

  // ── Filtros ───────────────────────────────────────────────────────────────
  const [sedeId, setSedeId] = useState("");
  const [areaId, setAreaId] = useState("");
  const [asignatureId, setAsignatureId] = useState("");
  const [periodId, setPeriodId] = useState("");
  const [startDate, setStartDate] = useState(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState(getLastDayOfMonth());

  // ── Opciones ──────────────────────────────────────────────────────────────
  const [teacherSedes, setTeacherSedes] = useState([]);
  const [loadingTeacherSedes, setLoadingTeacherSedes] = useState(false);
  const [teacherAsignatures, setTeacherAsignatures] = useState([]);
  const [loadingAsignatures, setLoadingAsignatures] = useState(false);
  const [institutionRows, setInstitutionRows] = useState([]);
  const [loadingInstitutionRows, setLoadingInstitutionRows] = useState(false);

  // ── Resultados ────────────────────────────────────────────────────────────
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Sedes de la institución (admin)
  useEffect(() => {
    if (!isRol3) return;
    if (!idInstitution || typeof loadInstitutionSedes !== "function") return;
    loadInstitutionSedes(idInstitution).catch((err) =>
      console.warn("AssistanceEnfasisResults - loadInstitutionSedes failed:", err),
    );
  }, [isRol3, idInstitution, loadInstitutionSedes]);

  // Lista de asignaturas del énfasis por institución (admin)
  useEffect(() => {
    if (!isRol3 || !idInstitution) return;
    let mounted = true;
    setLoadingInstitutionRows(true);
    getInstitutionEmphasisArea({ institution: Number(idInstitution) })
      .then((res) => {
        if (mounted) setInstitutionRows(Array.isArray(res) ? res : []);
      })
      .catch((err) => {
        console.error("AssistanceEnfasisResults - getInstitutionEmphasisArea error:", err);
        if (mounted) setInstitutionRows([]);
      })
      .finally(() => {
        if (mounted) setLoadingInstitutionRows(false);
      });
    return () => {
      mounted = false;
    };
  }, [isRol3, idInstitution]);

  // Sedes del docente
  useEffect(() => {
    if (!isDocente) return;
    let mounted = true;
    setLoadingTeacherSedes(true);
    const load = async () => {
      if (!idDocente || !getTeacherSede) {
        if (mounted) setTeacherSedes([]);
        return;
      }
      try {
        const res = await getTeacherSede({ idTeacher: Number(idDocente) });
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        const mapped = list.filter(Boolean).map((s) => ({
          id: String(s?.id ?? s?.id_sede ?? "").trim(),
          name: String(s?.name ?? s?.nombre ?? s?.nombre_sede ?? "").trim(),
        }));
        if (mounted) setTeacherSedes(mapped);
      } catch (err) {
        console.error("AssistanceEnfasisResults - getTeacherSede error:", err);
        if (mounted) setTeacherSedes([]);
      } finally {
        if (mounted) setLoadingTeacherSedes(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [isDocente, idDocente, getTeacherSede]);

  // Asignaturas del énfasis del docente
  useEffect(() => {
    if (!isDocente || !idDocente) return;
    let mounted = true;
    setLoadingAsignatures(true);
    getTeacherAsignatures(Number(idDocente))
      .then((res) => {
        if (mounted) setTeacherAsignatures(Array.isArray(res) ? res : []);
      })
      .catch((err) => {
        console.error("AssistanceEnfasisResults - getTeacherAsignatures error:", err);
        if (mounted) setTeacherAsignatures([]);
      })
      .finally(() => {
        if (mounted) setLoadingAsignatures(false);
      });
    return () => {
      mounted = false;
    };
  }, [isDocente, idDocente]);

  // Cascada admin: sede -> área -> asignatura (a partir de getInstitutionEmphasisArea)
  const selectedSedeName = useMemo(() => {
    const sedes = Array.isArray(institutionSedes) ? institutionSedes : [];
    const sede = sedes.find(
      (s) => String(s?.id ?? s?.id_sede ?? "").trim() === String(sedeId).trim(),
    );
    return String(
      sede?.name ?? sede?.nombre ?? sede?.nombre_sede ?? "",
    ).trim();
  }, [institutionSedes, sedeId]);

  const institutionRowsBySede = useMemo(() => {
    const list = Array.isArray(institutionRows) ? institutionRows : [];
    if (!sedeId) return list;
    const name = selectedSedeName.toLowerCase();
    return list.filter((r) => {
      const byId = String(r?.id_sede ?? "").trim() === String(sedeId).trim();
      if (!name) return byId;
      const byName =
        String(r?.nombre_sede ?? "").trim().toLowerCase() === name;
      return byName || byId;
    });
  }, [institutionRows, sedeId, selectedSedeName]);

  const areaOptions = useMemo(() => {
    const areas = new Map();
    for (const r of institutionRowsBySede) {
      const v = String(r?.name_area_enfasis ?? "").trim();
      if (v) areas.set(v, v);
    }
    return Array.from(areas.values()).sort((a, b) =>
      a.localeCompare(b, "es", { sensitivity: "base" }),
    );
  }, [institutionRowsBySede]);

  const adminAsignatureOptions = useMemo(() => {
    const list = areaId
      ? institutionRowsBySede.filter(
          (r) => String(r?.name_area_enfasis ?? "").trim() === areaId,
        )
      : institutionRowsBySede;
    const opts = new Map();
    for (const r of list) {
      const id = r?.id_asignatura_enfasis ?? r?.id;
      if (id == null) continue;
      const label = String(r?.name_asignatura_enfasis ?? "").trim();
      if (!label) continue;
      opts.set(
        String(id),
        { value: String(id), label },
      );
    }
    return Array.from(opts.values());
  }, [institutionRowsBySede, areaId]);

  const teacherAsignatureOptions = useMemo(
    () =>
      (Array.isArray(teacherAsignatures) ? teacherAsignatures : [])
        .filter((a) => a?.id_asignatura_enfasis != null)
        .map((a) => ({
          value: String(a.id_asignatura_enfasis),
          label: String(a.name_asignatura_enfasis ?? ""),
        }))
        .filter((o) => o.value && o.label),
    [teacherAsignatures],
  );

  const asignatureOptions = useMemo(
    () => (isDocente ? teacherAsignatureOptions : adminAsignatureOptions),
    [isDocente, teacherAsignatureOptions, adminAsignatureOptions],
  );

  // Data de sedes para SedeSelect
  const sedeData = useMemo(() => {
    if (!isDocente) return null;
    if (teacherSedes.length) return teacherSedes;
    if (idSede && nameSede) return [{ id: idSede, name: nameSede }];
    return null;
  }, [isDocente, idSede, nameSede, teacherSedes]);

  const handleSedeChange = (e) => {
    setSedeId(e.target.value);
    setAreaId("");
    setAsignatureId("");
  };

  const handleAreaChange = (e) => {
    setAreaId(e.target.value);
    setAsignatureId("");
  };

  const allFiltersReady = Boolean(
    sedeId &&
      asignatureId &&
      periodId &&
      startDate &&
      endDate &&
      (!isRol3 || areaId),
  );

  // Auto-búsqueda cuando todos los filtros tienen datos
  useEffect(() => {
    if (!allFiltersReady) return;
    let mounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      setHasSearched(true);
      try {
        const res = await getResultsRef.current({
          startDate,
          endDate,
          idSede: Number(sedeId),
          idPeriod: Number(periodId),
          idAsignatureEnfasis: Number(asignatureId),
        });
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        if (mounted) {
          setRows(Array.isArray(list) ? list : []);
          if (!Array.isArray(list) || list.length === 0)
            notifyRef.current.info(
              "No se encontraron asistencias con los filtros seleccionados.",
            );
        }
      } catch (err) {
        console.error("AssistanceEnfasisResults - error:", err);
        if (mounted) {
          setRows([]);
          notifyRef.current.error(
            err?.message || "Error al consultar asistencias.",
          );
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRol3, areaId, sedeId, asignatureId, periodId, startDate, endDate]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "nombre_estudiante",
        header: "Estudiante",
      },
      {
        accessorKey: "curso",
        header: "Curso",
        meta: { hideOnLG: true },
      },
      {
        accessorKey: "name_asignatura_enfasis",
        header: "Asignatura",
      },
      {
        accessorKey: "date_asistencia_asignatura_enfasis",
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
    <>
      {/* Panel de filtros */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-2">
        <div>
          <label className="block text-sm font-medium mb-1">Fecha inicio</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 border rounded bg-surface"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Fecha fin</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 border rounded bg-surface"
          />
        </div>

        <div>
          <SedeSelect
            value={sedeId}
            onChange={handleSedeChange}
            data={isDocente ? sedeData : null}
            loading={isDocente ? loadingTeacherSedes : false}
          />
        </div>

        {isRol3 && (
          <div>
            <label className="block text-sm font-medium mb-1">Área énfasis</label>
            <select
              value={areaId}
              onChange={handleAreaChange}
              disabled={!sedeId}
              className="w-full p-2 border rounded bg-surface"
            >
              <option value="">
                {loadingInstitutionRows
                  ? "Cargando áreas..."
                  : sedeId
                    ? "Selecciona un área"
                    : "Selecciona sede primero"}
              </option>
              {!loadingInstitutionRows &&
                areaOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">
            Asignatura énfasis
          </label>
          <select
            value={asignatureId}
            onChange={(e) => setAsignatureId(e.target.value)}
            disabled={!sedeId || (!isRol3 && !isDocente)}
            className="w-full p-2 border rounded bg-surface"
          >
            <option value="">
              {loadingAsignatures || loadingInstitutionRows
                ? "Cargando asignaturas..."
                : !sedeId
                  ? "Selecciona sede primero"
                  : isRol3 && !areaId
                    ? "Selecciona un área"
                    : "Selecciona una asignatura"}
            </option>
            {!loadingAsignatures &&
              !loadingInstitutionRows &&
              asignatureOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
          </select>
        </div>

        <div>
          <PeriodSelector
            label="Período"
            value={periodId}
            onChange={(e) => setPeriodId(e.target.value)}
            autoLoad={true}
          />
        </div>
      </div>

      {/* Tabla de resultados */}
      <div className="flex-1 mt-4">
        {isLoading ? (
          <Loader message="Cargando asistencias..." size={96} />
        ) : !hasSearched ? (
          <div className="flex items-center justify-center h-40 text-gray-500 text-sm">
            Selecciona todos los filtros para ver las asistencias.
          </div>
        ) : (
          <DataTable
            key="enfasis-assistance-table"
            data={rows}
            columns={columns}
            fileName="Export_Asistencias_Enfasis"
            initialSorting={[{ id: "nombre_estudiante", desc: false }]}
            showDownloadButtons={rows.length > 0}
            pageSize={20}
          />
        )}

        {hasSearched && !isLoading && rows.length === 0 && (
          <div className="mt-4 text-center text-gray-500 text-sm">
            No se encontraron registros para los filtros seleccionados.
          </div>
        )}
      </div>
    </>
  );
};

export default AssistanceEnfasisResults;