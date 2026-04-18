import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import SimpleButton from "../atoms/SimpleButton";
import Modal from "../atoms/Modal";
import { formatDateToDisplay, parseDateToISO } from "../../utils/formatUtils";
import SedeSelect from "../atoms/SedeSelect";
import JourneySelect from "../atoms/JourneySelect";
import useSchool from "../../lib/hooks/useSchool";
import useTeacher from "../../lib/hooks/useTeacher";
import useData from "../../lib/hooks/useData";
import AsignatureGrades from "./AsignatureGrades";
import { buildGroupsWithAssignments } from "../../utils/teacherUtils";
import { required, isEmail, isText } from "../../utils/validationUtils";
import { useNotify } from "../../lib/hooks/useNotify";
import tourProfileTeacher from "../../tour/tourProfileTeacher";

/* ── Helpers extraídos para eliminar duplicación ── */

const buildFormFromData = (d, applyDateFormat = false) => ({
  id_docente: d.id_docente ?? d.id ?? null,
  per_id: d.per_id ?? d.id_persona ?? null,
  first_name: d.first_name || "",
  second_name: d.second_name || "",
  first_lastname: d.first_lastname || "",
  second_lastname: d.second_lastname || "",
  telephone: d.telefono || d.telephone || "",
  email: d.correo || d.email || "",
  identification: d.identification || d.numero_identificacion || "",
  fecha_nacimiento: applyDateFormat
    ? formatDateToDisplay(d.fecha_nacimiento || d.birthday || "")
    : d.fecha_nacimiento || d.birthday || "",
  direccion: d.direccion || d.address || "",
  nombre_sede: d.nombre_sede || d.name_sede || "",
  id_sede: d.id_sede || d.idSede || "",
  fk_journey: d.fk_journey || d.fk_jornada || "",
  nombre_jornada: d.nombre_jornada || d.nombre_jornada_estudiante || "",
  representante_curso: !!(
    d.director_of_grade ||
    d.representante_curso ||
    d.is_representative
  ),
});

const inputCls = (isEditing, hasError, isTourHighlight) => {
  const base = "w-full p-2 border rounded";
  const editState = isEditing
    ? "bg-white border-gray-300"
    : "bg-gray-50 border-transparent text-gray-600 cursor-not-allowed";
  const errCls = hasError ? "border-red-500" : "";
  const tourCls = isTourHighlight ? "border-red-500 ring-2 ring-red-100" : "";
  return `${base} ${editState} ${errCls} ${tourCls}`
    .replace(/\s+/g, " ")
    .trim();
};

const ProfileTeacher = ({
  data = {},
  onSave,
  initialEditing = false,
  initialTutorial = false,
  onClose,
  onReload,
  mode = "modal",
}) => {
  const isPageMode = mode === "page";
  const [isEditing, setIsEditing] = useState(Boolean(initialEditing));
  const [form, setForm] = useState(() => buildFormFromData(data));

  // Estados/refs necesarios (faltaban y provocaban ReferenceError)
  const originalRef = useRef({});

  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const notify = useNotify();
  const [activeRowKeys, setActiveRowKeys] = useState(new Set());
  const [estado, setEstado] = useState(data.estado || "");
  const [pendingSedeChange, setPendingSedeChange] = useState(null);
  const [confirmChangeSedeOpen, setConfirmChangeSedeOpen] = useState(false);
  const [newAsignatures, setNewAsignatures] = useState([]);
  const [newSede, setNewSede] = useState([]);
  const [showAsignatureGrades, setShowAsignatureGrades] = useState(false);
  const [showSedeAsignatures, setShowSedeAsignatures] = useState({});
  const [isTourMode, setIsTourMode] = useState(Boolean(initialTutorial));

  // Helper: limpiar error de asignaturas del estado de errores
  const clearAsignaturesError = useCallback(() => {
    setFormErrors((prev) => {
      if (!prev?.asignatures) return prev;
      const { asignatures: _, ...rest } = prev;
      return rest;
    });
  }, []);

  // Helper: iniciar tour con observer de driver.js
  const startTour = useCallback(() => {
    setIsTourMode(true);
    tourProfileTeacher({ isPageMode });
    const checkVisible = () =>
      !!document.querySelector(
        ".driver-popover, .driver-overlay, .driver-container, .driver",
      );
    const observer = new MutationObserver(() => {
      if (!checkVisible()) {
        setIsTourMode(false);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    const timer = setTimeout(
      () => {
        setIsTourMode(false);
        observer.disconnect();
      },
      3 * 60 * 1000,
    );
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [isPageMode]);

  const { journeys } = useSchool();
  const { createTeacherAsignature, createTeacherSede } = useTeacher();
  const { institutionSedes } = useData();

  const getSedeWorkday = useCallback(
    (sedeId) => {
      if (!sedeId || !Array.isArray(institutionSedes)) return null;
      const found = institutionSedes.find(
        (s) => String(s?.id) === String(sedeId),
      );
      return found?.fk_workday ? String(found.fk_workday) : null;
    },
    [institutionSedes],
  );

  const handleCurrentSedeChange = useCallback(
    (e) => {
      const val = e.target.value;
      const label =
        e.target.options?.[e.target.selectedIndex]?.text ||
        form.nombre_sede ||
        "";
      const wday = getSedeWorkday(val);

      // If the selection didn't change, just set it silently
      if (String(val) === String(form.id_sede)) {
        setForm((prev) => ({
          ...prev,
          id_sede: val,
          nombre_sede: label,
          fk_journey: wday && wday !== "3" ? wday : "",
          nombre_jornada: "",
        }));
        return;
      }

      // Open confirmation modal before applying change
      setPendingSedeChange({ val, label, wday });
      setConfirmChangeSedeOpen(true);
    },
    [form.id_sede, form.nombre_sede, getSedeWorkday],
  );

  const confirmChangeSede = () => {
    if (!pendingSedeChange) return;
    const { val, label, wday } = pendingSedeChange;
    setForm((prev) => ({
      ...prev,
      id_sede: val,
      nombre_sede: label,
      fk_journey: wday && wday !== "3" ? wday : "",
      nombre_jornada: "",
    }));
    // Deactivate all checkboxes (clear active selections)
    setActiveRowKeys(new Set());
    setConfirmChangeSedeOpen(false);
    setPendingSedeChange(null);
  };

  const cancelChangeSede = () => {
    setConfirmChangeSedeOpen(false);
    setPendingSedeChange(null);
  };

  // Construir grupos derivados a partir de `data` (subjects/groups)
  const computedGroups = useMemo(
    () => buildGroupsWithAssignments(data || {}),
    [data],
  );

  // Construir filas para la tabla: {grado, grupo, asignatura, id_asignatura, id_grade_asignature_teacher}
  const assignmentRows = useMemo(() => {
    const rows = [];

    if (!Array.isArray(computedGroups) || computedGroups.length === 0)
      return [];

    // Crear un mapa de asignaturas con sus grade_assignments para búsqueda rápida
    const subjectsMap = new Map();
    if (Array.isArray(data.subjects)) {
      data.subjects.forEach((subj) => {
        const key = `${subj.id_asignatura}::${subj.asignatura}`;
        subjectsMap.set(key, subj);
      });
    }

    computedGroups.forEach((grp) => {
      const groupGrados =
        Array.isArray(grp.grados) && grp.grados.length > 0 ? grp.grados : [""];

      (Array.isArray(grp.assignments) ? grp.assignments : []).forEach((a) => {
        const rawNombreGrado = String(a.nombre_grado || "").trim();
        const nameGrades = rawNombreGrado
          ? rawNombreGrado
              .split(",")
              .map((g) => g.trim())
              .filter(Boolean)
          : [];

        // Buscar el subject correspondiente para obtener grade_assignments
        const subjKey = `${a.id_asignatura}::${a.asignatura}`;
        const subject = subjectsMap.get(subjKey);
        const gradeAssignments = subject?.grade_assignments || [];

        const processGrade = (g) => {
          // Buscar el id_grade_asignature_teacher que corresponda a este grupo/grado
          let idGradeAsignature = null;
          if (gradeAssignments.length > 0) {
            const match = gradeAssignments.find(
              (ga) =>
                String(ga.grupo || "").trim() ===
                  String(grp.grupo || "").trim() &&
                String(ga.nombre_grado || "").trim() === String(g || "").trim(),
            );
            idGradeAsignature = match?.id_grade_asignature_teacher ?? null;
          }

          rows.push({
            grado: g,
            grupo: grp.grupo || "",
            asignatura: a.asignatura || "",
            id_asignatura: a.id_asignatura ?? a.id ?? null,
            id_grade_asignature_teacher: idGradeAsignature,
          });
        };

        if (nameGrades.length > 0) {
          nameGrades.forEach(processGrade);
        } else if (groupGrados.length > 0 && groupGrados[0] !== "") {
          groupGrados.forEach(processGrade);
        } else {
          processGrade("");
        }
      });
    });

    // Deduplicar por grado::grupo::asignatura
    const seen = new Set();
    const deduped = [];
    for (const r of rows) {
      const key = `${r.grado}::${r.grupo}::${r.asignatura}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(r);
      }
    }

    // Ordenar por grado (numérico cuando sea posible), luego grupo y asignatura
    deduped.sort((a, b) => {
      const na = Number(a.grado);
      const nb = Number(b.grado);
      if (!isNaN(na) && !isNaN(nb) && na !== nb) return na - nb;
      const gcmp = String(a.grado).localeCompare(String(b.grado), "es", {
        sensitivity: "base",
      });
      if (gcmp !== 0) return gcmp;
      const grpCmp = String(a.grupo).localeCompare(String(b.grupo), "es", {
        sensitivity: "base",
      });
      if (grpCmp !== 0) return grpCmp;
      return String(a.asignatura).localeCompare(String(b.asignatura), "es", {
        sensitivity: "base",
      });
    });

    return deduped;
  }, [computedGroups, data.subjects]);

  // Extraer asignaturas únicas del docente
  const uniqueSubjects = useMemo(() => {
    const subjectsMap = new Map();
    assignmentRows.forEach((row) => {
      if (row.asignatura && !subjectsMap.has(row.asignatura)) {
        subjectsMap.set(row.asignatura, {
          name: row.asignatura,
          id: row.id_asignatura,
        });
      }
    });
    return Array.from(subjectsMap.values());
  }, [assignmentRows]);

  // Claves estables para cada fila: "asignatura::grado::grupo"
  const rowKeys = useMemo(
    () => assignmentRows.map((r) => `${r.asignatura}::${r.grado}::${r.grupo}`),
    [assignmentRows],
  );

  // Inicializar todas las filas como activas cuando cambian los datos
  useEffect(() => {
    const allKeys = new Set(rowKeys);
    setActiveRowKeys(allKeys);
    originalRef.current = {
      ...originalRef.current,
      activeRowKeys: new Set(rowKeys),
    };
  }, [rowKeys]);

  // Estado derivado: por cada asignatura, si está all/some/none activa
  const subjectStatusMap = useMemo(() => {
    const map = new Map();
    uniqueSubjects.forEach((s) => {
      const indices = [];
      rowKeys.forEach((key, idx) => {
        if (assignmentRows[idx].asignatura === s.name) indices.push(idx);
      });
      const activeCount = indices.filter((idx) =>
        activeRowKeys.has(rowKeys[idx]),
      ).length;
      const total = indices.length;
      map.set(s.name, {
        checked: activeCount === total && total > 0,
        indeterminate: activeCount > 0 && activeCount < total,
        activeCount,
        total,
      });
    });
    return map;
  }, [uniqueSubjects, rowKeys, activeRowKeys, assignmentRows]);

  // Nombres de asignaturas con al menos 1 fila activa
  const activeSubjectNames = useMemo(() => {
    const names = [];
    for (const [name, status] of subjectStatusMap) {
      if (status.checked || status.indeterminate) names.push(name);
    }
    return names;
  }, [subjectStatusMap]);

  // Director de grupo: parsear CSV de nombres de grupo recibidos en `data.director_of_grade` (ej. "C5A" o "C5A,C4A")
  const directorGroupNames = useMemo(() => {
    const raw = data?.director_of_grade ?? data?.director_of_grades ?? "";
    if (!raw) return new Set();
    return new Set(
      String(raw)
        .split(",")
        .map((s) => String(s).trim())
        .filter(Boolean),
    );
  }, [data?.director_of_grade, data?.director_of_grades]);

  // localDirectorGroups almacena nombres de grupo seleccionados (ej. "C5A")
  const [localDirectorGroups, setLocalDirectorGroups] = useState(
    () => new Set(),
  );

  const handleToggleDirectorGroup = (grupo) => {
    if (!grupo) return;
    setLocalDirectorGroups((prev) => {
      const next = new Set(prev);
      if (next.has(grupo)) next.delete(grupo);
      else next.add(grupo);
      return next;
    });
  };

  // Sincronizar localDirectorGroups cuando cambian los datos (carga asíncrona o recarga)
  useEffect(() => {
    setLocalDirectorGroups(directorGroupNames);
  }, [directorGroupNames]);

  // si el docente deja de ser representante, limpiar selección de director
  useEffect(() => {
    if (!form.representante_curso) {
      setLocalDirectorGroups(new Set());
    }
  }, [form.representante_curso]);

  const handleToggleRow = useCallback(
    (idx) => {
      const key = rowKeys[idx];
      setActiveRowKeys((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
      clearAsignaturesError();
    },
    [rowKeys, clearAsignaturesError],
  );

  const handleToggleSubject = useCallback(
    (subjectName) => {
      const status = subjectStatusMap.get(subjectName);
      const subjectKeys = rowKeys.filter(
        (_, idx) => assignmentRows[idx].asignatura === subjectName,
      );
      setActiveRowKeys((prev) => {
        const next = new Set(prev);
        if (status?.checked) {
          subjectKeys.forEach((k) => next.delete(k));
        } else {
          subjectKeys.forEach((k) => next.add(k));
        }
        return next;
      });
      clearAsignaturesError();
    },
    [subjectStatusMap, rowKeys, assignmentRows, clearAsignaturesError],
  );

  const handleToggleAllRows = useCallback(() => {
    setActiveRowKeys((prev) =>
      prev.size === rowKeys.length ? new Set() : new Set(rowKeys),
    );
    clearAsignaturesError();
  }, [rowKeys, clearAsignaturesError]);

  useEffect(() => {
    setIsEditing(Boolean(initialEditing));
  }, [initialEditing]);

  useEffect(() => {
    if (!initialTutorial) return;
    let cleanup;
    const t = setTimeout(() => {
      cleanup = startTour();
    }, 250);
    return () => {
      clearTimeout(t);
      cleanup?.();
    };
  }, [initialTutorial, startTour]);

  useEffect(() => {
    const initialForm = buildFormFromData(data, true);
    setForm(initialForm);
    setEstado(data.estado || "");
    const rawDog = data?.director_of_grade ?? data?.director_of_grades ?? "";
    const initialDirectorGroups = new Set(
      rawDog
        ? String(rawDog)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    );
    originalRef.current = {
      form: initialForm,
      estado: data.estado || "",
      activeRowKeys: originalRef.current?.activeRowKeys || null,
      directorGroups: initialDirectorGroups,
    };
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // limpiar error del campo al modificarlo
    setFormErrors((prev) => {
      if (!prev || !prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleEstadoChange = (e) => {
    const newVal = e.target.value;
    if (newVal === estado) return;
    const ok = window.confirm(`¿Confirmas cambiar el estado a "${newVal}"?`);
    if (ok) setEstado(newVal);
  };

  // Gestión de nuevas asignaturas (modo edición)
  const handleAddAsignature = (asign) => {
    setNewAsignatures((prev) => [...prev, asign]);
  };

  const handleRemoveAsignature = (index) => {
    setNewAsignatures((prev) => prev.filter((_, i) => i !== index));
  };

  // Gestión de nuevas sedes
  const addNewSede = () => {
    setNewSede((prev) => [
      ...prev,
      { id_sede: "", fk_journey: "", asignatures: [] },
    ]);
  };

  const updateNewSedeField = (index, field, value) => {
    setNewSede((prev) =>
      prev.map((s, i) => {
        if (i !== index) return s;
        const updated = { ...s, [field]: value };
        // Al cambiar la sede, limpiar jornada y auto-seleccionar si fk_workday no es 3
        if (field === "id_sede") {
          const wday = getSedeWorkday(value);
          if (wday && wday !== "3") {
            updated.fk_journey = wday;
          } else {
            updated.fk_journey = "";
          }
        }
        return updated;
      }),
    );
  };

  const removeNewSede = (index) => {
    setNewSede((prev) => prev.filter((_, i) => i !== index));
    setShowSedeAsignatures((prev) => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
  };

  const handleAddSedeAsignature = (sedeIndex, asign) => {
    setNewSede((prev) =>
      prev.map((s, i) =>
        i === sedeIndex
          ? { ...s, asignatures: [...(s.asignatures || []), asign] }
          : s,
      ),
    );
  };

  const handleRemoveSedeAsignature = (sedeIndex, asignIndex) => {
    setNewSede((prev) =>
      prev.map((s, i) =>
        i === sedeIndex
          ? {
              ...s,
              asignatures: (s.asignatures || []).filter(
                (_, ai) => ai !== asignIndex,
              ),
            }
          : s,
      ),
    );
  };

  const toggleSedeAsignatures = (index) => {
    setShowSedeAsignatures((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleCancel = () => {
    const orig = originalRef.current || {};
    setForm(orig.form || buildFormFromData(data, true));
    setEstado(orig.estado || data.estado || "");
    setActiveRowKeys(orig.activeRowKeys || new Set(rowKeys));
    setLocalDirectorGroups(directorGroupNames);
    setNewAsignatures([]);
    setNewSede([]);
    setShowAsignatureGrades(false);
    setShowSedeAsignatures({});
    setFormErrors({});
    setIsEditing(false);
  };

  const isDirty = useMemo(() => {
    const orig = originalRef.current || {
      form: null,
      estado: null,
      activeRowKeys: null,
      directorGroups: null,
    };
    const formChanged =
      JSON.stringify(orig.form || {}) !== JSON.stringify(form || {});
    const estadoChanged = (orig.estado || "") !== (estado || "");
    const origKeys = orig.activeRowKeys;
    const rowsChanged = origKeys
      ? origKeys.size !== activeRowKeys.size ||
        [...origKeys].some((k) => !activeRowKeys.has(k))
      : false;
    const origDir = orig.directorGroups;
    const directorChanged = origDir
      ? origDir.size !== localDirectorGroups.size ||
        [...origDir].some((k) => !localDirectorGroups.has(k))
      : false;
    return formChanged || estadoChanged || rowsChanged || directorChanged;
  }, [form, estado, activeRowKeys, localDirectorGroups]);

  // Validación pura (sin side effects) — usada tanto por useMemo como por handleSave
  const computeFormErrors = useCallback(() => {
    const next = {};

    const rFirst = required(
      form.first_name,
      "El primer nombre es obligatorio.",
    );
    if (!rFirst.valid) next.first_name = rFirst.msg;
    else {
      const t = isText(
        form.first_name,
        "El primer nombre sólo puede contener letras y espacios.",
      );
      if (!t.valid) next.first_name = t.msg;
    }

    const rLast = required(
      form.first_lastname,
      "El primer apellido es obligatorio.",
    );
    if (!rLast.valid) next.first_lastname = rLast.msg;

    const rId = required(
      form.identification,
      "El número de identificación es obligatorio.",
    );
    if (!rId.valid) next.identification = rId.msg;

    const rEmailReq = required(form.email, "El correo es obligatorio.");
    if (!rEmailReq.valid) next.email = rEmailReq.msg;
    else {
      const rEmail = isEmail(form.email, "Correo inválido");
      if (!rEmail.valid) next.email = rEmail.msg;
    }

    // Solo bloquear si el usuario tocó los checkboxes Y desactivó todos
    if (!isPageMode && uniqueSubjects.length > 0) {
      const origActiveKeys = originalRef.current?.activeRowKeys;
      const subjectsModified = origActiveKeys
        ? origActiveKeys.size !== activeRowKeys.size ||
          [...origActiveKeys].some((k) => !activeRowKeys.has(k))
        : false;
      if (subjectsModified && activeSubjectNames.length === 0) {
        next.asignatures = "Debe seleccionar al menos una asignatura activa.";
      }
    }

    return next;
  }, [
    form.first_name,
    form.first_lastname,
    form.identification,
    form.email,
    isPageMode,
    uniqueSubjects,
    activeSubjectNames,
    activeRowKeys,
  ]);

  const canSave = useMemo(() => {
    return Object.keys(computeFormErrors()).length === 0;
  }, [computeFormErrors]);

  const FIELD_LABELS = {
    first_name: "Primer nombre",
    first_lastname: "Primer apellido",
    identification: "Identificación",
    email: "Correo",
    asignatures: "Asignaturas",
  };

  const missingFields = useMemo(() => {
    const errors = computeFormErrors();
    return Object.keys(errors).map((k) => FIELD_LABELS[k] || k);
  }, [computeFormErrors]);

  const handleSave = async () => {
    if (!isDirty) {
      // Sin cambios en el formulario: salir de edición directamente
      notify.info("No hay cambios para guardar.");
      setIsEditing(false);
      return;
    }

    const errors = computeFormErrors();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstMsg =
        Object.values(errors)[0] || "Corrige los campos del formulario.";
      notify.error(firstMsg);
      return;
    }

    // ── Determinar si el usuario realmente modificó los checkboxes de asignaturas ──
    const origActiveKeys = originalRef.current?.activeRowKeys;
    const subjectsModified = origActiveKeys
      ? origActiveKeys.size !== activeRowKeys.size ||
        [...origActiveKeys].some((k) => !activeRowKeys.has(k))
      : false;

    // Asignaturas activas según el estado actual de los checkboxes
    const activeSubjects = new Set();
    const activeGradeIds = new Set();
    const inactiveGradeIds = new Set();

    assignmentRows.forEach((row, idx) => {
      if (activeRowKeys.has(rowKeys[idx])) {
        activeSubjects.add(row.asignatura);
        if (row.id_grade_asignature_teacher != null) {
          activeGradeIds.add(Number(row.id_grade_asignature_teacher));
        }
      } else if (row.id_grade_asignature_teacher != null) {
        inactiveGradeIds.add(Number(row.id_grade_asignature_teacher));
      }
    });

    // Nombres de asignaturas presentes en la UI (para saber cuáles son rastreables)
    const trackedNames = new Set(uniqueSubjects.map((s) => s.name));

    // Determinar estado de una asignatura según el contexto
    const resolveSubjectStatus = (name) => {
      // Si el usuario NO tocó los checkboxes → preservar como "Activo"
      if (!subjectsModified) return "Activo";
      // Si la asignatura no está rastreada en la UI → preservar
      if (!trackedNames.has(name)) return "Activo";
      // Si está rastreada, usar el estado real del checkbox
      return activeSubjects.has(name) ? "Activo" : "Inactivo";
    };

    // ── Construir lista completa de asignaturas desde data.subjects + uniqueSubjects ──
    const seenSubjectIds = new Set();
    const asignatures = [];

    // 1) data.subjects es la fuente autoritativa del backend
    if (Array.isArray(data.subjects)) {
      data.subjects.forEach((s) => {
        const id = s.id_asignatura ?? s.id;
        if (id != null && !seenSubjectIds.has(Number(id))) {
          seenSubjectIds.add(Number(id));
          asignatures.push({
            fk_asignatura: Number(id),
            status: resolveSubjectStatus(s.asignatura || ""),
          });
        }
      });
    }

    // 2) Agregar cualquier asignatura de uniqueSubjects que no estuviera en data.subjects
    uniqueSubjects.forEach((s) => {
      if (s.id != null && !seenSubjectIds.has(Number(s.id))) {
        seenSubjectIds.add(Number(s.id));
        asignatures.push({
          fk_asignatura: Number(s.id),
          status: resolveSubjectStatus(s.name),
        });
      }
    });

    // ── Grades: solo enviar cambios si el usuario modificó checkboxes ──
    const grades = subjectsModified
      ? [
          ...Array.from(activeGradeIds).map((id) => ({
            id_grade_asignature_teacher: id,
            status: "Activo",
          })),
          ...Array.from(inactiveGradeIds).map((id) => ({
            id_grade_asignature_teacher: id,
            status: "Inactivo",
          })),
        ]
      : assignmentRows
          .filter((r) => r.id_grade_asignature_teacher != null)
          .map((r) => ({
            id_grade_asignature_teacher: Number(r.id_grade_asignature_teacher),
            status: "Activo",
          }));

    const payload = {
      first_name: form.first_name,
      second_name: form.second_name,
      first_lastname: form.first_lastname,
      second_lastname: form.second_lastname,
      phone: form.telephone,
      identification_number: form.identification,
      email: form.email,
      id_sede: form.id_sede ? Number(form.id_sede) : null,
      birth_date: parseDateToISO(form.fecha_nacimiento),
      workday: form.fk_journey ? Number(form.fk_journey) : null,
      address: form.direccion,
      representante_curso: !!form.representante_curso,
      director_of_grade: Array.from(localDirectorGroups).join(","),
      status: estado,
      asignatures,
      grades,
    };
    setIsSaving(true);
    try {
      if (typeof onSave === "function") {
        const teacherId = form.id_docente ?? data.id_docente ?? data.id ?? null;
        const personId = form.per_id ?? data.per_id ?? data.id_persona ?? null;
        await onSave(teacherId, personId, payload);
        notify.success("Docente guardado correctamente.");
        // actualizar snapshot
        originalRef.current = {
          form: { ...form },
          estado,
          activeRowKeys: new Set(activeRowKeys),
          directorGroups: new Set(localDirectorGroups),
        };
        setIsEditing(false);
      } else {
        // Si no hay callback, igual actualizar snapshot y salir
        originalRef.current = {
          form: { ...form },
          estado,
          activeRowKeys: new Set(activeRowKeys),
          directorGroups: new Set(localDirectorGroups),
        };
        setIsEditing(false);
      }
    } catch (err) {
      notify.error("Error al guardar el docente. Intenta nuevamente.");
      // Mantener en modo edición para que el usuario lo corrija
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegisterSede = async () => {
    if (!createTeacherSede || !Array.isArray(newSede) || newSede.length === 0) {
      return;
    }

    setIsSaving(true);
    try {
      // Enviar una petición por cada sede nueva (serialmente)
      for (const s of newSede) {
        const payload = {
          id_new_sede: s.id_sede ? Number(s.id_sede) : null,
          workday_new_sede: s.fk_journey ? Number(s.fk_journey) : null,
          fk_teacher: form.id_docente ? Number(form.id_docente) : null,
          asignature_new_sede: (Array.isArray(s.asignatures)
            ? s.asignatures
            : []
          ).map((a) => ({
            idAsignature_new: Number(a.idAsignature),
            grades_new: (Array.isArray(a.grades) ? a.grades : []).map((g) => {
              const gid = typeof g === "object" ? (g.idgrade ?? g.id ?? g) : g;
              return { idgrade_new: Number(gid) };
            }),
          })),
        };

        await createTeacherSede(payload);
      }

      // Limpiar estado y cerrar UI de agregar sedes
      setNewSede([]);
      setShowSedeAsignatures({});

      notify.success("Sede registrada correctamente.");
      // Recargar datos del docente
      if (typeof onReload === "function") {
        await onReload();
      }
    } catch (err) {
      notify.error("Error al registrar la sede. Intenta nuevamente.");
      throw err;
    } finally {
      setIsSaving(false);
    }
  };
  const handleRegisterAsignature = async () => {
    if (
      !createTeacherAsignature ||
      !Array.isArray(newAsignatures) ||
      newAsignatures.length === 0
    ) {
      return;
    }

    const payload = {
      id_sede_new_asignature: form.id_sede ? Number(form.id_sede) : null,
      workday_new: form.fk_journey ? Number(form.fk_journey) : form.id_sede,

      fk_teacher: form.id_docente ? Number(form.id_docente) : null,
      asignature_new: newAsignatures.map((a) => ({
        idAsignature_new: Number(a.idAsignature),
        grades_new: (Array.isArray(a.grades) ? a.grades : []).map((g) => {
          const gid = typeof g === "object" ? (g.idgrade ?? g.id ?? g) : g;
          return { idgrade_new: Number(gid) };
        }),
      })),
    };

    setIsSaving(true);
    try {
      await createTeacherAsignature(payload);

      setNewAsignatures([]);
      setShowAsignatureGrades(false);

      notify.success("Asignaturas registradas correctamente.");
      if (typeof onReload === "function") {
        await onReload();
      }
    } catch (err) {
      notify.error("Error al registrar las asignaturas. Intenta nuevamente.");
      throw err;
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className={"w-full flex flex-col gap-4  px-4"}>
      <div className="w-full grid sm:grid-cols-2 lg:grid-cols-5 justify-between items-center bg-primary text-surface p-3 rounded-t-lg gap-4">
        <div className="col-span-3 flex items-center gap-3">
          <h3 className="font-bold text-xl">Información basica del docente</h3>
          {!isPageMode && (
            <div className="ml-4 text-sm text-gray-600">
              Campos con <span className="text-red-500">*</span> obligatorios
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <SimpleButton
            type="button"
            onClick={startTour}
            icon="HelpCircle"
            msjtooltip="Iniciar tutorial"
            noRounded={false}
            bg="bg-info"
            text="text-surface"
            className="w-auto px-3 py-1.5"
          />
        </div>
        {!isPageMode ? (
          <div className="w-full gap-4">
            {" "}
            <div id="tour-profile-save">
              <SimpleButton
                onClick={() => {
                  if (isEditing) {
                    handleCancel();
                  } else {
                    setIsEditing(true);
                  }
                }}
                msj={isEditing ? "Cancelar edición" : "Editar"}
                icon={isEditing ? "X" : "Pencil"}
                bg={isEditing ? "bg-error" : "bg-secondary"}
                text="text-surface"
              />
            </div>
          </div>
        ) : null}
        {isEditing && !canSave && missingFields.length > 0 && (
          <div className="ml-4 text-sm text-red-600">
            Faltan: {missingFields.join(", ")}
          </div>
        )}
      </div>

      {/* 1) Información básica */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div>
          <label className="font-semibold">
            Primer nombre{" "}
            {!isPageMode && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            id="tour-profile-firstname"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            className={inputCls(
              isEditing,
              formErrors.first_name,
              isTourMode && !String(form.first_name).trim(),
            )}
            disabled={!isEditing}
          />
          {formErrors.first_name && (
            <div className="text-sm text-red-600 mt-1">
              {formErrors.first_name}
            </div>
          )}
        </div>

        <div>
          <label className="font-semibold">Segundo nombre</label>
          <input
            name="second_name"
            value={form.second_name}
            onChange={handleChange}
            className={inputCls(isEditing, false, false)}
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="font-semibold">
            Primer apellido{" "}
            {!isPageMode && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            id="tour-profile-firstlastname"
            name="first_lastname"
            value={form.first_lastname}
            onChange={handleChange}
            className={inputCls(
              isEditing,
              formErrors.first_lastname,
              isTourMode && !String(form.first_lastname).trim(),
            )}
            disabled={!isEditing}
          />
          {formErrors.first_lastname && (
            <div className="text-sm text-red-600 mt-1">
              {formErrors.first_lastname}
            </div>
          )}
        </div>

        <div>
          <label className="font-semibold">Segundo apellido</label>
          <input
            name="second_lastname"
            value={form.second_lastname}
            onChange={handleChange}
            className={inputCls(isEditing, false, false)}
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="font-semibold">Teléfono</label>
          <input
            name="telephone"
            value={form.telephone}
            onChange={handleChange}
            className={inputCls(isEditing, false, false)}
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="font-semibold">
            Correo {!isPageMode && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            id="tour-profile-email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className={inputCls(
              isEditing,
              formErrors.email,
              isTourMode && !String(form.email).trim(),
            )}
            disabled={!isEditing}
          />
          {formErrors.email && (
            <div className="text-sm text-red-600 mt-1">{formErrors.email}</div>
          )}
        </div>

        <div>
          <label className="font-semibold">
            Identificación{" "}
            {!isPageMode && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            id="tour-profile-identification"
            name="identification"
            value={form.identification}
            onChange={handleChange}
            className={inputCls(
              isEditing,
              formErrors.identification,
              isTourMode && !String(form.identification).trim(),
            )}
            disabled={!isEditing}
          />
          {formErrors.identification && (
            <div className="text-sm text-red-600 mt-1">
              {formErrors.identification}
            </div>
          )}
        </div>

        <div>
          <label className="font-semibold">Fecha de nacimiento</label>
          <input
            name="fecha_nacimiento"
            value={form.fecha_nacimiento}
            onChange={handleChange}
            placeholder="DD/MM/YYYY"
            className={inputCls(isEditing, false, false)}
            disabled={!isEditing}
          />
        </div>

        <div>
          <label className="font-semibold">Dirección</label>
          <input
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
            className={inputCls(isEditing, false, false)}
            disabled={!isEditing}
          />
        </div>
        <div>
          <label className="font-semibold">Estado del docente</label>
          <select
            value={estado}
            onChange={handleEstadoChange}
            className={inputCls(isEditing, false, false)}
            disabled={!isEditing}
          >
            <option value="Activo">Activo</option>
            <option value="Desactivado">Desactivado</option>
          </select>
        </div>
        <div>
          <label className="font-semibold">Representante de curso</label>
          <div className="flex items-center gap-3 mt-2">
            <input
              type="checkbox"
              name="representante_curso"
              checked={form.representante_curso}
              disabled={!isEditing}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  representante_curso: e.target.checked,
                }))
              }
              className="w-4 h-4"
            />
            <span
              className={`px-3 py-1 rounded-lg text-sm font-semibold text-center border border-solid  ${form.representante_curso ? "bg-green-100 text-green-800 border-green-200" : "bg-yellow-100 text-yellow-800 border-yellow-200"}`}
            >
              {form.representante_curso ? "Sí" : "No"}
            </span>
          </div>
        </div>
        {/* 3) Estado */}
      </div>
      <div className="">
        <div className="grid grid-cols-2">
          <div className="grid grid-cols-1">
            <label className="font-semibold">Sede Actual</label>
            <p>{form.nombre_sede}</p>
          </div>
          {isEditing ? (
            <>
              <div id="tour-profile-sede">
                <SedeSelect
                  name="id_sede"
                  value={form.id_sede || ""}
                  onChange={handleCurrentSedeChange}
                  placeholder="Selecciona una sede"
                  label="Nueva Sede"
                />
              </div>

              <Modal
                isOpen={confirmChangeSedeOpen}
                onClose={cancelChangeSede}
                title="Confirmar cambio de sede"
                size="md"
              >
                <div>
                  <p>
                    Al cambiar la sede se desactivarán los checkbox de
                    asignaturas y grados asociados a este docente. ¿Deseas
                    continuar?
                  </p>
                  <div className="flex justify-end gap-2 mt-4">
                    <SimpleButton
                      msj="Cancelar"
                      bg="bg-error"
                      text="text-surface"
                      onClick={cancelChangeSede}
                    />
                    <SimpleButton
                      msj="Confirmar"
                      bg="bg-accent"
                      text="text-surface"
                      onClick={confirmChangeSede}
                    />
                  </div>
                </div>
              </Modal>
            </>
          ) : null}
        </div>

        <div className="grid grid-cols-2">
          <div className="grid grid-cols-1">
            <label className="font-semibold">Jornada Actual</label>
            <p>{form.nombre_jornada || form.fk_journey || ""}</p>
          </div>
          {isEditing ? (
            <JourneySelect
              name="fk_journey"
              value={form.fk_journey || ""}
              filterValue={getSedeWorkday(form.id_sede) || ""}
              onChange={(e) => {
                const val = e.target.value;
                const found = Array.isArray(journeys)
                  ? journeys.find((opt) => String(opt.value) === String(val))
                  : null;
                setForm((prev) => ({
                  ...prev,
                  fk_journey: val,
                  nombre_jornada: found
                    ? String(found.label)
                    : prev.nombre_jornada || "",
                }));
              }}
              disabled={!form.id_sede}
              label="Nueva Jornada"
            />
          ) : null}
        </div>
      </div>

      {/* 2a) Asignaturas del docente con checkbox */}
      {isEditing && (
        <div
          id="tour-profile-asignatures"
          className={`border rounded bg-surface p-4 ${isTourMode && uniqueSubjects.length > 0 && activeSubjectNames.length === 0 ? "border-red-500 ring-2 ring-red-100" : ""}`}
        >
          <h3 className="font-bold mb-3">
            Asignaturas del Docente{" "}
            {!isPageMode && <span className="text-red-500 ml-1">*</span>}
          </h3>
          {uniqueSubjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {uniqueSubjects.map((subject) => (
                <label
                  key={subject.id || subject.name}
                  className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    ref={(el) => {
                      if (el)
                        el.indeterminate =
                          subjectStatusMap.get(subject.name)?.indeterminate ||
                          false;
                    }}
                    checked={
                      subjectStatusMap.get(subject.name)?.checked || false
                    }
                    onChange={() => handleToggleSubject(subject.name)}
                    className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
                  />
                  <span className="text-sm">
                    {subject.name}
                    {subject.id && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({subject.id})
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No hay asignaturas registradas para este docente.
            </p>
          )}
          {formErrors.asignatures && (
            <div className="text-sm text-red-600 mt-2">
              {formErrors.asignatures}
            </div>
          )}
          {activeSubjectNames.length > 0 && (
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm font-semibold text-blue-800">
                Asignaturas activas: {activeSubjectNames.length} de{" "}
                {uniqueSubjects.length}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {activeSubjectNames.join(", ")}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 2b) Asignaturas/Groups */}
      <div className=" rounded bg-surface flex flex-col gap-4 ">
        <h3 className="p-2 font-bold">Asignaturas/Grupos</h3>
        {assignmentRows.length > 0 ? (
          <div
            id="tour-profile-assignments-table"
            className="overflow-x-auto border"
          >
            <table className="w-full text-left text-sm">
              <thead className="bg-primary ">
                <tr className="text-xs text-surface text-center">
                  {isEditing && (
                    <th className="px-3 py-2 w-12">
                      <input
                        type="checkbox"
                        ref={(el) => {
                          if (el)
                            el.indeterminate =
                              activeRowKeys.size > 0 &&
                              activeRowKeys.size < rowKeys.length;
                        }}
                        checked={
                          activeRowKeys.size === rowKeys.length &&
                          rowKeys.length > 0
                        }
                        onChange={handleToggleAllRows}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </th>
                  )}
                  <th className="px-3 py-2">Asignatura</th>
                  <th className="px-3 py-2">Grado</th>
                  <th className="px-3 py-2">Grupo</th>
                  <th className="px-3 py-2">Director de grupo</th>
                </tr>
              </thead>
              <tbody>
                {assignmentRows.map((row, idx) => (
                  <tr
                    key={`assign-row-${idx}`}
                    className={`border-t text-center ${isEditing && activeRowKeys.has(rowKeys[idx]) ? "bg-blue-50" : ""}`}
                  >
                    {isEditing && (
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={activeRowKeys.has(rowKeys[idx])}
                          onChange={() => handleToggleRow(idx)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                    )}
                    <td className="px-3 py-2">
                      <div className="font-medium">{row.asignatura}</div>
                      {row.id_asignatura ? (
                        <div className="text-xs text-gray-500">
                          ({row.id_asignatura})
                        </div>
                      ) : null}
                    </td>
                    <td className="px-3 py-2">{row.grado || "—"}</td>
                    <td className="px-3 py-2">{row.grupo || "—"}</td>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={
                          !!row.grupo && localDirectorGroups.has(row.grupo)
                        }
                        readOnly={!isEditing || !form.representante_curso}
                        disabled={!isEditing || !form.representante_curso}
                        onChange={() => handleToggleDirectorGroup(row.grupo)}
                        className="w-4 h-4 mx-auto tour-director-checkbox"
                        aria-label={`Director de grupo: ${row.grupo || "n/a"}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-sm text-gray-600">
            No hay asignaturas registradas.
          </div>
        )}

        {/* Botón toggle y componente AsignatureGrades en modo edición */}
        {isEditing && (
          <div className="p-4 border">
            <div className="">
              <div id="tour-profile-toggle-asignatures">
                <SimpleButton
                  onClick={() => setShowAsignatureGrades((prev) => !prev)}
                  msj={
                    showAsignatureGrades
                      ? "Ocultar asignaturas"
                      : "Agregar asignaturas"
                  }
                  icon={showAsignatureGrades ? "Minus" : "Plus"}
                  bg="bg-accent"
                  text="text-surface"
                />
              </div>
            </div>
            {showAsignatureGrades && (
              <div className="mt-3 flex flex-col gap-4">
                <AsignatureGrades
                  sede={form.id_sede}
                  workday={form.fk_journey}
                  asignatures={newAsignatures}
                  onAdd={handleAddAsignature}
                  onRemove={handleRemoveAsignature}
                />
                <div id="tour-profile-register-asignature">
                  <SimpleButton
                    onClick={handleRegisterAsignature}
                    msj={isSaving ? "Registrando..." : "Registrar Asignaturas"}
                    icon="Save"
                    bg="bg-accent"
                    text="text-surface"
                    disabled={isSaving}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4) Agregar nuevas sedes con asignaturas */}
      {isEditing && (
        <div className="border rounded bg-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Asignar docente a nueva sede</h4>
            <div className="w-48" id="tour-profile-add-sede">
              <SimpleButton
                onClick={addNewSede}
                msj="Agregar sede"
                icon="Plus"
                bg="bg-accent"
                text="text-surface"
              />
            </div>
          </div>

          {newSede.length > 0 ? (
            <div className="space-y-4">
              {newSede.map((sede, index) => (
                <div
                  key={`new-sede-${index}`}
                  className="border rounded p-4 bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold">Sede #{index + 1}</p>
                    <div className="w-32">
                      <SimpleButton
                        onClick={() => removeNewSede(index)}
                        msj="Borrar"
                        icon="Trash2"
                        bg="bg-red-600"
                        text="text-surface"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SedeSelect
                      name={`new_sede_${index}`}
                      value={sede.id_sede || ""}
                      onChange={(e) =>
                        updateNewSedeField(index, "id_sede", e.target.value)
                      }
                      placeholder="Selecciona una sede"
                    />

                    <JourneySelect
                      name={`new_journey_${index}`}
                      value={sede.fk_journey || ""}
                      filterValue={getSedeWorkday(sede.id_sede) || ""}
                      onChange={(e) =>
                        updateNewSedeField(index, "fk_journey", e.target.value)
                      }
                      disabled={!sede.id_sede}
                    />
                  </div>

                  <div className="mt-3">
                    <SimpleButton
                      onClick={() => toggleSedeAsignatures(index)}
                      msj={
                        showSedeAsignatures[index]
                          ? "Ocultar asignaturas"
                          : "Agregar asignaturas"
                      }
                      icon={
                        showSedeAsignatures[index] ? "ChevronUp" : "ChevronDown"
                      }
                      bg="bg-accent"
                      text="text-surface"
                    />

                    {showSedeAsignatures[index] && (
                      <div className="mt-3">
                        <AsignatureGrades
                          sede={sede.id_sede}
                          workday={sede.fk_journey}
                          asignatures={sede.asignatures || []}
                          onAdd={(asign) =>
                            handleAddSedeAsignature(index, asign)
                          }
                          onRemove={(asignIndex) =>
                            handleRemoveSedeAsignature(index, asignIndex)
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div id="tour-profile-register-sede">
                <SimpleButton
                  onClick={handleRegisterSede}
                  msj={isSaving ? "Registrando..." : "Registrar Sedes"}
                  icon="Save"
                  bg="bg-accent"
                  text="text-surface"
                  disabled={isSaving}
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No hay sedes nuevas agregadas.
            </p>
          )}
        </div>
      )}

      {/* 5) Botones */}
      <div className="flex gap-3 justify-end">
        {!isPageMode && isEditing && (
          <div id="tour-profile-guardar">
            <SimpleButton
              msj={isSaving ? "Guardando..." : "Guardar"}
              icon={isSaving ? "Loader" : "Save"}
              bg="bg-accent"
              text="text-surface"
              onClick={handleSave}
              disabled={isSaving || !canSave}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileTeacher;
