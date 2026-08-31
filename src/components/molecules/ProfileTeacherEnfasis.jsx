import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import SimpleButton from "../atoms/SimpleButton";
import SedeSelect from "../atoms/SedeSelect";
import JourneySelect from "../atoms/JourneySelect";
import useAuth from "../../lib/hooks/useAuth";
import useData from "../../lib/hooks/useData";
import useSchool from "../../lib/hooks/useSchool";
import { useNotify } from "../../lib/hooks/useNotify";
import {
  getModes,
  getAreasByMode,
  getTeachersBySedeEmphasis,
  getSedeEmphasisAsignatures,
  saveTeacherEnfasis,
} from "../../services/enfasisService";

const ProfileTeacherEnfasis = ({ isOpen, onClose, onSaved, initialData }) => {
  const { idSede: authIdSede } = useAuth();
  const { institutionSedes } = useData();
  const { journeys } = useSchool();
  const notify = useNotify();

  const prefillRef = useRef(null);

  const [modes, setModes] = useState([]);
  const [loadingModes, setLoadingModes] = useState(false);

  const [teacherSede, setTeacherSede] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState("");

  const [teacherMode, setTeacherMode] = useState("");
  const [teacherAreas, setTeacherAreas] = useState([]);
  const [loadingTeacherAreas, setLoadingTeacherAreas] = useState(false);
  const [teacherArea, setTeacherArea] = useState("");

  const [teacherJornada, setTeacherJornada] = useState("");
  const [teacherAsignaturas, setTeacherAsignaturas] = useState([]);
  const [loadingTeacherAsignaturas, setLoadingTeacherAsignaturas] =
    useState(false);
  const [selectedAsignatura, setSelectedAsignatura] = useState("");

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoadingModes(true);
    getModes()
      .then((res) => {
        if (mounted) setModes(Array.isArray(res) ? res : []);
      })
      .catch((err) => {
        console.error("ProfileTeacherEnfasis - getModes error:", err);
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
    if (!isOpen) return;
    prefillRef.current = initialData || null;
    setTeachers([]);
    setSelectedTeacher("");
    setTeacherMode("");
    setTeacherAreas([]);
    setTeacherArea("");
    setTeacherJornada("");
    setTeacherAsignaturas([]);
    setSelectedAsignatura("");
    setErrors({});
    setTeacherSede(
      initialData ? "" : authIdSede ? String(authIdSede) : "",
    );
  }, [isOpen, initialData, authIdSede]);

  const teacherSedeWorkday = useMemo(() => {
    if (!teacherSede || !Array.isArray(institutionSedes)) return null;
    const sede = institutionSedes.find(
      (s) => String(s?.id) === String(teacherSede),
    );
    return sede?.fk_workday ? String(sede.fk_workday) : null;
  }, [teacherSede, institutionSedes]);

  useEffect(() => {
    setTeacherJornada("");
    if (teacherSedeWorkday && teacherSedeWorkday !== "3") {
      setTeacherJornada(teacherSedeWorkday);
    }
  }, [teacherSede, teacherSedeWorkday]);

  useEffect(() => {
    setSelectedTeacher("");
    setTeachers([]);
    if (!teacherSede) return;
    let mounted = true;
    setLoadingTeachers(true);
    getTeachersBySedeEmphasis({ fk_sede: teacherSede })
      .then((res) => {
        if (mounted) setTeachers(Array.isArray(res) ? res : []);
      })
      .catch((err) => {
        console.error(
          "ProfileTeacherEnfasis - getTeachersBySedeEmphasis error:",
          err,
        );
        if (mounted) setTeachers([]);
      })
      .finally(() => {
        if (mounted) setLoadingTeachers(false);
      });
    return () => {
      mounted = false;
    };
  }, [teacherSede]);

  useEffect(() => {
    setTeacherArea("");
    setTeacherAsignaturas([]);
    setSelectedAsignatura("");
    if (!teacherMode) return;
    let mounted = true;
    setLoadingTeacherAreas(true);
    getAreasByMode(teacherMode)
      .then((res) => {
        if (mounted) setTeacherAreas(Array.isArray(res) ? res : []);
      })
      .catch((err) => {
        console.error(
          "ProfileTeacherEnfasis - getAreasByMode error:",
          err,
        );
        if (mounted) setTeacherAreas([]);
      })
      .finally(() => {
        if (mounted) setLoadingTeacherAreas(false);
      });
    return () => {
      mounted = false;
    };
  }, [teacherMode]);

  useEffect(() => {
    setTeacherAsignaturas([]);
    setSelectedAsignatura("");
    if (!teacherSede || !teacherArea || !teacherJornada) return;
    let mounted = true;
    setLoadingTeacherAsignaturas(true);
    getSedeEmphasisAsignatures({
      fk_sede: teacherSede,
      fk_area_enfasis: teacherArea,
      fk_workday: teacherJornada,
    })
      .then((res) => {
        if (mounted) setTeacherAsignaturas(Array.isArray(res) ? res : []);
      })
      .catch((err) => {
        console.error(
          "ProfileTeacherEnfasis - getSedeEmphasisAsignatures error:",
          err,
        );
        if (mounted) setTeacherAsignaturas([]);
      })
      .finally(() => {
        if (mounted) setLoadingTeacherAsignaturas(false);
      });
    return () => {
      mounted = false;
    };
  }, [teacherSede, teacherArea, teacherJornada]);

  const isEdit = useMemo(() => Boolean(initialData), [initialData]);

  useEffect(() => {
    const prefill = prefillRef.current;
    if (!isOpen || !prefill) return;
    if (!teacherSede && Array.isArray(institutionSedes) && institutionSedes.length) {
      const sede = institutionSedes.find(
        (s) =>
          (s.nombre || s.name || s.nombre_sede || "") === prefill.nombre_sede,
      );
      if (sede) setTeacherSede(String(sede.id));
    }
    if (!teacherMode && modes.length) {
      const mode = modes.find((m) => m.name === prefill.name_modalidad);
      if (mode) setTeacherMode(String(mode.id));
    }
    if (!teacherJornada && Array.isArray(journeys) && journeys.length) {
      const jornada = journeys.find(
        (j) =>
          String(j.label || "").toLowerCase() ===
          String(prefill.nombre_jornada || "").toLowerCase(),
      );
      if (jornada) setTeacherJornada(String(jornada.value));
    }
  }, [
    isOpen,
    institutionSedes,
    modes,
    journeys,
    teacherSede,
    teacherMode,
    teacherJornada,
  ]);

  useEffect(() => {
    const prefill = prefillRef.current;
    if (!isOpen || !prefill) return;
    if (teacherSede && !selectedTeacher && teachers.length) {
      const teacher = teachers.find(
        (t) =>
          String(t.concat_ws || t.docente || "")
            .trim()
            .toLowerCase() ===
          String(prefill.docente || "").trim().toLowerCase(),
      );
      if (teacher) setSelectedTeacher(String(teacher.id_docente));
    }
  }, [isOpen, teacherSede, selectedTeacher, teachers]);

  useEffect(() => {
    const prefill = prefillRef.current;
    if (!isOpen || !prefill) return;
    if (teacherMode && !teacherArea && teacherAreas.length) {
      const area = teacherAreas.find(
        (a) =>
          (a.name_area_enfasis || a.name || a.nombre || "") ===
          prefill.name_area_enfasis,
      );
      if (area) setTeacherArea(String(area.id_area_enfasis));
    }
  }, [isOpen, teacherMode, teacherArea, teacherAreas]);

  useEffect(() => {
    const prefill = prefillRef.current;
    if (!isOpen || !prefill) return;
    if (
      teacherSede &&
      teacherArea &&
      teacherJornada &&
      !selectedAsignatura &&
      teacherAsignaturas.length
    ) {
      const asignatura = teacherAsignaturas.find(
        (a) => a.name_asignatura_enfasis === prefill.name_asignatura_enfasis,
      );
      if (asignatura) setSelectedAsignatura(String(asignatura.id_asignatura_enfasis));
    }
  }, [
    isOpen,
    teacherSede,
    teacherArea,
    teacherJornada,
    selectedAsignatura,
    teacherAsignaturas,
  ]);

  const canLoadAsignaturas = Boolean(
    teacherSede && teacherArea && teacherJornada,
  );

  const validateForm = (showErrors = true) => {
    const next = {};
    if (!teacherSede) next.sede = "Selecciona una sede.";
    if (!selectedTeacher) next.docente = "Selecciona un docente.";
    if (!teacherMode) next.mode = "Selecciona una modalidad.";
    if (!teacherArea) next.area = "Selecciona un área énfasis.";
    if (!teacherJornada) next.jornada = "Selecciona una jornada.";
    if (!selectedAsignatura)
      next.asignatura = "Selecciona una asignatura énfasis.";
    if (showErrors) setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = useCallback(async () => {
    if (!validateForm(true)) return;
    if (isEdit) {
      notify.warning(
        "La actualización de la asignación está pendiente de endpoint.",
      );
      return;
    }
    setSaving(true);
    try {
      await saveTeacherEnfasis({
        fk_asignatura_enfasis: Number(selectedAsignatura),
        fk_teacher: Number(selectedTeacher),
      });
      notify.success("Docente asignado al énfasis exitosamente.");
      if (typeof onSaved === "function") onSaved();
      if (typeof onClose === "function") onClose();
    } catch (err) {
      console.error("ProfileTeacherEnfasis - saveTeacherEnfasis error:", err);
      notify.error(err?.message || "Error al asignar el docente al énfasis.");
    } finally {
      setSaving(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, selectedAsignatura, selectedTeacher, onSaved, onClose]);

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <SedeSelect
            labelClassName="font-semibold"
            value={teacherSede}
            onChange={(e) => setTeacherSede(e.target.value)}
          />
          {errors.sede && (
            <div className="text-sm text-red-600 mt-1">{errors.sede}</div>
          )}
        </div>

        <div>
          <label className="font-semibold">Docente</label>
          <select
            name="docente"
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            disabled={!teacherSede}
            className="w-full p-2 border rounded bg-surface"
          >
            <option value="">
              {loadingTeachers
                ? "Cargando docentes..."
                : "Selecciona un docente"}
            </option>
            {!loadingTeachers &&
              teachers.map((t) => (
                <option key={t.id_docente} value={t.id_docente}>
                  {t.concat_ws ?? t.docente}
                </option>
              ))}
          </select>
          {errors.docente && (
            <div className="text-sm text-red-600 mt-1">{errors.docente}</div>
          )}
        </div>

        <div>
          <label className="font-semibold">Modalidad</label>
          <select
            name="mode"
            value={teacherMode}
            onChange={(e) => setTeacherMode(e.target.value)}
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
          <label className="font-semibold">Área énfasis</label>
          <select
            name="area"
            value={teacherArea}
            onChange={(e) => setTeacherArea(e.target.value)}
            disabled={!teacherMode}
            className="w-full p-2 border rounded bg-surface"
          >
            <option value="">
              {loadingTeacherAreas
                ? "Cargando áreas..."
                : "Selecciona un área"}
            </option>
            {!loadingTeacherAreas &&
              teacherAreas.map((a) => (
                <option key={a.id_area_enfasis} value={a.id_area_enfasis}>
                  {a.name_area_enfasis ?? a.name ?? a.nombre ?? a.id_area_enfasis}
                </option>
              ))}
          </select>
          {errors.area && (
            <div className="text-sm text-red-600 mt-1">{errors.area}</div>
          )}
        </div>

        <div>
          <JourneySelect
            labelClassName="font-semibold"
            value={teacherJornada}
            onChange={(e) => setTeacherJornada(e.target.value)}
            filterValue={teacherSedeWorkday}
            className="w-full p-2 border rounded bg-surface"
          />
          {errors.jornada && (
            <div className="text-sm text-red-600 mt-1">{errors.jornada}</div>
          )}
        </div>

        <div>
          <label className="font-semibold">Asignatura énfasis</label>
          <select
            name="asignatura"
            value={selectedAsignatura}
            onChange={(e) => setSelectedAsignatura(e.target.value)}
            disabled={!canLoadAsignaturas}
            className="w-full p-2 border rounded bg-surface"
          >
            <option value="">
              {loadingTeacherAsignaturas
                ? "Cargando asignaturas..."
                : !canLoadAsignaturas
                  ? "Completa sede, área y jornada"
                  : "Selecciona una asignatura"}
            </option>
            {!loadingTeacherAsignaturas &&
              teacherAsignaturas.map((a) => (
                <option key={a.id_asignatura_enfasis} value={a.id_asignatura_enfasis}>
                  {a.name_asignatura_enfasis}
                </option>
              ))}
          </select>
          {errors.asignatura && (
            <div className="text-sm text-red-600 mt-1">
              {errors.asignatura}
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
            onClick={handleSave}
            msj={saving ? "Guardando..." : "Guardar"}
            icon={saving ? "Loader" : "Save"}
            bg="bg-primary"
            text="text-surface"
            disabled={saving}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileTeacherEnfasis;