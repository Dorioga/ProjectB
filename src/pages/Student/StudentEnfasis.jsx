import { useState, useMemo, useEffect } from "react";
import DataTable from "../../components/atoms/DataTable";
import useAuth from "../../lib/hooks/useAuth";
import { useNotify } from "../../lib/hooks/useNotify";
import {
  getInstitutionEmphasisArea,
  getStudentEnfasis,
} from "../../services/enfasisService";

const StudentEnfasis = () => {
  const { idInstitution } = useAuth();
  const notify = useNotify();

  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [filters, setFilters] = useState({ sede: "", modalidad: "", area: "" });
  const [selectedAsignatura, setSelectedAsignatura] = useState("");

  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    if (!idInstitution) {
      setResults([]);
      return;
    }
    let mounted = true;
    setLoadingResults(true);
    getInstitutionEmphasisArea({ institution: Number(idInstitution) })
      .then((res) => {
        if (mounted) setResults(Array.isArray(res) ? res : []);
      })
      .catch((err) => {
        console.error(
          "StudentEnfasis - getInstitutionEmphasisArea error:",
          err,
        );
        notify.error(
          err?.message || "Error al cargar las asignaturas de énfasis.",
        );
        if (mounted) setResults([]);
      })
      .finally(() => {
        if (mounted) setLoadingResults(false);
      });
    return () => {
      mounted = false;
    };
  }, [idInstitution, notify]);

  const rowValue = (row, field) => {
    if (field === "sede") return row.nombre_sede ?? "";
    if (field === "modalidad") return row.name_modalidad ?? "";
    if (field === "area") return row.name_area_enfasis ?? "";
    return "";
  };

  const filterOptions = useMemo(() => {
    const fields = ["sede", "modalidad", "area"];
    const opts = {};
    for (const field of fields) {
      const values = (Array.isArray(results) ? results : [])
        .map((r) => String(rowValue(r, field)).trim())
        .filter(Boolean);
      opts[field] = Array.from(new Set(values)).sort((a, b) =>
        a.localeCompare(b, "es", { sensitivity: "base" }),
      );
    }
    return opts;
  }, [results]);

  const filteredAsignaturas = useMemo(() => {
    const list = Array.isArray(results) ? results : [];
    const active = Object.keys(filters).some(
      (k) => String(filters[k] ?? "").trim() !== "",
    );
    if (!active) return list;
    return list.filter((row) =>
      Object.keys(filters).every((field) => {
        const value = String(filters[field] ?? "").trim();
        if (!value) return true;
        return String(rowValue(row, field)).trim() === value;
      }),
    );
  }, [results, filters]);

  const handleFilter = (field) => (e) => {
    setFilters((prev) => ({ ...prev, [field]: e.target.value }));
  };

  useEffect(() => {
    if (!selectedAsignatura) return;
    const stillThere = filteredAsignaturas.some(
      (a) => String(a.id_asignatura_enfasis) === String(selectedAsignatura),
    );
    if (!stillThere) setSelectedAsignatura("");
  }, [filteredAsignaturas, selectedAsignatura]);

  useEffect(() => {
    if (!selectedAsignatura) {
      setStudents([]);
      return;
    }
    let mounted = true;
    setLoadingStudents(true);
    getStudentEnfasis(Number(selectedAsignatura))
      .then((res) => {
        if (mounted) setStudents(Array.isArray(res) ? res : []);
      })
      .catch((err) => {
        console.error("StudentEnfasis - getStudentEnfasis error:", err);
        notify.error(
          err?.message || "Error al cargar los estudiantes del énfasis.",
        );
        if (mounted) setStudents([]);
      })
      .finally(() => {
        if (mounted) setLoadingStudents(false);
      });
    return () => {
      mounted = false;
    };
  }, [selectedAsignatura, notify]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "nombre",
        header: "Nombre",
        accessorFn: (row) => row.nombre ?? row.concat_ws ?? "",
      },
      {
        accessorKey: "grado",
        header: "Grado",
        accessorFn: (row) => row.grado ?? "",
      },
    ],
    [],
  );

  return (
    <div className="relative flex-1 p-4 flex flex-col gap-4 min-h-0">
      <div className="bg-surface p-4 rounded-lg shadow grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div>
          <label className="">Sede</label>
          <select
            name="filter-sede"
            value={filters.sede}
            onChange={handleFilter("sede")}
            className="w-full p-2 border rounded bg-surface"
          >
            <option value="">Todas</option>
            {filterOptions.sede.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="">Modalidad</label>
          <select
            name="filter-modalidad"
            value={filters.modalidad}
            onChange={handleFilter("modalidad")}
            className="w-full p-2 border rounded bg-surface"
          >
            <option value="">Todas</option>
            {filterOptions.modalidad.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="">Área</label>
          <select
            name="filter-area"
            value={filters.area}
            onChange={handleFilter("area")}
            className="w-full p-2 border rounded bg-surface"
          >
            <option value="">Todas</option>
            {filterOptions.area.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="">Asignatura de énfasis</label>
          <select
            name="select-asignatura"
            value={selectedAsignatura}
            onChange={(e) => setSelectedAsignatura(e.target.value)}
            className="w-full p-2 border rounded bg-surface"
          >
            <option value="">
              {loadingResults
                ? "Cargando asignaturas..."
                : "Selecciona asignatura"}
            </option>
            {!loadingResults &&
              filteredAsignaturas.map((a) => (
                <option
                  key={a.id_asignatura_enfasis}
                  value={a.id_asignatura_enfasis}
                >
                  {a.name_asignatura_enfasis}
                </option>
              ))}
          </select>
        </div>
      </div>

      {!selectedAsignatura ? (
        <div className="text-center py-8 text-gray-500">
          Selecciona una asignatura de énfasis para ver sus estudiantes
        </div>
      ) : (
        <div className="relative flex-1 min-h-0">
          <DataTable
            key="student-enfasis-table"
            data={students || []}
            columns={columns}
            fileName="Export_Estudiantes_Enfasis"
            initialSorting={[{ id: "nombre_sede", desc: false }]}
            showDownloadButtons={false}
            loading={loadingStudents}
            loaderMessage="Cargando estudiantes de énfasis..."
          />
        </div>
      )}
    </div>
  );
};

export default StudentEnfasis;
