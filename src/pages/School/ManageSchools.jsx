import React, { useState, useEffect, useMemo, useCallback } from "react";
import DataTable from "../../components/atoms/DataTable";
import SimpleButton from "../../components/atoms/SimpleButton";
import Modal from "../../components/atoms/Modal";
import ManageSchool from "./ManageSchool";
import useSchool from "../../lib/hooks/useSchool";
import { alertsResponse } from "../../services/DataExamples/alertsResponse";

const ManageSchools = () => {
  const { getInstitution } = useSchool();
  const [institutions, setInstitutions] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState(null);

  const fetchInstitutions = useCallback(async () => {
    setIsFetching(true);
    setFetchError(null);
    try {
      const res = await getInstitution();
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      setInstitutions(data);
      setTableData(data);
    } catch (err) {
      console.error("Error fetching institutions:", err);
      setFetchError(err?.message || String(err));
    } finally {
      setIsFetching(false);
    }
  }, [getInstitution]);

  useEffect(() => {
    fetchInstitutions();
  }, [fetchInstitutions]);

  const handleView = (institution) => {
    setSelectedInstitution(institution);
    setIsEditOpen(true);
  };

  const handleEdit = (institution) => {
    setSelectedInstitution(institution);
    setIsEditOpen(true);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id_institution",
        header: "ID",
      },
      {
        accessorKey: "nombre_institution",
        header: "Nombre",
      },

      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="w-full h-full flex ">
            <SimpleButton
              onClick={() => handleView(row.original)}
              icon="UserSearch"
              bg="bg-primary"
              text="text-surface"
              noRounded={true}
              msjtooltip="Ver"
            />
            <SimpleButton
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
    [],
  );

  return (
    <div className="border p-6 rounded bg-bg h-full gap-4 flex flex-col">
      <div className="w-full flex justify-between items-center bg-primary text-surface p-3 rounded-t-lg">
        <h2 className="text-2xl font-bold">Datos de Instituciones</h2>
        <div className="w-56">
          <SimpleButton
            type="button"
            onClick={() => setIsAddOpen(true)}
            msj="Agregar institución"
            icon="Plus"
            bg="bg-accent"
            text="text-surface"
          />
        </div>
      </div>

      <div className="relative flex-1">
        <DataTable
          key="institutions-table"
          data={tableData || []}
          columns={columns}
          fileName="Export_Institutions"
          mode={"School"}
          showDownloadButtons={false}
        />

        {isFetching && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/60 z-10">
            <div className="text-center py-8 bg-transparent">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
              <div className="text-sm font-medium text-primary">
                Cargando instituciones...
              </div>
            </div>
          </div>
        )}

        {fetchError && (
          <div className="mt-4 text-center text-red-600">
            Error: {fetchError}
          </div>
        )}

        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Agregar institución"
          size="4xl"
        >
          <ManageSchool
            mode="register"
            onSuccess={() => {
              setIsAddOpen(false);
              fetchInstitutions();
            }}
          />
        </Modal>

        <Modal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          title="Editar institución"
          size="4xl"
        >
          <ManageSchool
            mode="update"
            initialData={selectedInstitution}
            schoolId={
              selectedInstitution?.id_institution || selectedInstitution?.id
            }
            onSuccess={() => {
              setIsEditOpen(false);
              fetchInstitutions();
            }}
          />
        </Modal>

        <div className="mt-3">
          <div className="text-sm text-gray-700">
            Registros: <strong>{institutions.length}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageSchools;
