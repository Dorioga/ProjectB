import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import DataTable from "../../components/atoms/DataTable";
import SimpleButton from "../../components/atoms/SimpleButton";
import Modal from "../../components/atoms/Modal";
import RegisterDBA from "../../components/molecules/RegisterDBA";
import ProfileDBA from "../../components/molecules/ProfileDBA";
import Loader from "../../components/atoms/Loader";
import useAuth from "../../lib/hooks/useAuth";
import useData from "../../lib/hooks/useData";
import { useNotify } from "../../lib/hooks/useNotify";

const ManageDBA = () => {
  const { idInstitution } = useAuth();
  const { getPurposes } = useData();
  const notify = useNotify();
  const notifyRef = useRef(notify);
  useEffect(() => {
    notifyRef.current = notify;
  });

  // ── Tabla ────────────────────────────────────────────────────────────────
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // ── Modal ProfileDBA ─────────────────────────────────────────────────────
  const [profilePurpose, setProfilePurpose] = useState(null); // { id, nombre }

  // ── Cargar propósitos ────────────────────────────────────────────────────
  const loadPurposes = useCallback(async () => {
    if (!idInstitution || !getPurposes) return;
    setIsLoading(true);
    try {
      const res = await getPurposes(idInstitution);
      setTableData(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("ManageDBA - Error cargando propósitos:", err);
      notifyRef.current.error("Error al cargar los propósitos.");
      setTableData([]);
    } finally {
      setIsLoading(false);
    }
  }, [idInstitution, getPurposes]);

  useEffect(() => {
    loadPurposes();
  }, [loadPurposes]);

  // ── Columnas de la tabla ─────────────────────────────────────────────────
  const columns = useMemo(
    () => [
      {
        accessorKey: "id_proposito",
        header: "ID",
        meta: { hideOnLG: true },
      },
      {
        accessorKey: "nombre_proposito",
        header: "Propósito",
        accessorFn: (row) =>
          row.nombre_proposito ?? row.nombre ?? String(row.id_proposito ?? ""),
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => {
          const purpose = row.original;
          const id = purpose.id_proposito ?? purpose.id;
          const nombre =
            purpose.nombre_proposito ?? purpose.nombre ?? `Propósito ${id}`;
          return (
            <SimpleButton
              msj="Ver DBA"
              icon="Eye"
              bg="bg-secondary"
              noRounded={true}
              text="text-surface"
              onClick={() => setProfilePurpose({ id, nombre })}
            />
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="p-6 h-full gap-4 flex flex-col">
      {/* ── Encabezado ─────────────────────────────────────────────────────── */}
      <div className="w-full grid gap-2 grid-cols-1 lg:grid-cols-5 justify-between items-center bg-primary text-surface p-3 rounded-lg">
        <div className="lg:col-span-3 xl:col-span-3 flex items-center">
          <h2 className="text-2xl font-bold">Gestión de DBA</h2>
        </div>
        <div className="grid grid-cols-2 col-span-2 gap-2">
          <SimpleButton
            type="button"
            onClick={() => setIsAddOpen(true)}
            msj="Registrar DBA"
            icon="Plus"
            bg="bg-secondary"
            text="text-surface"
          />
          <div />
        </div>
      </div>

      {/* ── Tabla de propósitos ───────────────────────────────────────────────── */}
      <div className="flex-1 mt-4">
        {isLoading ? (
          <Loader message="Cargando propósitos..." size={96} />
        ) : (
          <DataTable
            data={tableData}
            columns={columns}
            fileName="Export_Propositos"
          />
        )}
      </div>

      {/* ── Modal registrar DBA ───────────────────────────────────────────────── */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Registrar Derechos Básicos de Aprendizaje"
        size="4xl"
      >
        <RegisterDBA onClose={() => setIsAddOpen(false)} />
      </Modal>

      {/* ── Modal ProfileDBA ───────────────────────────────────────────────── */}
      <Modal
        isOpen={!!profilePurpose}
        onClose={() => {
          setProfilePurpose(null);
          loadPurposes();
        }}
        title="Derechos Básicos de Aprendizaje"
        size="4xl"
      >
        {profilePurpose && (
          <ProfileDBA
            purposeId={profilePurpose.id}
            purposeName={profilePurpose.nombre}
            onClose={() => {
              setProfilePurpose(null);
              loadPurposes();
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default ManageDBA;
