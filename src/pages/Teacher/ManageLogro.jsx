import { useState, useCallback } from "react";
import Modal from "../../components/atoms/Modal";
import DataTable from "../../components/atoms/DataTable";
import SimpleButton from "../../components/atoms/SimpleButton";
import ProfileLogro from "../../components/molecules/ProfileLogro";
import useTeacher from "../../lib/hooks/useTeacher";
import { useNotify } from "../../lib/hooks/useNotify";

const ManageLogro = () => {
  const { getLogroInstitution } = useTeacher();
  const notify = useNotify();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(
    async (payload) => {
      try {
        setLoading(true);
        const res = await getLogroInstitution(payload);
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        setResults(data);
        setIsModalOpen(false);
        notify.success("Resultados cargados");
      } catch (err) {
        console.error("ManageLogro - error:", err);
        notify.error(err?.message || "Error al consultar logros");
      } finally {
        setLoading(false);
      }
    },
    [getLogroInstitution, notify],
  );

  const columns = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "descripcion", header: "Descripción" },
    { accessorKey: "fk_tipo_logro", header: "Tipo logro" },
    { accessorKey: "fk_institucion", header: "Institución" },
  ];

  return (
    <div className="border p-6 rounded bg-bg h-full gap-4 flex flex-col">
      <div className="w-full flex justify-between items-center bg-primary text-surface p-3 rounded-t-lg">
        <h2 className="text-2xl font-bold">Gestión de Logros</h2>
        <div className="w-56">
          <SimpleButton
            onClick={() => setIsModalOpen(true)}
            msj="Buscar logros"
            icon="Search"
            bg="bg-accent"
            text="text-surface"
          />
        </div>
      </div>

      <div className="flex-1 mt-4">
        <DataTable
          data={results || []}
          columns={columns}
          fileName="Export_Logros"
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Buscar logros"
        size="3xl"
      >
        <ProfileLogro
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSearch}
        />
      </Modal>

      {loading && (
        <div className="mt-2 text-sm text-gray-600">Cargando resultados...</div>
      )}
    </div>
  );
};

export default ManageLogro;
