// Utilities para normalizar datos de docentes
// Nota: esta función devuelve un objeto con campos básicos a nivel root (p.ej. first_name)
//       y un arreglo `subjects`. No devuelve `basic` como objeto anidado.
export function mapTeacherRowsToProcessed(rawData, teacherRow = {}) {
  // Acepta rawData como array de filas, o { data } o lo que venga
  console.log("mapTeacherRowsToProcessed - rawData:", rawData);
  const rows = Array.isArray(rawData) ? rawData : (rawData?.data ?? rawData);
  if (!Array.isArray(rows) || rows.length === 0) {
    // No hay filas: rellenar campos básicos desde teacherRow si están presentes
    const b = {
      first_name: teacherRow?.primero_nombre || teacherRow?.first_name || "",
      second_name: teacherRow?.segundo_nombre || teacherRow?.second_name || "",
      first_lastname:
        teacherRow?.primer_apellido || teacherRow?.first_lastname || "",
      second_lastname:
        teacherRow?.segundo_apellido || teacherRow?.second_lastname || "",
      telephone: teacherRow?.telefono || teacherRow?.telephone || "",
      identification:
        teacherRow?.numero_identificacion || teacherRow?.identification || "",
      email: teacherRow?.correo || teacherRow?.email || "",
      fecha_nacimiento:
        teacherRow?.fecha_nacimiento || teacherRow?.birthday || "",
      direccion: teacherRow?.direccion || "",
      nombre_sede: teacherRow?.nombre_sede || teacherRow?.name_sede || "",
      fk_journey: teacherRow?.fk_jornada ?? teacherRow?.fk_journey ?? null,
      nombre_jornada:
        teacherRow?.nombre_jornada ||
        teacherRow?.nombre_jornada_estudiante ||
        "",
      id_sede: teacherRow?.id_sede ?? null,
    };

    return {
      id_docente: teacherRow?.id_docente,
      per_id: teacherRow?.id_persona ?? null,
      ...b,
      subjects: [],
      grados: teacherRow?.nombre_grado
        ? [String(teacherRow.nombre_grado).trim()]
        : [],
      grupos: teacherRow?.grupo ? [String(teacherRow.grupo).trim()] : [],
      estado: teacherRow?.estado || "",
    };
  }

  const base = rows[0] || {};

  // Construir subjects - agrupar por asignatura y coleccionar sus grupos usando Map/Set para evitar búsquedas O(n)
  const subjectsMap = new Map();
  const gradosSet = new Set();
  const gruposSet = new Set();
  const assignments = []; // plano: una entrada por fila (grado/grupo/asignatura)

  const splitCSV = (val) =>
    String(val ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const ids = splitCSV(r.ids_asignaturas);
    const names = splitCSV(r.asignaturas);
    const idsGradeAsignatureTeacher = splitCSV(r.ids_grade_asignature_teacher);

    // Preprocesar valores de grupo/grade por fila para evitar recalcular
    const grupo = String(r.grupo ?? "").trim();
    const nombre_grado_raw = r.nombre_grado ?? r.id_grado ?? "";
    const nombre_grado = String(nombre_grado_raw ?? "").trim();

    // Agregar al set global de grados/grupos (deduplicación global)
    if (nombre_grado) {
      nombre_grado
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean)
        .forEach((g) => gradosSet.add(g));
    }
    if (grupo) gruposSet.add(grupo);

    // Si no hay ids, intentar con una entrada por asignatura en names
    const loopCount = Math.max(
      ids.length,
      names.length,
      idsGradeAsignatureTeacher.length,
      1,
    );
    for (let j = 0; j < loopCount; j++) {
      const rawId = ids[j] ?? names[j] ?? "";
      if (!rawId) continue; // evitar entradas vacías
      const idAsig = isNaN(Number(rawId)) ? rawId : Number(rawId);
      const nameAsig = names[j] || String(rawId);
      const idGradeAsignatureTeacher = idsGradeAsignatureTeacher[j] || null;
      const subjKey = `${idAsig}::${nameAsig}`;

      // Agregar la fila al plano `assignments` para uso directo más tarde
      assignments.push({
        id_asignatura: idAsig,
        asignatura: nameAsig,
        nombre_grado,
        grupo,
        ids_grade_asignature_teacher: idGradeAsignatureTeacher,
      });

      if (!subjectsMap.has(subjKey)) {
        // _groupSet y _gradeAssignSet son Sets internos temporales para evitar duplicados rápidos
        subjectsMap.set(subjKey, {
          id_asignatura: idAsig,
          asignatura: nameAsig,
          _gradeAssignSet: new Set(),
          _groupSet: new Set(),
        });
      }

      const subjEntry = subjectsMap.get(subjKey);

      // Construir la clave de grupo para deduplicar
      const gKey = `${grupo || ""}::${nombre_grado || ""}`;
      if (!subjEntry._groupSet.has(gKey)) {
        subjEntry._groupSet.add(gKey);
      }

      // Agregar info de assignment (id de gradeAsignatureTeacher por fila, si existe)
      const gaKey = `${idGradeAsignatureTeacher || ""}::${grupo || ""}::${nombre_grado || ""}`;
      if (!subjEntry._gradeAssignSet.has(gaKey))
        subjEntry._gradeAssignSet.add(gaKey);
    }
  }

  // Convertir map -> arreglo, limpiar sets internos y ordenar
  const uniqueSubjects = Array.from(subjectsMap.values()).map((s) => {
    const groups = Array.from(s._groupSet || new Set()).map((gstr) => {
      const [grupo, nombre_grado] = gstr.split("::");
      return { grupo, nombre_grado };
    });

    // Convertir gradeAssignSet -> array de objetos { id_grade_asignature_teacher, grupo, nombre_grado }
    const gradeAssignments = Array.from(s._gradeAssignSet || new Set()).map(
      (gstr) => {
        const [idGrade, grupo, nombre_grado] = gstr.split("::");
        return {
          id_grade_asignature_teacher: idGrade
            ? isNaN(Number(idGrade))
              ? idGrade
              : Number(idGrade)
            : null,
          grupo: grupo || "",
          nombre_grado: nombre_grado || "",
        };
      },
    );

    // Ordenar grupos: por grupo alfabético, luego por nombre_grado numérico cuando aplique
    groups.sort((a, b) => {
      const gcmp = String(a.grupo || "").localeCompare(
        String(b.grupo || ""),
        "es",
        { sensitivity: "base" },
      );
      if (gcmp !== 0) return gcmp;
      const na = Number(a.nombre_grado);
      const nb = Number(b.nombre_grado);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return String(a.nombre_grado || "").localeCompare(
        String(b.nombre_grado || ""),
        "es",
        { sensitivity: "base" },
      );
    });

    const idsGradeArr = gradeAssignments
      .map((g) => g.id_grade_asignature_teacher)
      .filter(Boolean);

    return {
      id_asignatura: s.id_asignatura,
      asignatura: s.asignatura,
      // Mantener compatibilidad: si sólo hay 1 id devolverlo como escalar, si hay varios devolver array
      ids_grade_asignature_teacher:
        idsGradeArr.length === 0
          ? null
          : idsGradeArr.length === 1
            ? idsGradeArr[0]
            : idsGradeArr,
      grade_assignments: gradeAssignments,
      groups,
    };
  });

  // Ordenar asignaturas por nombre
  uniqueSubjects.sort((x, y) =>
    String(x.asignatura || "").localeCompare(String(y.asignatura || ""), "es", {
      sensitivity: "base",
    }),
  );

  return {
    id_docente: base.id_docente ?? teacherRow?.id_docente,
    per_id: base.id_persona ?? teacherRow?.id_persona ?? null,
    first_name: base.primero_nombre || base.first_name || "",
    second_name: base.segundo_nombre || base.second_name || "",
    first_lastname: base.primer_apellido || base.first_lastname || "",
    second_lastname: base.segundo_apellido || base.second_lastname || "",
    telephone: base.telefono || base.telephone || "",
    identification: base.numero_identificacion || base.identification || "",
    email: base.correo || "",
    fecha_nacimiento: base.fecha_nacimiento || base.birthday || "",
    direccion: base.direccion || "",
    nombre_sede: base.nombre_sede || base.name_sede || "",
    fk_journey: base.fk_jornada ?? null,
    nombre_jornada: base.nombre_jornada || base.nombre_jornada_estudiante || "",
    id_sede: base.id_sede ?? null,
    subjects: uniqueSubjects,
    assignments: assignments, // plano (grado/grupo/asignatura por fila)
    estado: rows[0]?.estado ?? teacherRow?.estado ?? "",
  };
}

// Mapear un valor potencial de jornada (id o label) a la opción válida (value)
export function mapJourneyToOptionValue(journeys = [], candidate) {
  if (!candidate || !Array.isArray(journeys) || journeys.length === 0)
    return "";
  const c = String(candidate).trim();
  // buscar por value exacto
  let match = journeys.find((opt) => String(opt.value) === c);
  if (match) return String(match.value);
  // buscar por label (case-insensitive)
  match = journeys.find(
    (opt) => String(opt.label).toLowerCase() === c.toLowerCase(),
  );
  if (match) return String(match.value);
  // si candidate es numérico, devolver como string si coincide parcialmente
  if (/^\d+$/.test(c)) return c;
  return "";
}

// Construir una vista unificada de grupos con sus asignaturas (desde processed)
export function buildGroupsWithAssignments(processed = {}) {
  const groupsMap = new Map();

  // 1) Si processed.groups existe, usarlo como fuente primaria
  if (Array.isArray(processed.groups) && processed.groups.length > 0) {
    processed.groups.forEach((g) => {
      const grupoKey = String(g.grupo || "");
      if (!groupsMap.has(grupoKey))
        groupsMap.set(grupoKey, { grupo: grupoKey, assignments: [] });
      const existing = groupsMap.get(grupoKey);
      const assignments = Array.isArray(g.assignments) ? g.assignments : [];
      assignments.forEach((a) => {
        existing.assignments.push({
          id_asignatura: a.id_asignatura ?? a.id ?? null,
          asignatura: a.asignatura || a.nombre_asignatura || "",
          nombre_grado:
            a.nombre_grado ||
            (Array.isArray(a.grados) ? a.grados.join(", ") : ""),
          grupo: grupoKey,
        });
      });
    });
  }

  // 2) Si processed.assignments existe, poblar grupos desde el array plano (prioritario)
  if (
    Array.isArray(processed.assignments) &&
    processed.assignments.length > 0
  ) {
    processed.assignments.forEach((a) => {
      const subjectId = a.id_asignatura ?? a.id ?? null;
      const subjectName = a.asignatura || a.nombre_asignatura || "";
      const grupoKey = String(a.grupo || "Sin Grupo");
      if (!groupsMap.has(grupoKey))
        groupsMap.set(grupoKey, { grupo: grupoKey, assignments: [] });
      const existing = groupsMap.get(grupoKey);
      existing.assignments.push({
        id_asignatura: subjectId,
        asignatura: subjectName,
        nombre_grado: a.nombre_grado || "",
        grupo: grupoKey,
      });
    });
  }

  // 3) Si processed.subjects existe, agregar/mezclar su información
  if (Array.isArray(processed.subjects)) {
    processed.subjects.forEach((s) => {
      const subjectId = s.id_asignatura ?? s.id ?? null;
      const subjectName = s.asignatura || s.nombre_asignatura || "";

      if (Array.isArray(s.groups) && s.groups.length > 0) {
        s.groups.forEach((g) => {
          const grupoKey = String(g.grupo || "");
          if (!groupsMap.has(grupoKey))
            groupsMap.set(grupoKey, { grupo: grupoKey, assignments: [] });
          const existing = groupsMap.get(grupoKey);
          existing.assignments.push({
            id_asignatura: subjectId,
            asignatura: subjectName,
            nombre_grado: Array.isArray(g.grados)
              ? g.grados.join(", ")
              : g.nombre_grado || "",
            grupo: grupoKey,
          });
        });
      } else if (Array.isArray(s.grades) && s.grades.length > 0) {
        s.grades.forEach((gr) => {
          const grupoKey = String(gr.grupo || "");
          if (!groupsMap.has(grupoKey))
            groupsMap.set(grupoKey, { grupo: grupoKey, assignments: [] });
          const existing = groupsMap.get(grupoKey);
          existing.assignments.push({
            id_asignatura: subjectId,
            asignatura: subjectName,
            nombre_grado: gr.nombre_grado || "",
            grupo: grupoKey,
          });
        });
      } else {
        const grupoKey = "Sin Grupo";
        if (!groupsMap.has(grupoKey))
          groupsMap.set(grupoKey, { grupo: grupoKey, assignments: [] });
        groupsMap.get(grupoKey).assignments.push({
          id_asignatura: subjectId,
          asignatura: subjectName,
          nombre_grado: s.nombre_grado || "",
          grupo: grupoKey,
        });
      }
    });
  }

  // 3) Si hay groups con assignments vacíos, intentar poblarlos desde processed.subjects (coincidencia por grupo)
  if (Array.isArray(processed.subjects) && processed.subjects.length > 0) {
    for (const [grupoKey, grp] of groupsMap) {
      if (Array.isArray(grp.assignments) && grp.assignments.length > 0)
        continue;
      // buscar subjects cuyo campo 'grupo' coincida con grupoKey
      processed.subjects.forEach((s) => {
        const subjGrupo = String(s.grupo || "");
        if (subjGrupo && subjGrupo === String(grupoKey)) {
          grp.assignments.push({
            id_asignatura: s.id_asignatura ?? null,
            asignatura: s.asignatura || "",
            nombre_grado: s.nombre_grado || "",
            grupo: grupoKey,
          });
        }
        // también permitir s.groups (array) con grupo dentro
        if (Array.isArray(s.groups)) {
          s.groups.forEach((g) => {
            if (String(g.grupo || "") === String(grupoKey)) {
              grp.assignments.push({
                id_asignatura: s.id_asignatura ?? null,
                asignatura: s.asignatura || "",
                nombre_grado: Array.isArray(g.grados)
                  ? g.grados.join(", ")
                  : g.nombre_grado || "",
                grupo: grupoKey,
              });
            }
          });
        }
      });
    }
  }

  // 4) Deduplicar assignments dentro de cada group (por id_asignatura + nombre_grado)
  for (const [, grp] of groupsMap) {
    const seen = new Set();
    grp.assignments = grp.assignments.filter((a) => {
      const key = `${a.id_asignatura ?? "noid"}-${String(a.nombre_grado ?? "")}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // 5) Construir array `grados` por group a partir de las asignaciones (deduplicado y ordenado)
  for (const [, grp] of groupsMap) {
    const gSet = new Set();
    grp.assignments.forEach((a) => {
      if (a && a.nombre_grado) gSet.add(String(a.nombre_grado));
    });

    const gradosArr = Array.from(gSet).filter(Boolean);
    // ordenar: si son números hacerlo numérico, si no alfabético
    gradosArr.sort((x, y) => {
      const nx = Number(x);
      const ny = Number(y);
      if (!isNaN(nx) && !isNaN(ny)) return nx - ny;
      return String(x).localeCompare(String(y), "es", { sensitivity: "base" });
    });

    grp.grados = gradosArr;
  }

  // 6) Ordenar grupos alfabéticamente y assignments por asignatura
  const groups = Array.from(groupsMap.values()).sort((x, y) =>
    String(x.grupo || "").localeCompare(String(y.grupo || ""), "es", {
      sensitivity: "base",
    }),
  );

  groups.forEach((grp) => {
    grp.assignments.sort((a, b) =>
      String(a.asignatura || "").localeCompare(
        String(b.asignatura || ""),
        "es",
        { sensitivity: "base" },
      ),
    );
  });

  return groups;
}
