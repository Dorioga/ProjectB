import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import SimpleButton from "../../components/atoms/SimpleButton";
import DataTable from "../../components/atoms/DataTable";
import Loader from "../../components/atoms/Loader";
import PeriodSelector from "../../components/atoms/PeriodSelector";
import useAuth from "../../lib/hooks/useAuth";
import { useNotify } from "../../lib/hooks/useNotify";
import {
  getTeacherAsignatures,
  getStudentEnfasis,
  getRecordStudent,
} from "../../services/enfasisService";

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

const noteKey = (r) =>
  r.id_nota != null ? String(r.id_nota) : `name:${r.name_nota}`;

const RegisterStudentEnfasisRecords = ({ onClose }) => {
  const { idDocente } = useAuth();
  const notify = useNotify();

  const [asignaturas, setAsignaturas] = useState([]);
  const [loadingAsignaturas, setLoadingAsignaturas] = useState(false);
  const [asignatura, setAsignatura] = useState("");
  const [periodo, setPeriodo] = useState("");

  const [students, setStudents] = useState([]);
  const [recordsList, setRecordsList] = useState([]);
  const [valuesByStudent, setValuesByStudent] = useState({});
  const [observacionesByStudent, setObservacionesByStudent] = useState({});
  const [loadingData, setLoadingData] = useState(false);

  const valuesByStudentRef = useRef(valuesByStudent);
  const observacionesByStudentRef = useRef(observacionesByStudent);
  valuesByStudentRef.current = valuesByStudent;
  observacionesByStudentRef.current = observacionesByStudent;

  useEffect(() => {
    if (!idDocente) return;
    let mounted = true;
    setLoadingAsignaturas(true);
    getTeacherAsignatures(idDocente)
      .then((res) => {
        if (mounted) setAsignaturas(Array.isArray(res) ? res : []);
      })
      .catch(() => {
        if (mounted) setAsignaturas([]);
      })
      .finally(() => {
        if (mounted) setLoadingAsignaturas(false);
      });
    return () => {
      mounted = false;
    };
  }, [idDocente]);

  const getStudentKey = (student) =>
    String(
      student?.fk_student ?? student?.id_student ?? student?.id ?? "",
    ).trim();

  const loadData = useCallback(async () => {
    if (!idDocente || !asignatura || !periodo) {
      setStudents([]);
      setRecordsList([]);
      setValuesByStudent({});
      setObservacionesByStudent({});
      return;
    }
    setLoadingData(true);
    try {
      const studentsResponse = await getStudentEnfasis(asignatura);
      const studentsArray = Array.isArray(studentsResponse)
        ? studentsResponse
        : [];
      setStudents(studentsArray);

      const recordPromises = studentsArray.map((s) =>
        getRecordStudent({
          fk_docente: Number(idDocente),
          fk_asignatura_enfasis: Number(asignatura),
          fk_period: Number(periodo),
          fk_estudiante: Number(getStudentKey(s)),
        }),
      );
      const settled = await Promise.allSettled(recordPromises);

      const notesMap = new Map();
      const newValues = {};
      const newObservaciones = {};
      settled.forEach((res) => {
        if (res.status !== "fulfilled") return;
        const data = Array.isArray(res.value)
          ? res.value
          : (res.value?.data ?? []);
        data.forEach((n) => {
          const name = String(n?.name_nota_asignatura_enfasis ?? "").trim();
          const id = n?.id_nota_asignatura_enfasis ?? n?.id ?? null;
          const key = id != null ? String(id) : `name:${name}`;
          if (!name && !id) return;
          if (!notesMap.has(key)) {
            notesMap.set(key, {
              name_nota: name,
              id_nota: id ?? undefined,
              porcentaje:
                n?.porcentaje_nota_asignatura_enfasis ??
                n?.porcentaje ??
                undefined,
            });
          }
          const studentKey = String(n?.fk_student ?? "").trim();
          if (!studentKey) return;
          const valor = n?.valor_nota ?? n?.value ?? null;
          if (valor != null) {
            newValues[studentKey] = newValues[studentKey] || {};
            newValues[studentKey][key] = String(valor);
          }
          const obs = n?.observacion_asignatura_enfasis ?? null;
          if (obs != null && newObservaciones[studentKey] === undefined) {
            newObservaciones[studentKey] = String(obs);
          }
        });
      });

      setRecordsList(Array.from(notesMap.values()));
      setValuesByStudent(newValues);
      setObservacionesByStudent(newObservaciones);
    } catch (err) {
      console.error(
        "RegisterStudentEnfasisRecords - loadData error:",
        err,
      );
      notify.error(
        err?.message || "No fue posible cargar estudiantes o notas.",
      );
      setStudents([]);
      setRecordsList([]);
      setValuesByStudent({});
      setObservacionesByStudent({});
    } finally {
      setLoadingData(false);
    }
  }, [idDocente, asignatura, periodo, notify]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleValueChange = (studentKey, recordKey, value) => {
    setValuesByStudent((prev) => ({
      ...prev,
      [studentKey]: { ...(prev[studentKey] ?? {}), [recordKey]: value },
    }));
  };

  const handleObservacionChange = (studentKey, value) => {
    setObservacionesByStudent((prev) => ({ ...prev, [studentKey]: value }));
  };

  const computeFinal = (studentKey) => {
    const values = valuesByStudentRef.current?.[studentKey] ?? {};
    const weighted = (Array.isArray(recordsList) ? recordsList : []).reduce(
      (acc, r) => {
        const p = Number(r.porcentaje) || 0;
        const v = Number(values[noteKey(r)] ?? values[r.name_nota] ?? 0);
        return acc + (Number.isFinite(v) ? v : 0) * (p / 100);
      },
      0,
    );
    return round2(weighted);
  };

  const tableColumns = useMemo(() => {
    const columns = [
      {
        accessorKey: "nombre",
        header: "Estudiante",
        cell: ({ row }) => {
          const s = row.original;
          return (
            <div className="p-2 text-sm">
              <div className="font-medium">{s.nombre ?? ""}</div>
              {s.grado ? (
                <div className="text-xs text-gray-500">{s.grado}</div>
              ) : null}
            </div>
          );
        },
      },
    ];

    (Array.isArray(recordsList) ? recordsList : []).forEach((r) => {
      const key = noteKey(r);
      columns.push({
        id: `note-${key}`,
        header: `${r.name_nota}${r.porcentaje != null ? ` (${r.porcentaje}%)` : ""}`,
        cell: ({ row }) => {
          const sKey = getStudentKey(row.original);
          const value = valuesByStudentRef.current?.[sKey]?.[key] ?? "";
          return (
            <div className="p-2">
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={value}
                onChange={(e) =>
                  handleValueChange(sKey, key, e.target.value)
                }
                className="w-full p-1.5 border rounded bg-surface text-sm"
              />
            </div>
          );
        },
      });
    });

    columns.push({
      id: "final",
      header: "Nota final",
      cell: ({ row }) => {
        const sKey = getStudentKey(row.original);
        return (
          <div className="p-2 text-sm font-semibold">
            {computeFinal(sKey)}
          </div>
        );
      },
    });

    columns.push({
      id: "observacion",
      header: "Observación",
      cell: ({ row }) => {
        const sKey = getStudentKey(row.original);
        return (
          <div className="p-2">
            <input
              type="text"
              value={observacionesByStudentRef.current?.[sKey] ?? ""}
              onChange={(e) =>
                handleObservacionChange(sKey, e.target.value)
              }
              className="w-full p-1.5 border rounded bg-surface text-sm"
            />
          </div>
        );
      },
    });

    return columns;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordsList]);

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        <div>
          <label className="">Asignatura énfasis</label>
          <select
            value={asignatura}
            onChange={(e) => setAsignatura(e.target.value)}
            className="w-full p-2 border rounded bg-surface"
          >
            <option value="">
              {loadingAsignaturas
                ? "Cargando asignaturas..."
                : "Selecciona asignatura"}
            </option>
            {!loadingAsignaturas &&
              asignaturas.map((a) => (
                <option
                  key={a.id_asignatura_enfasis}
                  value={a.id_asignatura_enfasis}
                >
                  {a.name_asignatura_enfasis}
                </option>
              ))}
          </select>
        </div>
        <div>
          <PeriodSelector
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="w-full p-2 border rounded bg-surface"
            autoLoad={true}
          />
        </div>
      </div>

      {!asignatura || !periodo ? (
        <div className="text-sm text-gray-500 p-4 border rounded bg-surface">
          Selecciona asignatura y período para cargar los estudiantes.
        </div>
      ) : loadingData ? (
        <Loader message="Cargando estudiantes y notas..." />
      ) : (
        <div className="relative flex-1 min-h-[300px]">
          <DataTable
            data={students}
            columns={tableColumns}
            fileName="Export_Notas_Enfasis"
            loaderMessage="Cargando estudiantes..."
          />
        </div>
      )}

      <div className="flex justify-end">
        <div className="w-36">
          <SimpleButton
            type="button"
            onClick={onClose}
            msj="Cerrar"
            icon="X"
            bg="bg-gray-200"
            text="text-gray-700"
            noRounded={false}
          />
        </div>
      </div>
    </div>
  );
};

export default RegisterStudentEnfasisRecords;