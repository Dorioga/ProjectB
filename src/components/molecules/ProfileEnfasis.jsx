import { useState, useEffect, useMemo, useCallback } from "react";
import SimpleButton from "../atoms/SimpleButton";
import SedeSelect from "../atoms/SedeSelect";
import JourneySelect from "../atoms/JourneySelect";
import Modal from "../atoms/Modal";
import DataTable from "../atoms/DataTable";
import ProfileTeacherEnfasis from "./ProfileTeacherEnfasis";
import useAuth from "../../lib/hooks/useAuth";
import useData from "../../lib/hooks/useData";
import { useNotify } from "../../lib/hooks/useNotify";
import {
  getModes,
  getAreasByMode,
  createEnfasisAsignatura,
  getInstitutionTeacherAsignatures,
} from "../../services/enfasisService";

const ProfileEnfasis = ({ onSave, onClose }) => {
  const { idSede: authIdSede, idInstitution } = useAuth();
  const { institutionSedes } = useData();
  const notify = useNotify();

  const [activeTab, setActiveTab] = useState("asignatura");

  const [modes, setModes] = useState([]);
  const [loadingModes, setLoadingModes] = useState(false);
  const [selectedMode, setSelectedMode] = useState("");

  const [areas, setAreas] = useState([]);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [selectedArea, setSelectedArea] = useState("");

  const [form, setForm] = useState({ name: "", intensidad: "" });

  const [selectedSede, setSelectedSede] = useState(() =>
    authIdSede ? String(authIdSede) : "",
  );
  const [selectedJornada, setSelectedJornada] = useState("");

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [teacherModalOpen, setTeacherModalOpen] = useState(false);
  const [teacherModalData, setTeacherModalData] = useState(null);

  const [teacherAssignments, setTeacherAssignments] = useState([]);
  const [teacherAssignmentsLoading, setTeacherAssignmentsLoading] =
    useState(false);
  const [teacherAssignFilters, setTeacherAssignFilters] = useState({
    sede: "",
    modalidad: "",
    area: "",
  });

  const fetchTeacherAssignments = useCallback(async () => {
    if (!idInstitution) {
      setTeacherAssignments([]);
      return;
    }
    setTeacherAssignmentsLoading(true);
    try {
      const res = await getInstitutionTeacherAsignatures({
        institution: Number(idInstitution),
      });
      setTeacherAssignments(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(
        "ProfileEnfasis - getInstitutionTeacherAsignatures error:",
        err,
      );
      notify.error(
        err?.message || "Error al cargar las asignaciones de docentes.",
      );
      setTeacherAssignments([]);
    } finally {
      setTeacherAssignmentsLoading(false);
    }
  }, [idInstitution, notify]);

  useEffect(() => {
    fetchTeacherAssignments();
  }, [fetchTeacherAssignments]);

  const teacherAssignRowValue = (row, field) => {
    if (field === "sede") return row.nombre_sede ?? "";
    if (field === "modalidad") return row.name_modalidad ?? "";
    if (field === "area") return row.name_area_enfasis ?? "";
    return "";
  };

  const teacherAssignFilterOptions = useMemo(() => {
    const fields = ["sede", "modalidad", "area"];
    const opts = {};
    for (const field of fields) {
      const values = (
        Array.isArray(teacherAssignments) ? teacherAssignments : []
      )
        .map((r) => String(teacherAssignRowValue(r, field)).trim())
        .filter(Boolean);
      opts[field] = Array.from(new Set(values)).sort((a, b) =>
        a.localeCompare(b, "es", { sensitivity: "base" }),
      );
    }
    return opts;
  }, [teacherAssignments]);

  const filteredTeacherAssignments = useMemo(() => {
    const list = Array.isArray(teacherAssignments) ? teacherAssignments : [];
    const active = Object.keys(teacherAssignFilters).some(
      (k) => String(teacherAssignFilters[k] ?? "").trim() !== "",
    );
    if (!active) return list;
    return list.filter((row) =>
      Object.keys(teacherAssignFilters).every((field) => {
        const value = String(teacherAssignFilters[field] ?? "").trim();
        if (!value) return true;
        return String(teacherAssignRowValue(row, field)).trim() === value;
      }),
    );
  }, [teacherAssignments, teacherAssignFilters]);

  const handleTeacherAssignFilter = (field) => (e) => {
    setTeacherAssignFilters((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const resetTeacherAssignFilters = () =>
    setTeacherAssignFilters({ sede: "", modalidad: "", area: "" });

  const teacherAssignColumns = useMemo(
    () => [
      {
        accessorKey: "docente",
        header: "Docente",
        accessorFn: (row) => row.docente ?? "",
      },
      {
        accessorKey: "nombre_sede",
        header: "Sede",
        accessorFn: (row) => row.nombre_sede ?? "",
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
        accessorKey: "name_asignatura_enfasis",
        header: "Asignatura",
        accessorFn: (row) => row.name_asignatura_enfasis ?? "",
      },
      {
        accessorKey: "nombre_jornada",
        header: "Jornada",
        accessorFn: (row) => row.nombre_jornada ?? "",
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="w-full h-full flex items-center justify-center">
            <SimpleButton
              className="h-full"
              onClick={() => {
                setTeacherModalData(row.original);
                setTeacherModalOpen(true);
              }}
              icon="Pencil"
              bg="bg-secondary"
              text="text-surface"
              noRounded={true}
              msjtooltip="Editar"
            />
          </div>
        ),
      },
    ],
    [],
  );

  useEffect(() => {
    let mounted = true;
    setLoadingModes(true);
    getModes()
      .then((res) => {
        if (mounted) setModes(Array.isArray(res) ? res : []);
      })
      .catch((err) => {
        console.error("ProfileEnfasis - getModes error:", err);
        if (mounted) setModes([]);
      })
      .finally(() => {
        if (mounted) setLoadingModes(false);
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSelectedArea("");
    setAreas([]);
    if (!selectedMode) return;
    let mounted = true;
    setLoadingAreas(true);
    getAreasByMode(selectedMode)
      .then((res) => {
        if (mounted) setAreas(Array.isArray(res) ? res : []);
      })
      .catch((err) => {
        console.error("ProfileEnfasis - getAreasByMode error:", err);
        if (mounted) setAreas([]);
      })
      .finally(() => {
        if (mounted) setLoadingAreas(false);
      });
    return () => {
      mounted = false;
    };
  }, [selectedMode]);

  useEffect(() => {
    setSelectedJornada("");
  }, [selectedSede]);

  const sedeWorkday = useMemo(() => {
    if (!selectedSede || !Array.isArray(institutionSedes)) return null;
    const sede = institutionSedes.find(
      (s) => String(s?.id) === String(selectedSede),
    );
    return sede?.fk_workday ? String(sede.fk_workday) : null;
  }, [selectedSede, institutionSedes]);

  useEffect(() => {
    if (!sedeWorkday || sedeWorkday === "3") return;
    setSelectedJornada(sedeWorkday);
  }, [sedeWorkday]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev || !prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const validateForm = (showErrors = true) => {
    const next = {};
    if (!String(form.name ?? "").trim()) {
      next.name = "El nombre de la asignatura es obligatorio.";
    }
    if (!selectedMode) next.mode = "Selecciona una modalidad.";
    if (!selectedArea) next.area = "Selecciona un área.";
    if (!selectedSede) next.sede = "Selecciona una sede.";
    if (!selectedJornada) next.jornada = "Selecciona una jornada.";
    if (showErrors) setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm(true)) return;
    setSaving(true);
    try {
      await createEnfasisAsignatura({
        name_asignatura_enfasis: String(form.name).trim(),
        fk_area_enfasis: Number(selectedArea),
        intensidad_horaria: form.intensidad ? Number(form.intensidad) : null,
        fk_workday: Number(selectedJornada),
        fk_sede: Number(selectedSede),
      });
      notify.success("Asignatura de énfasis registrada exitosamente.");
      if (typeof onSave === "function") onSave();
    } catch (err) {
      console.error("ProfileEnfasis - createEnfasisAsignatura error:", err);
      notify.error(err?.message || "Error al registrar la asignatura.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex gap-0 border-b border-gray-300">
        <button
          type="button"
          onClick={() => setActiveTab("asignatura")}
          className={`px-5 py-2 text-sm font-semibold transition-colors rounded-tl rounded-tr cursor-pointer ${
            activeTab === "asignatura"
              ? "bg-primary text-white border-2 border-primary"
              : "bg-secondary text-primary hover:bg-gray-100"
          }`}
        >
          Asignatura Énfasis
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("docente")}
          className={`px-5 py-2 text-sm font-semibold transition-colors rounded-tl rounded-tr cursor-pointer ${
            activeTab === "docente"
              ? "bg-primary text-white border-2 border-primary"
              : "bg-secondary text-primary hover:bg-gray-100"
          }`}
        >
          Docente a Enfasis
        </button>
      </div>

      {activeTab === "asignatura" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold">Modalidad</label>
              <select
                name="mode"
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                className="w-full p-2 border rounded bg-surface"
              >
                <option value="">
                  {loadingModes
                    ? "Cargando modalidades..."
                    : "Selecciona modalidad"}
                </option>
                {!loadingModes &&
                  modes.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
              </select>
              {errors.mode && (
                <div className="text-sm text-red-600 mt-1">{errors.mode}</div>
              )}
            </div>

            <div>
              <label className="font-semibold">Área</label>
              <select
                name="area"
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                disabled={!selectedMode}
                className="w-full p-2 border rounded bg-surface"
              >
                <option value="">
                  {loadingAreas ? "Cargando áreas..." : "Selecciona un área"}
                </option>
                {!loadingAreas &&
                  areas.map((a) => (
                    <option key={a.id_area_enfasis} value={a.id_area_enfasis}>
                      {a.name_area_enfasis ??
                        a.name ??
                        a.nombre ??
                        a.id_area_enfasis}
                    </option>
                  ))}
              </select>
              {errors.area && (
                <div className="text-sm text-red-600 mt-1">{errors.area}</div>
              )}
            </div>

            <div>
              <label className="font-semibold">Nombre asignatura</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full p-2 border rounded bg-surface"
              />
              {errors.name && (
                <div className="text-sm text-red-600 mt-1">{errors.name}</div>
              )}
            </div>

            <div>
              <label className="font-semibold">Intensidad horaria</label>
              <input
                name="intensidad"
                type="number"
                min="0"
                value={form.intensidad}
                onChange={handleChange}
                className="w-full p-2 border rounded bg-surface"
              />
            </div>

            <div>
              <SedeSelect
                labelClassName="font-semibold"
                value={selectedSede}
                onChange={(e) => setSelectedSede(e.target.value)}
              />
              {errors.sede && (
                <div className="text-sm text-red-600 mt-1">{errors.sede}</div>
              )}
            </div>

            <div>
              <JourneySelect
                value={selectedJornada}
                onChange={(e) => setSelectedJornada(e.target.value)}
                filterValue={sedeWorkday}
                className="w-full p-2 border rounded bg-surface "
                labelClassName="font-semibold"
              />
              {errors.jornada && (
                <div className="text-sm text-red-600 mt-1">
                  {errors.jornada}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <div className="w-36">
              <SimpleButton
                type="button"
                onClick={onClose}
                msj="Cancelar"
                icon="X"
                bg="bg-gray-200"
                text="text-gray-700"
                noRounded={false}
              />
            </div>
            <div className="w-44">
              <SimpleButton
                onClick={handleSubmit}
                msj={saving ? "Registrando..." : "Registrar asignatura"}
                icon={saving ? "Loader" : "Save"}
                bg="bg-primary"
                text="text-surface"
                disabled={saving}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-end">
            <div className="w-56">
              <SimpleButton
                type="button"
                onClick={() => {
                  setTeacherModalData(null);
                  setTeacherModalOpen(true);
                }}
                msj="Agregar docente enfasis"
                icon="Plus"
                bg="bg-secondary"
                text="text-surface"
                noRounded={false}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="">Sede</label>
              <select
                name="filter-sede"
                value={teacherAssignFilters.sede}
                onChange={handleTeacherAssignFilter("sede")}
                className="w-full p-2 border rounded bg-surface"
              >
                <option value="">Todas</option>
                {teacherAssignFilterOptions.sede.map((v) => (
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
                value={teacherAssignFilters.modalidad}
                onChange={handleTeacherAssignFilter("modalidad")}
                className="w-full p-2 border rounded bg-surface"
              >
                <option value="">Todas</option>
                {teacherAssignFilterOptions.modalidad.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="">Área énfasis</label>
              <select
                name="filter-area"
                value={teacherAssignFilters.area}
                onChange={handleTeacherAssignFilter("area")}
                className="w-full p-2 border rounded bg-surface"
              >
                <option value="">Todas</option>
                {teacherAssignFilterOptions.area.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative flex-1 min-h-[200px]">
            <DataTable
              data={filteredTeacherAssignments}
              columns={teacherAssignColumns}
              fileName="Export_Docentes_Enfasis"
              initialSorting={[{ id: "docente", desc: false }]}
              loading={teacherAssignmentsLoading}
              loaderMessage="Cargando asignaciones de docentes..."
            />
          </div>

          <Modal
            isOpen={teacherModalOpen}
            onClose={() => setTeacherModalOpen(false)}
            title="Asignar docente a énfasis"
            size="5xl"
          >
            <ProfileTeacherEnfasis
              isOpen={teacherModalOpen}
              onClose={() => setTeacherModalOpen(false)}
              onSaved={fetchTeacherAssignments}
              initialData={teacherModalData}
            />
          </Modal>
        </>
      )}
    </div>
  );
};

export default ProfileEnfasis;
