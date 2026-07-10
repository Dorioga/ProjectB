import { useState, useMemo, useEffect, useCallback } from "react";
import useSchool from "../../lib/hooks/useSchool";
import useAuth from "../../lib/hooks/useAuth";
import DataTable from "../../components/atoms/DataTable";
import SimpleButton from "../../components/atoms/SimpleButton";
import Modal from "../../components/atoms/Modal";
import RegisterStudent from "./RegisterStudent";
import UploadStudentExcel from "./UploadStudentExcel";
import UploadStudentPDF from "./UploadStudentPDF";
import StudentModal from "../../components/molecules/StudentModal";
import AuditBulkModal from "../../components/molecules/AuditBulkModal";
import DownloadProgressModal from "../../components/molecules/DownloadProgressModal";
import DownloadErrorModal from "../../components/molecules/DownloadErrorModal";
import useStudent from "../../lib/hooks/useStudent";
import { useNotify } from "../../lib/hooks/useNotify";
import tourManageStudent from "../../tour/tourManageStudent";
import { bulkDownloadDocuments } from "../../utils/bulkDownload";

const ManageStudent = () => {
  const { idInstitution, idSede, rol } = useAuth();
  const { fetchAllStudents } = useSchool();
  const { updateStudent, getStudent } = useStudent();
  const notify = useNotify();

  const [tableData, setTableData] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isBulkPdfOpen, setIsBulkPdfOpen] = useState(false);
  const [isBulkAuditOpen, setIsBulkAuditOpen] = useState(false);
  const [isBulkAuditUploadOpen, setIsBulkAuditUploadOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialEditing, setInitialEditing] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedSedeFilter, setSelectedSedeFilter] = useState("");
  const [selectedGradoFilter, setSelectedGradoFilter] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [downloadErrors, setDownloadErrors] = useState(null);
  const [downloadLog, setDownloadLog] = useState([]);

  // Cargar estudiantes - memoizado para evitar recreación en cada render
  const fetchStudentsData = useCallback(async () => {
    if (!idInstitution) {
      console.warn(
        "ManageStudent - idInstitution no disponible; abortando fetchAllStudents.",
      );
      setFetchError("No hay idInstitution — revisa la sesión de usuario.");
      return;
    }

    setIsFetching(true);
    setFetchError(null);

    try {
      const response = await fetchAllStudents({ institucion: idInstitution });
      const students = Array.isArray(response)
        ? response
        : (response?.data ?? []);
      setTableData(students);
    } catch (error) {
      console.error("Error al cargar estudiantes:", error);
      setFetchError(error?.message || String(error));
    } finally {
      setIsFetching(false);
    }
  }, [idInstitution, fetchAllStudents]);

  useEffect(() => {
    fetchStudentsData();
  }, [fetchStudentsData]);

  const sedes = useMemo(
    () => [...new Set(tableData.map((s) => s.nombre_sede).filter(Boolean))],
    [tableData],
  );

  const grados = useMemo(
    () => [...new Set(tableData.map((s) => s.nombre_grado).filter(Boolean))],
    [tableData],
  );

  const filteredTableData = useMemo(() => {
    return tableData.filter((s) => {
      if (selectedSedeFilter && s.nombre_sede !== selectedSedeFilter)
        return false;
      if (selectedGradoFilter && s.nombre_grado !== selectedGradoFilter)
        return false;
      return true;
    });
  }, [tableData, selectedSedeFilter, selectedGradoFilter]);

  const toolbarExtra = useMemo(() => {
    if (Number(rol) !== 9) return null;
    return (
      <div className="grid grid-cols-3 gap-2 lg:flex-row lg:items-center lg:gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-600">Sede</label>
          <select
            value={selectedSedeFilter}
            onChange={(e) => setSelectedSedeFilter(e.target.value)}
            className="border p-2 rounded bg-surface"
          >
            <option value="">Todas las sedes</option>
            {sedes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-600">Grado</label>
          <select
            value={selectedGradoFilter}
            onChange={(e) => setSelectedGradoFilter(e.target.value)}
            className="border p-2 rounded bg-surface"
          >
            <option value="">Todos los grados</option>
            {grados.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <SimpleButton
          msj={
            isDownloading
              ? `${downloadProgress?.current || 0}/${downloadProgress?.total || 0}`
              : "Descarga documentos"
          }
          bg="bg-green-600"
          icon="Download"
          text="text-surface"
          disabled={isDownloading}
          onClick={async () => {
            setIsDownloading(true);
            setDownloadErrors(null);
            setDownloadLog([]);
            setDownloadProgress({
              current: 0,
              total: filteredTableData.length,
              studentName: "",
              status: "Iniciando...",
            });
            try {
              const { errores } = await bulkDownloadDocuments(
                filteredTableData,
                {
                  generateHabeasData: true,
                  generateMatricula: true,
                  downloadIdentificacion: true,
                  downloadAcudiente: true,
                },
                (p) => {
                  setDownloadProgress(p);
                  setDownloadLog((prev) => {
                    if (
                      p.studentName &&
                      (prev.length === 0 ||
                        prev[prev.length - 1].name !== p.studentName)
                    ) {
                      return [
                        ...prev,
                        { name: p.studentName, status: p.status },
                      ];
                    }
                    if (prev.length > 0) {
                      const updated = [...prev];
                      updated[updated.length - 1] = {
                        ...updated[updated.length - 1],
                        status: p.status,
                      };
                      return updated;
                    }
                    return prev;
                  });
                },
              );
              if (errores.length > 0) setDownloadErrors(errores);
              else notify.success("Descarga completada exitosamente.");
            } catch (err) {
              notify.error(
                "Error en la descarga masiva: " + (err?.message || err),
              );
            } finally {
              setIsDownloading(false);
              setDownloadProgress(null);
            }
          }}
        />
      </div>
    );
  }, [rol, selectedSedeFilter, selectedGradoFilter, sedes, grados, filteredTableData, isDownloading, downloadProgress, notify]);

  // Abrir modal (ver o editar) y cargar datos del estudiante
  const openStudentModal = useCallback(
    async (student, editing = false) => {
      setInitialEditing(Boolean(editing));
      setIsFetching(true);

      try {
        const studentId = Number(
          student?.id_estudiante ?? student?.id_student ?? student?.id,
        );
        const sedeId = Number(
          student?.id_sede ??
            student?.fk_sede ??
            student?.sede_id ??
            idSede ??
            0,
        );

        if (!studentId) {
          console.warn("ManageStudent: id_estudiante no disponible:", student);
          setSelectedStudent(student);
          setIsModalOpen(true);
          return;
        }

        const detailed = await getStudent({
          id_estudiante: studentId,
          fk_sede: sedeId,
        });

        // Combinar información de la fila con los detalles del backend
        const combinedData = {
          ...student, // Información escolar de la fila
          ...detailed, // Detalles completos del backend (sobrescribe si hay duplicados)
        };

        setSelectedStudent(combinedData);

        setIsModalOpen(true);
      } catch (err) {
        console.error("Error al obtener detalles del estudiante:", err);
        notify.error(
          err?.message || "Error al obtener detalles del estudiante.",
        );
        setSelectedStudent(student);
        setIsModalOpen(true);
      } finally {
        setIsFetching(false);
      }
    },
    [getStudent, notify, idSede],
  );

  const handleViewProfile = useCallback(
    (s) => openStudentModal(s, false),
    [openStudentModal],
  );
  const handleEditStudent = useCallback(
    (s) => openStudentModal(s, true),
    [openStudentModal],
  );

  // Define las columnas para la tabla
  const columns = useMemo(
    () => [
      {
        accessorKey: "numero_identificacion",
        header: "N° identificación",
        meta: {
          hideOnSM: true,
        },
      },
      {
        accessorKey: "nombre",
        header: "Nombre Completo",
      },
      {
        accessorKey: "nombre_sede",
        header: "Sede",
        meta: {
          hideOnXL: true,
        },
      },
      {
        accessorKey: "nombre_grado",
        header: "Grado",
        meta: {
          hideOnLG: true,
        },
      },
      {
        accessorKey: "grupo",
        header: "Grupo",
        meta: {
          hideOnLG: true,
        },
      },
      {
        accessorKey: "nombre_jornada_estudiante",
        header: "Jornada",
        meta: {
          hideOnLG: true,
        },
      },
      ...(Number(rol) === 9
        ? [
            {
              accessorKey: "etapa1",
              header: "Etapa 1",
            },
            {
              accessorKey: "etapa2",
              header: "Etapa 2",
            },
            {
              accessorKey: "nombre_proceso",
              header: "Proceso",
            },
            {
              accessorKey: "status_beca",
              header: "Status Beca",
              cell: ({ row }) =>
                row.original.status_beca ??
                row.original.beca_estudiante ??
                "N/A",
            },
          ]
        : []),
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="w-full h-full flex items-stretch gap-2 p-2">
            <SimpleButton
              className="h-full"
              onClick={() => handleViewProfile(row.original)}
              icon="UserSearch"
              bg="bg-secondary"
              text="text-surface"
              noRounded={false}
              msjtooltip="Ver perfil"
            />
            <SimpleButton
              className="h-full"
              onClick={() => handleEditStudent(row.original)}
              icon="Pencil"
              bg="bg-secondary"
              text="text-surface"
              noRounded={false}
              msjtooltip="Actualizar"
            />
          </div>
        ),
      },
    ],
    [handleViewProfile, handleEditStudent, rol],
  );

  return (
    <div className=" p-6  h-full gap-4 flex flex-col">
      <div
        id="tour-mst-header"
        className="w-full grid gap-2 grid-cols-1 lg:grid-cols-7 xl:grid-cols-11 2xl:grid-cols-8 justify-between items-center bg-primary text-surface p-3 rounded-lg"
      >
        <div className="w-full lg:col-span-2  xl:col-span-3 flex items-center">
          <h2 className="text-2xl font-bold">Datos de Estudiantes</h2>
        </div>
        <div
          className={`w-full grid gap-2 lg:col-span-5 xl:col-span-8 2xl:col-span-5 ${Number(rol) === 10 ? "grid-cols-1" : Number(rol) === 9 ? "grid-cols-5" : "grid-cols-7"}`}
        >
          {Number(rol) !== 9 && Number(rol) !== 10 && (
            <div id="tour-mst-add-btn" className="col-span-2">
              <SimpleButton
                onClick={() => setIsAddOpen(true)}
                msj="Registrar estudiante"
                icon="Plus"
                bg="bg-secondary"
                text="text-surface"
                noRounded={false}
              />
            </div>
          )}
          {Number(rol) !== 9 && Number(rol) !== 10 && (
            <div id="tour-mst-bulk-excel" className="col-span-2">
              <SimpleButton
                onClick={() => setIsBulkOpen(true)}
                msj="Carga masiva "
                icon="Upload"
                bg="bg-secondary"
                text="text-surface"
                noRounded={false}
              />
            </div>
          )}
          {Number(rol) !== 9 && Number(rol) !== 10 && (
            <div id="tour-mst-bulk-pdf" className="col-span-2">
              <SimpleButton
                onClick={() => setIsBulkPdfOpen(true)}
                msj="Subir PDF(s)"
                icon="FileText"
                bg="bg-secondary"
                text="text-surface"
                noRounded={false}
              />
            </div>
          )}
          {Number(rol) === 9 && (
            <div className="col-span-2">
              <SimpleButton
                onClick={() => setIsBulkAuditOpen(true)}
                msj="Descarga Masiva Auditoria"
                icon="Download"
                bg="bg-secondary"
                text="text-surface"
                noRounded={false}
              />
            </div>
          )}
          {Number(rol) === 9 && (
            <div className="col-span-2">
              <SimpleButton
                onClick={() => setIsBulkAuditUploadOpen(true)}
                msj="Carga Masiva Auditoria"
                icon="Upload"
                bg="bg-secondary"
                text="text-surface"
                noRounded={false}
              />
            </div>
          )}
          <div className="col-span-1">
            <SimpleButton
              type="button"
              onClick={tourManageStudent}
              icon="HelpCircle"
              msjtooltip="Iniciar tutorial"
              noRounded={false}
              bg="bg-info"
              text="text-surface"
            />
          </div>
        </div>
      </div>
      <div id="tour-mst-table" className="relative flex-1 p-4">
        <DataTable
          key="students-table"
          data={filteredTableData || []}
          columns={columns}
          fileName="Export_Students"
          initialSorting={[{ id: "nombre_sede", desc: false }]}
          mode="Student"
          showDownloadButtons={false}
          loading={isFetching}
          loaderMessage="Cargando estudiantes..."
          toolbarExtra={toolbarExtra}
          groupBy="nombre_sede"
          groupSummary={(rows, isOpen) => {
            if (!isOpen) return null;
            const counts = {};
            rows.forEach((r) => {
              const grado = r.original.nombre_grado ?? "SIN GRADO";
              counts[grado] = (counts[grado] || 0) + 1;
            });
            return (
              <div className="flex items-center gap-2 flex-wrap">
                {Object.entries(counts).map(([grado, count]) => (
                  <span
                    key={grado}
                    className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700"
                  >
                    {grado}: {count}
                  </span>
                ))}
              </div>
            );
          }}
        />

        {fetchError && (
          <div className="mt-4 text-center text-red-600">
            Error al cargar estudiantes: {fetchError}
          </div>
        )}

        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Registrar estudiante"
          size="4xl"
        >
          <RegisterStudent
            onSuccess={() => {
              setIsAddOpen(false);
              fetchStudentsData();
            }}
          />
        </Modal>

        <Modal
          isOpen={isBulkOpen}
          onClose={() => setIsBulkOpen(false)}
          title="Carga masiva de estudiantes"
          size="4xl"
        >
          <UploadStudentExcel
            onSuccess={() => {
              setIsBulkOpen(false);
              fetchStudentsData();
            }}
          />
        </Modal>

        <Modal
          isOpen={isBulkPdfOpen}
          onClose={() => setIsBulkPdfOpen(false)}
          title="Subir PDF(s)"
          size="4xl"
        >
          <UploadStudentPDF
            onSuccess={() => {
              setIsBulkPdfOpen(false);
              // si los PDFs afectan listado, recargar
              fetchStudentsData();
            }}
          />
        </Modal>

        <Modal
          isOpen={isBulkAuditOpen}
          onClose={() => setIsBulkAuditOpen(false)}
          title="Descarga masiva auditoria"
          size="4xl"
        >
          <AuditBulkModal
            mode="download"
            onClose={() => setIsBulkAuditOpen(false)}
            onSuccess={() => {
              setIsBulkAuditOpen(false);
              fetchStudentsData();
            }}
          />
        </Modal>

        <Modal
          isOpen={isBulkAuditUploadOpen}
          onClose={() => setIsBulkAuditUploadOpen(false)}
          title="Carga masiva auditoria"
          size="4xl"
        >
          <AuditBulkModal
            mode="upload"
            onClose={() => setIsBulkAuditUploadOpen(false)}
            onSuccess={() => {
              setIsBulkAuditUploadOpen(false);
              fetchStudentsData();
            }}
          />
        </Modal>

        <StudentModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            fetchStudentsData();
          }}
          student={selectedStudent}
          initialEditing={initialEditing}
          isLoading={isFetching}
          onSave={async (studentId, personId, updatedData) => {
            try {
              await updateStudent(studentId, personId, updatedData);
              notify.success("Estudiante actualizado exitosamente.");
              setIsModalOpen(false);
              fetchStudentsData();
            } catch (err) {
              console.error("Error al actualizar estudiante:", err);
              notify.error(err?.message || "Error al actualizar estudiante.");
            }
          }}
        />

        <DownloadProgressModal
          isOpen={isDownloading}
          onClose={() => {}}
          progress={downloadProgress}
          downloadLog={downloadLog}
          isDownloading={isDownloading}
        />

        <DownloadErrorModal
          isOpen={!isDownloading && downloadErrors && downloadErrors.length > 0}
          onClose={() => {
            setDownloadErrors(null);
            setDownloadLog([]);
          }}
          errors={downloadErrors}
        />
      </div>
    </div>
  );
};

export default ManageStudent;
