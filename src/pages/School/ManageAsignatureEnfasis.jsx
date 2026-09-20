import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import Modal from "../../components/atoms/Modal";
import SimpleButton from "../../components/atoms/SimpleButton";
import DataTable from "../../components/atoms/DataTable";
import Loader from "../../components/atoms/Loader";
import PeriodSelector from "../../components/atoms/PeriodSelector";
import ProfileEnfasis from "../../components/molecules/ProfileEnfasis";
import ProfileEnfasisEdit from "../../components/molecules/ProfileEnfasisEdit";
import ProfileNotaEnfasisEdit from "../../components/molecules/ProfileNotaEnfasisEdit";
import ProfileStudentEnfasis from "../../components/molecules/ProfileStudentEnfasis";
import RegisterRecords from "../GradeRecords/RegisterRecords";
import RegisterStudentEnfasisRecords from "./RegisterStudentEnfasisRecords";
import useAuth from "../../lib/hooks/useAuth";
import { useNotify } from "../../lib/hooks/useNotify";
import {
  getInstitutionEmphasisArea,
  getAsignatureEnfasis,
  getTeacherAsignatures,
  getTeacherNotesEnfasis,
} from "../../services/enfasisService";

const ManageAsignatureEnfasis = forwardRef(({ hideToolbar = false }, ref) => {
  const { idInstitution, rol, idDocente } = useAuth();
  const notify = useNotify();

  const isDocente = useMemo(
    () => String(rol).toLowerCase() === "docente" || String(rol) === "7",
    [rol],
  );

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isStudentEnfasisOpen, setIsStudentEnfasisOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isAssignNotesOpen, setIsAssignNotesOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ sede: "", modalidad: "", area: "" });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [editModalidadId, setEditModalidadId] = useState("");

  const [teacherAsignatures, setTeacherAsignatures] = useState([]);
  const [teacherAsignaturesLoading, setTeacherAsignaturesLoading] =
    useState(false);
  const [teacherAsignature, setTeacherAsignature] = useState("");
  const [teacherPeriod, setTeacherPeriod] = useState("");
  const [teacherNotes, setTeacherNotes] = useState([]);
  const [teacherNotesLoading, setTeacherNotesLoading] = useState(false);
  const [noteEditOpen, setNoteEditOpen] = useState(false);
  const [noteEditData, setNoteEditData] = useState(null);

  useImperativeHandle(ref, () => ({
    openRegister: () => setIsRegisterOpen(true),
    openStudentEnfasis: () => setIsStudentEnfasisOpen(true),
  }));

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
      console.error(
        "ManageAsignatureEnfasis - getInstitutionEmphasisArea error:",
        err,
      );
      notify.error(
        err?.message || "Error al cargar las asignaturas de énfasis.",
      );
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [idInstitution, notify]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!isDocente || !idDocente) {
      setTeacherAsignatures([]);
      return;
    }
    let mounted = true;
    setTeacherAsignaturesLoading(true);
    getTeacherAsignatures(idDocente)
      .then((res) => {
        if (mounted) setTeacherAsignatures(Array.isArray(res) ? res : []);
      })
      .catch(() => {
        if (mounted) setTeacherAsignatures([]);
      })
      .finally(() => {
        if (mounted) setTeacherAsignaturesLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [isDocente, idDocente]);

  const fetchTeacherNotes = useCallback(async () => {
    if (!isDocente || !idDocente || !teacherAsignature || !teacherPeriod) {
      setTeacherNotes([]);
      return;
    }
    setTeacherNotesLoading(true);
    try {
      const res = await getTeacherNotesEnfasis({
        fk_teacher: Number(idDocente),
        fk_asignatura_enfasis: Number(teacherAsignature),
        fk_period: Number(teacherPeriod),
      });
      setTeacherNotes(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(
        "ManageAsignatureEnfasis - getTeacherNotesEnfasis error:",
        err,
      );
      notify.error(err?.message || "Error al cargar las notas.");
      setTeacherNotes([]);
    } finally {
      setTeacherNotesLoading(false);
    }
  }, [isDocente, idDocente, teacherAsignature, teacherPeriod, notify]);

  useEffect(() => {
    fetchTeacherNotes();
  }, [fetchTeacherNotes]);

  const teacherNotesColumns = useMemo(
    () => [
      {
        accessorKey: "name_nota_asignatura_enfasis",
        header: "Nota",
        accessorFn: (row) => row.name_nota_asignatura_enfasis ?? "",
      },
      {
        accessorKey: "state_nota_asignatura_enfasis",
        header: "Estado",
        accessorFn: (row) => row.state_nota_asignatura_enfasis ?? "",
        meta: {
          cellClassName: (row) =>
            String(row.state_nota_asignatura_enfasis ?? "").toLowerCase() ===
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
      {
        accessorKey: "porcentaje_nota_asignatura_enfasis",
        header: "Porcentaje",
        accessorFn: (row) => row.porcentaje_nota_asignatura_enfasis ?? "",
      },
      {
        accessorKey: "logro_nota_asignatura_enfasis",
        header: "Logro",
        accessorFn: (row) => row.logro_nota_asignatura_enfasis ?? "",
      },
      {
        accessorKey: "name_asignatura_enfasis",
        header: "Asignatura",
        accessorFn: (row) => row.name_asignatura_enfasis ?? "",
      },
      {
        accessorKey: "nombre_periodo",
        header: "Período",
        accessorFn: (row) => row.nombre_periodo ?? "",
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="w-full h-full flex items-center justify-center">
            <SimpleButton
              className="h-full"
              onClick={() => {
                setNoteEditData(row.original);
                setNoteEditOpen(true);
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

  const resetFilters = () => setFilters({ sede: "", modalidad: "", area: "" });

  const handleEdit = useCallback(
    async (row) => {
      const id = row?.id_asignatura_enfasis ?? row?.id ?? null;
      if (!id) {
        notify.error("No se pudo identificar la asignatura.");
        return;
      }
      setEditLoading(true);
      setEditingData(null);
      try {
        const data = await getAsignatureEnfasis(id);
        if (!data) {
          notify.error("No se encontraron datos de la asignatura.");
          return;
        }
        setEditingData(data);
        setEditModalidadId(row?.id_modalidad ?? "");
        setIsEditOpen(true);
      } catch (err) {
        console.error(
          "ManageAsignatureEnfasis - getAsignatureEnfasis error:",
          err,
        );
        notify.error(err?.message || "Error al cargar la asignatura.");
      } finally {
        setEditLoading(false);
      }
    },
    [notify],
  );

  const closeEdit = useCallback(() => {
    setIsEditOpen(false);
    setEditingData(null);
    setEditModalidadId("");
  }, []);

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
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="w-full h-full flex items-center justify-center">
            <SimpleButton
              className="h-full"
              onClick={() => handleEdit(row.original)}
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
    [handleEdit],
  );

  return (
    <>
      {!hideToolbar && (
        <div
          id="tour-me-add-btn"
          className="flex flex-wrap gap-2 mt-2"
        >
        {isDocente ? (
          <>
            <div className="w-48">
              <SimpleButton
                onClick={() => setIsNotesOpen(true)}
                msj="Registrar notas"
                icon="Save"
                bg="bg-secondary"
                text="text-surface"
                noRounded={false}
              />
            </div>
            <div className="w-48">
              <SimpleButton
                onClick={() => setIsAssignNotesOpen(true)}
                msj="Asignar notas"
                icon="ClipboardList"
                bg="bg-secondary"
                text="text-surface"
                noRounded={false}
              />
            </div>
          </>
        ) : (
          <>
            <div className="w-48">
              <SimpleButton
                onClick={() => setIsRegisterOpen(true)}
                msj="Registrar Enfasis"
                icon="Plus"
                bg="bg-secondary"
                text="text-surface"
                noRounded={false}
              />
            </div>
            <div className="w-48">
              <SimpleButton
                onClick={() => setIsStudentEnfasisOpen(true)}
                msj="Registrar estudiantes"
                icon="UserPlus"
                bg="bg-secondary"
                text="text-surface"
                noRounded={false}
              />
            </div>
          </>
        )}
        </div>
      )}

      {isDocente ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 max-w-2xl">
            <div>
              <label className="">Asignatura énfasis</label>
              <select
                name="teacher-asignatura"
                value={teacherAsignature}
                onChange={(e) => {
                  setTeacherAsignature(e.target.value);
                  setTeacherNotes([]);
                }}
                className="w-full p-2 border rounded bg-surface"
              >
                <option value="">
                  {teacherAsignaturesLoading
                    ? "Cargando asignaturas..."
                    : "Selecciona asignatura"}
                </option>
                {!teacherAsignaturesLoading &&
                  teacherAsignatures.map((a) => (
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
                value={teacherPeriod}
                onChange={(e) => {
                  setTeacherPeriod(e.target.value);
                  setTeacherNotes([]);
                }}
                className="w-full p-2 border rounded bg-surface"
                autoLoad={true}
              />
            </div>
          </div>

          <div id="tour-me-table" className="relative flex-1 ">
            <DataTable
              data={teacherNotes}
              columns={teacherNotesColumns}
              fileName="Export_Notas_Enfasis"
              initialSorting={[
                { id: "name_nota_asignatura_enfasis", desc: false },
              ]}
              loading={teacherNotesLoading}
              loaderMessage="Cargando notas de énfasis..."
            />
          </div>
        </>
      ) : (
        <>
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
        </>
      )}

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

      <Modal
        isOpen={isStudentEnfasisOpen}
        onClose={() => setIsStudentEnfasisOpen(false)}
        title="Registrar estudiantes a énfasis"
        size="7xl"
      >
        <ProfileStudentEnfasis
          onSave={() => setIsStudentEnfasisOpen(false)}
          onClose={() => setIsStudentEnfasisOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
        title="Registrar notas de énfasis"
        size="7xl"
      >
        <RegisterRecords modo="enfasis" onClose={() => setIsNotesOpen(false)} />
      </Modal>

      <Modal
        isOpen={isAssignNotesOpen}
        onClose={() => setIsAssignNotesOpen(false)}
        title="Asignar notas de énfasis"
        size="7xl"
      >
        <RegisterStudentEnfasisRecords
          onClose={() => setIsAssignNotesOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={noteEditOpen}
        onClose={() => {
          setNoteEditOpen(false);
          setNoteEditData(null);
        }}
        title="Editar nota de énfasis"
        size="5xl"
      >
        {noteEditData && (
          <ProfileNotaEnfasisEdit
            initialData={noteEditData}
            asignaturas={teacherAsignatures}
            onSave={() => {
              setNoteEditOpen(false);
              setNoteEditData(null);
              fetchTeacherNotes();
            }}
            onClose={() => {
              setNoteEditOpen(false);
              setNoteEditData(null);
            }}
          />
        )}
      </Modal>

      <Modal
        isOpen={isEditOpen}
        onClose={closeEdit}
        title="Editar asignatura de énfasis"
        size="5xl"
      >
        {editLoading ? (
          <Loader message="Cargando asignatura..." />
        ) : editingData ? (
          <ProfileEnfasisEdit
            initialData={editingData}
            modalidadId={editModalidadId}
            onSave={() => {
              closeEdit();
              fetchData();
              resetFilters();
            }}
            onClose={closeEdit}
          />
        ) : null}
      </Modal>
    </>
  );
});

ManageAsignatureEnfasis.displayName = "ManageAsignatureEnfasis";

export default ManageAsignatureEnfasis;