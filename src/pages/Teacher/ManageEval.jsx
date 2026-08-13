import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import Modal from "../../components/atoms/Modal";
import DataTable from "../../components/atoms/DataTable";
import SimpleButton from "../../components/atoms/SimpleButton";
import ProfileEval from "../../components/molecules/ProfileEval";
import useTeacher from "../../lib/hooks/useTeacher";
import { useNotify } from "../../lib/hooks/useNotify";
import useAuth from "../../lib/hooks/useAuth";
import tourManageEval from "../../tour/tourManageEval";

const ManageEval = () => {
  const { getEvaluations, createEvaluation, updateEvaluation } = useTeacher();
  // idInstitution se usa para poder filtrar/guardar cuando el backend lo requiera
  const { idInstitution, idSede } = useAuth();
  const notify = useNotify();

  const getEvaluationsRef = useRef(getEvaluations);
  useEffect(() => {
    getEvaluationsRef.current = getEvaluations;
  }, [getEvaluations]);
  const notifyRef = useRef(notify);
  useEffect(() => {
    notifyRef.current = notify;
  }, [notify]);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEval, setSelectedEval] = useState(null);

  const filtrosPreparados = useMemo(() => {
    const payload = {};
    if (idInstitution != null && idInstitution !== "")
      payload.fk_institucion = Number(idInstitution);
    if (idSede != null && idSede !== "") payload.fk_sede = Number(idSede);
    return payload;
  }, [idInstitution, idSede]);

  const fetchEvaluations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getEvaluationsRef.current(filtrosPreparados);
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      setResults(data);
    } catch (err) {
      console.error("ManageEval - getEvaluations error:", err);
      notifyRef.current.error(
        err?.message || "Error al cargar las evaluaciones.",
      );
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [filtrosPreparados]);

  useEffect(() => {
    fetchEvaluations();
  }, [fetchEvaluations]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "titulo",
        header: "Título",
        accessorFn: (row) => row.titulo ?? row.title ?? row.nombre_evaluacion ?? "",
      },
      {
        accessorKey: "tipo",
        header: "Tipo",
        accessorFn: (row) =>
          row.tipo ?? row.tipo_evaluacion ?? row.type ?? "",
      },
      {
        id: "numPreguntas",
        header: "N° preguntas",
        meta: { hideOnLG: true },
        accessorFn: (row) =>
          Array.isArray(row.preguntas) ? row.preguntas.length : 0,
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="w-full h-full flex items-stretch gap-2 p-2">
            <SimpleButton
              className="h-full"
              onClick={() => {
                setSelectedEval(row.original);
                setIsEditOpen(true);
              }}
              icon="Pencil"
              bg="bg-secondary"
              text="text-surface"
              noRounded={false}
              msjtooltip="Editar evaluación"
            />
          </div>
        ),
      },
    ],
    [],
  );

  const handleRegister = useCallback(
    async (payload) => {
      try {
        setLoading(true);
        await createEvaluation({ ...payload, ...filtrosPreparados });
        notify.success("Evaluación registrada exitosamente.");
        setIsRegisterOpen(false);
        fetchEvaluations();
      } catch (err) {
        console.error("ManageEval - createEvaluation error:", err);
        notify.error(err?.message || "Error al registrar la evaluación.");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [createEvaluation, filtrosPreparados, notify, fetchEvaluations],
  );

  const handleUpdate = useCallback(
    async (payload) => {
      if (!selectedEval) return;
      const evalId = selectedEval.id ?? selectedEval.id_evaluacion;
      if (evalId == null) {
        notify.error("No se pudo identificar la evaluación.");
        return;
      }
      try {
        setLoading(true);
        await updateEvaluation(evalId, payload);
        notify.success("Evaluación actualizada exitosamente.");
        setIsEditOpen(false);
        setSelectedEval(null);
        fetchEvaluations();
      } catch (err) {
        console.error("ManageEval - updateEvaluation error:", err);
        notify.error(err?.message || "Error al actualizar la evaluación.");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedEval, updateEvaluation, notify, fetchEvaluations],
  );

  return (
    <div className="p-6 h-full gap-4 flex flex-col">
      <div
        id="tour-me-header"
        className="w-full grid gap-2 grid-cols-1 lg:grid-cols-5 xl:grid-cols-4 justify-between items-center bg-primary text-surface p-3 rounded-lg"
      >
        <div className="lg:col-span-3 xl:col-span-2 flex items-center">
          <h2 className="text-2xl font-bold">Gestión de Evaluaciones</h2>
        </div>
        <div
          id="tour-me-add-btn"
          className="grid grid-cols-2 col-span-2 xl:col-span-2 gap-2"
        >
          <SimpleButton
            onClick={() => setIsRegisterOpen(true)}
            msj="Registrar evaluación"
            icon="Plus"
            bg="bg-secondary"
            text="text-surface"
          />
          <SimpleButton
            type="button"
            onClick={tourManageEval}
            icon="HelpCircle"
            msjtooltip="Iniciar tutorial"
            noRounded={false}
            bg="bg-info"
            text="text-surface"
            className="w-auto px-3 py-1.5"
          />
        </div>
      </div>

      <div id="tour-me-table" className="relative flex-1 p-4">
        <DataTable
          data={results || []}
          columns={columns}
          fileName="Export_Evaluaciones"
          initialSorting={[{ id: "titulo", desc: false }]}
          loading={loading}
          loaderMessage="Cargando evaluaciones..."
        />
      </div>

      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Registrar evaluación"
        size="7xl"
      >
        <ProfileEval
          onSave={handleRegister}
          onClose={() => setIsRegisterOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedEval(null);
        }}
        title="Editar evaluación"
        size="7xl"
      >
        {selectedEval && <ProfileEval
          initialValues={selectedEval}
          onSave={handleUpdate}
        />}
      </Modal>
    </div>
  );
};

export default ManageEval;