import { useState, useMemo, useEffect, useCallback } from "react";
import Modal from "../../components/atoms/Modal";
import SimpleButton from "../../components/atoms/SimpleButton";
import DataTable from "../../components/atoms/DataTable";
import ProfileEnfasis from "../../components/molecules/ProfileEnfasis";
import useAuth from "../../lib/hooks/useAuth";
import { useNotify } from "../../lib/hooks/useNotify";
import { getInstitutionEmphasisArea } from "../../services/enfasisService";

const ManageEnfasis = () => {
  const { idInstitution } = useAuth();
  const notify = useNotify();

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ sede: "", modalidad: "", area: "" });

  const fetchData = useCallback(async () => {
    if (!idInstitution) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await getInstitutionEmphasisArea({
        institution: Number(idInstitution),
      });
      setResults(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("ManageEnfasis - getInstitutionEmphasisArea error:", err);
      notify.error(err?.message || "Error al cargar las asignaturas de énfasis.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [idInstitution, notify]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const filteredResults = useMemo(() => {
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

  const resetFilters = () =>
    setFilters({ sede: "", modalidad: "", area: "" });

  const columns = useMemo(
    () => [
      {
        accessorKey: "name_asignatura_enfasis",
        header: "Asignatura",
        accessorFn: (row) => row.name_asignatura_enfasis ?? "",
      },
      {
        accessorKey: "name_area_enfasis",
        header: "Área",
        accessorFn: (row) => row.name_area_enfasis ?? "",
      },
      {
        accessorKey: "name_modalidad",
        header: "Modalidad",
        accessorFn: (row) => row.name_modalidad ?? "",
      },
      {
        accessorKey: "intensidad_horaria",
        header: "Intensidad",
        accessorFn: (row) => row.intensidad_horaria ?? "",
      },
      {
        accessorKey: "nombre_jornada",
        header: "Jornada",
        accessorFn: (row) => row.nombre_jornada ?? "",
        meta: { hideOnLG: true },
      },
      {
        accessorKey: "nombre_sede",
        header: "Sede",
        accessorFn: (row) => row.nombre_sede ?? "",
        meta: { hideOnLG: true },
      },
      {
        accessorKey: "state_asignatura_enfasis",
        header: "Estado",
        accessorFn: (row) => row.state_asignatura_enfasis ?? "",
        meta: {
          cellClassName: (row) =>
            String(row.state_asignatura_enfasis ?? "").toLowerCase() ===
            "inactivo"
              ? "bg-gray-100 text-gray-700"
              : "bg-green-100 text-green-700",
        },
        cell: (info) => {
          const label = info.getValue();
          return (
            <span className="px-2 py-1 block text-xs font-semibold">
              {label || "—"}
            </span>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="p-6 h-full gap-4 flex flex-col">
      <div
        id="tour-me-header"
        className="w-full grid gap-2 grid-cols-1 lg:grid-cols-5 xl:grid-cols-4 justify-between items-center bg-primary text-surface p-3 rounded-lg"
      >
        <div className="lg:col-span-3 xl:col-span-2 flex items-center">
          <h2 className="text-2xl font-bold">Gestión de Énfasis</h2>
        </div>
        <div
          id="tour-me-add-btn"
          className="grid grid-cols-2 col-span-2 xl:col-span-2 gap-2"
        >
          <SimpleButton
            onClick={() => setIsRegisterOpen(true)}
            msj="Registrar Enfasis"
            icon="Plus"
            bg="bg-secondary"
            text="text-surface"
            noRounded={false}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
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
      </div>

      <div id="tour-me-table" className="relative flex-1 ">
        <DataTable
          data={filteredResults}
          columns={columns}
          fileName="Export_Enfasis"
          initialSorting={[{ id: "name_asignatura_enfasis", desc: false }]}
          loading={loading}
          loaderMessage="Cargando asignaturas de énfasis..."
        />
      </div>

      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Registrar Enfasis"
        size="5xl"
      >
        <ProfileEnfasis
          onSave={() => {
            setIsRegisterOpen(false);
            fetchData();
            resetFilters();
          }}
          onClose={() => setIsRegisterOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default ManageEnfasis;