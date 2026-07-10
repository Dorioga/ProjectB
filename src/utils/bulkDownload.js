import JSZip from "jszip";
import { getStudent, getDataStudentGuardian } from "../services/studentService";
import {
  generateHabeasDataPDF,
  generateMatriculaPDF,
  loadImageAsBase64,
} from "./pdfGenerators";
import { downloadBlob } from "./downloadUtils";

/**
 * Descarga masiva de documentos por estudiante, organizados en carpetas.
 *
 * Estructura del ZIP:
 *   {nombre_sede}/{nombre_grado} {grupo}/{nombre}/
 *     ├── Habeas_Data.pdf
 *     ├── Ficha_Matricula.pdf
 *     ├── Identificacion.pdf
 *     └── Acudiente.pdf
 *
 * @param {Array} students - Array de objetos del DataTable
 * @param {Object} options - Tipos de documento a generar
 * @param {Function} onProgress - Callback de progreso
 * @returns {Promise<{ errores: Array }>}
 */
export async function bulkDownloadDocuments(students, options, onProgress) {
  const {
    generateHabeasData = true,
    generateMatricula = true,
    downloadIdentificacion = true,
    downloadAcudiente = true,
  } = options || {};

  const zip = new JSZip();
  const errores = [];
  const total = students.length;

  // Pre-cargar logo de la institución (una sola vez)
  let imgSchool = null;
  try {
    const logoUrl = localStorage.getItem("imgSchool");
    if (logoUrl) {
      const parsed = JSON.parse(logoUrl);
      if (parsed) imgSchool = await loadImageAsBase64(parsed);
    }
  } catch (_) {
    // Si no se puede cargar el logo, se omite
  }

  for (let i = 0; i < total; i++) {
    const student = students[i];
    const studentName = student?.nombre || "Sin nombre";
    const sede = student?.nombre_sede || "Sin Sede";
    const grado = student?.nombre_grado || "Sin Grado";
    const grupo = student?.grupo || "";
    const idEstudiante = Number(
      student?.id_estudiante ?? student?.id_student ?? student?.id,
    );
    const fkSede = Number(
      student?.fk_sede ?? student?.id_sede ?? student?.sede_id ?? 0,
    );

    onProgress?.({
      current: i + 1,
      total,
      studentName,
      status: "Consultando datos...",
    });

    // 1. Obtener datos completos del estudiante
    let data = null;
    try {
      data = await getStudent({
        id_estudiante: idEstudiante,
        fk_sede: fkSede,
      });
    } catch (err) {
      errores.push({
        estudiante: studentName,
        tipo: "Datos",
        error: err?.message || "No se pudo obtener datos del estudiante",
      });
      continue;
    }

    if (!data) {
      errores.push({
        estudiante: studentName,
        tipo: "Datos",
        error: "Respuesta vacía del servidor",
      });
      continue;
    }

    const folderPath = `${sede}/${grado} ${grupo}/${studentName}`;
    let hasAnyFile = false;

    // 2. Habeas Data
    if (generateHabeasData) {
      onProgress?.({
        current: i + 1,
        total,
        studentName,
        status: "Generando Habeas Data...",
      });
      try {
        const pdf = generateHabeasDataPDF(data);
        const blob = pdf.output("blob");
        zip.file(`${folderPath}/Habeas_Data.pdf`, blob);
        hasAnyFile = true;
      } catch (err) {
        errores.push({
          estudiante: studentName,
          tipo: "Habeas Data",
          error: err?.message || "Error al generar",
        });
      }
    }

    // 3. Ficha de Matrícula
    if (generateMatricula) {
      onProgress?.({
        current: i + 1,
        total,
        studentName,
        status: "Generando Ficha de Matrícula...",
      });
      try {
        let guardianData = null;
        const idPersonaGuardian =
          data?.id_persona_acudiente ||
          data?.fk_persona_acudiente ||
          data?.id_acudiente;

        if (idPersonaGuardian && idEstudiante) {
          try {
            guardianData = await getDataStudentGuardian({
              idPersonaGuardian: Number(idPersonaGuardian),
              idEstudiante: idEstudiante,
            });
          } catch (_) {
            // Si falla el guardian, se usa solo data del estudiante
          }
        }

        // Cargar foto del estudiante
        let fotoBase64 = "";
        const fotoUrl = data?.link_foto || data?.url_photo;
        if (fotoUrl) {
          try {
            fotoBase64 = await loadImageAsBase64(fotoUrl);
          } catch (_) {
            // Foto no disponible
          }
        }

        const mergedData = { ...student, ...data };
        const pdf = generateMatriculaPDF(mergedData, guardianData, fotoBase64, imgSchool);
        const blob = pdf.output("blob");
        zip.file(`${folderPath}/Ficha_Matricula.pdf`, blob);
        hasAnyFile = true;
      } catch (err) {
        errores.push({
          estudiante: studentName,
          tipo: "Ficha Matrícula",
          error: err?.message || "Error al generar",
        });
      }
    }

    // 4. Identificación del estudiante
    if (downloadIdentificacion && data?.link_identificacion) {
      onProgress?.({
        current: i + 1,
        total,
        studentName,
        status: "Descargando Identificación...",
      });
      try {
        const res = await fetch(data.link_identificacion);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        zip.file(`${folderPath}/Identificacion.pdf`, blob);
        hasAnyFile = true;
      } catch (err) {
        errores.push({
          estudiante: studentName,
          tipo: "Identificación",
          error: err?.message || "Link no disponible",
        });
      }
    } else if (downloadIdentificacion && !data?.link_identificacion) {
      errores.push({
        estudiante: studentName,
        tipo: "Identificación",
        error: "Link no disponible",
      });
    }

    // 5. Identificación del acudiente
    if (downloadAcudiente && data?.link_identificacion_acudiente) {
      onProgress?.({
        current: i + 1,
        total,
        studentName,
        status: "Descargando Acudiente...",
      });
      try {
        const res = await fetch(data.link_identificacion_acudiente);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        zip.file(`${folderPath}/Acudiente.pdf`, blob);
        hasAnyFile = true;
      } catch (err) {
        errores.push({
          estudiante: studentName,
          tipo: "Acudiente",
          error: err?.message || "Link no disponible",
        });
      }
    } else if (downloadAcudiente && !data?.link_identificacion_acudiente) {
      errores.push({
        estudiante: studentName,
        tipo: "Acudiente",
        error: "Link no disponible",
      });
    }

    // Si no se generó ningún archivo para este estudiante, registrar advertencia
    if (!hasAnyFile) {
      errores.push({
        estudiante: studentName,
        tipo: "General",
        error: "No se encontraron documentos para descargar",
      });
    }
  }

  // Generar y descargar ZIP
  onProgress?.({
    current: total,
    total,
    studentName: "",
    status: "Comprimiendo archivos...",
  });

  const sedeName = students[0]?.nombre_sede || "Documentos";
  try {
    const zipBlob = await zip.generateAsync({ type: "blob" });
    downloadBlob(zipBlob, `${sedeName}.zip`);
  } catch (err) {
    errores.push({
      estudiante: "N/A",
      tipo: "ZIP",
      error: "Error al generar el archivo ZIP: " + (err?.message || err),
    });
  }

  return { errores };
}
