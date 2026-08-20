import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import Modal from "../../components/atoms/Modal";
import DataTable from "../../components/atoms/DataTable";
import SimpleButton from "../../components/atoms/SimpleButton";
import Loader from "../../components/atoms/Loader";
import ProfileEval from "../../components/molecules/ProfileEval";
import SedeSelect from "../../components/atoms/SedeSelect";
import AsignatureSelector from "../../components/molecules/AsignatureSelector";
import GradeSelector from "../../components/atoms/GradeSelector";
import PeriodSelector from "../../components/atoms/PeriodSelector";
import useTeacher from "../../lib/hooks/useTeacher";
import { useNotify } from "../../lib/hooks/useNotify";
import useAuth from "../../lib/hooks/useAuth";
import tourManageEval from "../../tour/tourManageEval";

const buildElementDetail = (rows) => {
  const list = Array.isArray(rows) ? rows : [];
  const first = list[0] ?? {};
  const questionsMap = new Map();
  list.forEach((row) => {
    const key = row.name_ask ?? row.description_ask ?? "";
    if (!questionsMap.has(key)) {
      questionsMap.set(key, {
        description_question: String(row.description_ask ?? ""),
        fk_type_question: String(row.id_type_ask ?? ""),
        url_file: String(row.url_file ?? ""),
        answer: [],
      });
    }
    questionsMap.get(key).answer.push({
      description_answer: String(row.description_answer ?? ""),
      incorrect_answer: String(row.incorrect_answer ?? ""),
    });
  });
  return {
    name_element: first.name_element ?? "",
    fk_type_element: String(first.id_type_element ?? ""),
    question: Array.from(questionsMap.values()),
  };
};

const ManageEval = () => {
  const {
    getElementQuestions,
    createElement,
    getElementData,
    getTeacherSede,
    getTeacherGrades,
    getTeacherSubjects,
  } = useTeacher();
  const { idSede, nameSede, idDocente, token, rol, idInstitution } = useAuth();
  const notify = useNotify();

  const getElementQuestionsRef = useRef(getElementQuestions);
  useEffect(() => {
    getElementQuestionsRef.current = getElementQuestions;
  }, [getElementQuestions]);
  const getElementDataRef = useRef(getElementData);
  useEffect(() => {
    getElementDataRef.current = getElementData;
  }, [getElementData]);
  const handleViewEvalRef = useRef(null);
  const notifyRef = useRef(notify);
  useEffect(() => {
    notifyRef.current = notify;
  }, [notify]);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [sedeSelected, setSedeSelected] = useState("");
  const [grade, setGrade] = useState("");
  const [asignature, setAsignature] = useState("");
  const [period, setPeriod] = useState("");

  const [teacherSedes, setTeacherSedes] = useState([]);
  const [loadingTeacherSedes, setLoadingTeacherSedes] = useState(false);

  const isDocente = useMemo(
    () => String(rol).toLowerCase() === "docente" || String(rol) === "7",
    [rol],
  );

  const isAdminInstitucional = useMemo(
    () => String(rol) === "3",
    [rol],
  );

  const teacherGradesParams = useMemo(
    () => ({
      ...(idDocente && { idTeacher: Number(idDocente) }),
      ...(sedeSelected
        ? { idSede: Number(sedeSelected) }
        : { idSede: Number(idSede) }),
    }),
    [idDocente, sedeSelected, idSede],
  );

  const teacherSubjectsParams = useMemo(
    () =>
      grade && idDocente
        ? {
            idGrade: Number(grade),
            idTeacher: Number(idDocente),
          }
        : {},
    [grade, idDocente],
  );

  const teacherSedeData = useMemo(() => {
    if (!isDocente) return null;
    if (teacherSedes.length) return teacherSedes;
    if (idSede && nameSede) return [{ id: idSede, name: nameSede }];
    return null;
  }, [isDocente, idSede, nameSede, teacherSedes]);

  useEffect(() => {
    if (!isDocente) {
      setTeacherSedes([]);
      return;
    }
    let mounted = true;
    const load = async () => {
      if (!idDocente || !getTeacherSede || !token) {
        if (mounted) setTeacherSedes([]);
        return;
      }
      if (mounted) setLoadingTeacherSedes(true);
      try {
        const res = await getTeacherSede({ idTeacher: Number(idDocente) });
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        const mapped = (Array.isArray(list) ? list : [])
          .filter(Boolean)
          .map((s) => ({
            id: String(s?.id ?? s?.id_sede ?? "").trim(),
            name: String(s?.name ?? s?.nombre ?? s?.nombre_sede ?? "").trim(),
          }));
        if (mounted) setTeacherSedes(mapped || []);
      } catch (err) {
        console.error("ManageEval - Error cargando sedes de docente:", err);
        if (mounted) setTeacherSedes([]);
      } finally {
        if (mounted) setLoadingTeacherSedes(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [isDocente, idDocente, getTeacherSede, token]);

  const fkSede = sedeSelected || idSede;

  const filtersReady = Boolean(
    idDocente && fkSede && grade && period && asignature,
  );

  const fetchEvaluations = useCallback(async () => {
    setLoading(true);
    try {
      const payload = isAdminInstitucional
        ? { institution: Number(idInstitution) }
        : {
            fk_docente: Number(idDocente),
            fk_sede: Number(fkSede),
            fk_grado: Number(grade),
            fk_period: Number(period),
            fk_asignatura: Number(asignature),
          };
      const res = await getElementQuestionsRef.current(payload);
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      setResults(data);
    } catch (err) {
      console.error("ManageEval - getElementQuestions error:", err);
      notifyRef.current.error(
        err?.message || "Error al cargar las evaluaciones.",
      );
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [
    isAdminInstitucional,
    idInstitution,
    idDocente,
    fkSede,
    grade,
    period,
    asignature,
  ]);

  useEffect(() => {
    if (isAdminInstitucional) {
      if (idInstitution) {
        fetchEvaluations();
      } else {
        setResults([]);
      }
      return;
    }
    if (!filtersReady) {
      setResults([]);
      return;
    }
    fetchEvaluations();
  }, [isAdminInstitucional, idInstitution, filtersReady, fetchEvaluations]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "name_element",
        header: "Nombre",
        accessorFn: (row) =>
          row.name_element ??
          row.nombre_element ??
          row.titulo ??
          row.title ??
          "",
      },
      {
        accessorKey: "name_type_element",
        header: "Tipo",
        accessorFn: (row) =>
          row.name_type_element ??
          row.tipo ??
          row.tipo_evaluacion ??
          row.nombre_tipo_element ??
          row.fk_type_element ??
          "",
      },
      {
        accessorKey: "docente",
        header: "Docente",
        accessorFn: (row) =>
          row.docente ?? row.nombre_docente ?? row.nombre ?? "",
      },
      {
        accessorKey: "grupo",
        header: "Grupo",
        accessorFn: (row) => row.grupo ?? row.grado_grupo ?? "",
      },
      {
        accessorKey: "nombre_asignatura",
        header: "Asignatura",
        accessorFn: (row) =>
          row.nombre_asignatura ?? row.asignatura ?? "",
      },
      {
        accessorKey: "nombre_periodo",
        header: "Periodo",
        accessorFn: (row) => row.nombre_periodo ?? row.periodo ?? "",
      },
      {
        accessorKey: "nombre_sede",
        header: "Sede",
        accessorFn: (row) => row.nombre_sede ?? row.sede ?? "",
      },
      {
        id: "actions",
        header: "Acciones",
        cell: ({ row }) => (
          <div className="flex justify-center p-1">
            <SimpleButton
              type="button"
              onClick={() => handleViewEvalRef.current?.(row.original)}
              msj="Ver"
              icon="Eye"
              bg="bg-secondary"
              text="text-surface"
              noRounded={true}
              className="w-auto px-3 py-1.5"
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
        await createElement(payload);
        notify.success("Evaluación registrada exitosamente.");
        setIsRegisterOpen(false);
        fetchEvaluations();
      } catch (err) {
        console.error("ManageEval - createElement error:", err);
        notify.error(err?.message || "Error al registrar la evaluación.");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [createElement, notify, fetchEvaluations],
  );

  const handleViewEval = useCallback(
    async (row) => {
      const id =
        row?.id_element ??
        row?.id_elemente ??
        row?.id ??
        row?.id_elemento ??
        row?.idelement;
      if (!id) {
        notifyRef.current.error("No se pudo identificar la evaluación.");
        return;
      }
      setDetailLoading(true);
      try {
        const res = await getElementDataRef.current({
          id_element: Number(id),
        });
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        setDetailData(buildElementDetail(data));
      } catch (err) {
        console.error("ManageEval - getElementData error:", err);
        notifyRef.current.error(
          err?.message || "Error al cargar el detalle de la evaluación.",
        );
        setDetailData(null);
      } finally {
        setDetailLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    handleViewEvalRef.current = handleViewEval;
  }, [handleViewEval]);

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
          {!isAdminInstitucional && (
            <SimpleButton
              onClick={() => setIsRegisterOpen(true)}
              msj="Registrar evaluación"
              icon="Plus"
              bg="bg-secondary"
              text="text-surface"
            />
          )}
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

      {!isAdminInstitucional && (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
        <div>
          <SedeSelect
            value={sedeSelected}
            onChange={(e) => {
              setSedeSelected(e.target.value);
              setGrade("");
              setAsignature("");
            }}
            data={teacherSedeData}
            loading={loadingTeacherSedes}
          />
        </div>
        <div>
          <GradeSelector
            label="Grado"
            value={grade}
            onChange={(e) => {
              setGrade(e.target.value);
              setAsignature("");
            }}
            placeholder="Selecciona grado"
            sedeId={sedeSelected}
            autoLoad={true}
            customFetchMethod={getTeacherGrades}
            additionalParams={teacherGradesParams}
            disabled={!sedeSelected}
          />
        </div>
        <div>
          <AsignatureSelector
            label="Asignatura"
            value={asignature}
            onChange={(e) => setAsignature(e.target.value)}
            placeholder="Selecciona asignatura"
            sedeId={fkSede}
            autoLoad={true}
            customFetchMethod={getTeacherSubjects}
            additionalParams={teacherSubjectsParams}
            disabled={!grade}
          />
        </div>
        <div>
          <PeriodSelector
            label="Periodo"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            autoLoad={true}
          />
        </div>
      </div>
      )}

      <div id="tour-me-table" className="relative flex-1 p-4">
        <DataTable
          data={results || []}
          columns={columns}
          fileName="Export_Evaluaciones"
          initialSorting={[{ id: "name_element", desc: false }]}
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
          fkTeacher={idDocente}
          fkSede={fkSede}
          fkGrade={grade}
          fkAsignature={asignature}
          fkPeriodo={period}
        />
      </Modal>

      <Modal
        isOpen={!!detailData}
        onClose={() => setDetailData(null)}
        title="Detalle de la evaluación"
        size="7xl"
      >
        {detailLoading ? (
          <Loader message="Cargando detalle..." />
        ) : detailData ? (
          <ProfileEval
            readOnly
            initialValues={detailData}
            onClose={() => setDetailData(null)}
          />
        ) : null}
      </Modal>
    </div>
  );
};

export default ManageEval;
