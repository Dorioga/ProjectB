import React, { useState, useEffect, useMemo, useCallback } from "react";
import DataTable from "../../components/atoms/DataTable";
import SimpleButton from "../../components/atoms/SimpleButton";
import Modal from "../../components/atoms/Modal";
import ProfileSchool from "./ProfileSchool";
import Loader from "../../components/atoms/Loader";
import useSchool from "../../lib/hooks/useSchool";
import { alertsResponse } from "../../services/DataExamples/alertsResponse";
import tourManageSchools from "../../tour/tourManageSchools";

const ManageSchools = () => {
  const { getInstitution, getDataSchool } = useSchool();
  const [institutions, setInstitutions] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [selectedInstitutionData, setSelectedInstitutionData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  // Indica si abrimos el modal en modo edición (true) o solo en vista (false)
  const [openAsEdit, setOpenAsEdit] = useState(false);

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

  const handleView = async (institution) => {
    // Abrir modal en modo vista
    setOpenAsEdit(false);
    setSelectedInstitution(institution);
    setSelectedInstitutionData(null);
    setProfileError(null);
    setIsEditOpen(true);
    setProfileLoading(true);
    try {
      const id = institution?.id_institution || institution?.id;
      const payload = { idInstitution: id };
      const res = await getDataSchool(payload);

      // Respuesta: { code, data: [ { ... } ], status }
      const d =
        res && res.data && Array.isArray(res.data)
          ? res.data[0]
          : Array.isArray(res)
            ? res[0]
            : res;
      setSelectedInstitutionData(d ?? institution);
    } catch (err) {
      console.error("Error loading institution data:", err);
      setProfileError(err?.message || String(err));
      setSelectedInstitutionData(institution);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleEdit = async (institution) => {
    // Abrir modal y forzar que se abra en modo edición
    // Primero cargar la vista (handleView) y solo después forzar modo edición
    await handleView(institution);
    setOpenAsEdit(true);
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
          <div className="w-full h-full flex items-stretch gap-2 p-2">
            <SimpleButton
              className="h-full"
              onClick={() => handleView(row.original)}
              icon="UserSearch"
              bg="bg-secondary"
              text="text-surface"
              noRounded={false}
              msjtooltip="Ver"
            />
            <SimpleButton
              className="h-full"
              onClick={() => handleEdit(row.original)}
              icon="Pencil"
              bg="bg-secondary"
              text="text-surface"
              noRounded={false}
              msjtooltip="Editar"
            />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className=" p-6  h-full gap-4 flex flex-col">
      <div
        id="tour-header"
        className="w-full flex justify-between items-center bg-primary text-surface p-3 rounded-t-lg"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Datos de Instituciones</h2>
          <SimpleButton
            type="button"
            onClick={tourManageSchools}
            icon="HelpCircle"
            msjtooltip="Iniciar tutorial"
            noRounded={false}
            bg="bg-info"
            text="text-surface"
            className="w-auto px-3 py-1.5"
          />
        </div>
        <div id="tour-add-btn" className="w-56">
          <SimpleButton
            type="button"
            onClick={() => setIsAddOpen(true)}
            msj="Agregar institución"
            icon="Plus"
            bg="bg-secondary"
            text="text-surface"
          />
        </div>
      </div>

      <div id="tour-table" className="relative flex-1">
        <DataTable
          key="institutions-table"
          data={tableData || []}
          columns={columns}
          fileName="Export_Institutions"
          mode={"School"}
          showDownloadButtons={false}
          loading={isFetching}
          loaderMessage="Cargando instituciones..."
        />

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
          <ProfileSchool
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
          <div className="relative">
            {profileLoading && <Loader message="Cargando datos..." size={56} />}

            {profileError && (
              <div className="mb-3 text-sm text-red-600">
                Error cargando institución: {profileError}
              </div>
            )}

            <ProfileSchool
              mode="update"
              initialData={selectedInstitutionData ?? selectedInstitution}
              initialEditing={openAsEdit}
              schoolId={
                selectedInstitutionData?.id_institution ||
                selectedInstitutionData?.id ||
                selectedInstitution?.id_institution ||
                selectedInstitution?.id
              }
              onSuccess={() => {
                setIsEditOpen(false);
                setOpenAsEdit(false);
                fetchInstitutions();
              }}
            />
          </div>
        </Modal>

        <div id="tour-records-count" className="mt-3">
          <div className="text-sm text-gray-700">
            Registros: <strong>{institutions.length}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageSchools;
