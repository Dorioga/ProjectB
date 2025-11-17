/**
 * Descarga un archivo desde la carpeta public
 * @param {string} filePath - Ruta relativa del archivo en public (ej: '/files/documentos.zip')
 * @param {string} fileName - Nombre con el que se descargará el archivo
 */
export const downloadFileFromPublic = (filePath, fileName) => {
  const link = document.createElement("a");
  link.href = filePath;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Descarga un archivo Blob (generado dinámicamente)
 * @param {Blob} blob - Blob del archivo
 * @param {string} fileName - Nombre del archivo
 */
export const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Descarga múltiples archivos como ZIP
 * @param {Array} students - Array de estudiantes
 * @param {string} type - Tipo de descarga ('1' o '4')
 */
export const downloadStudentDocuments = async (students, type) => {
  // Descarga el ZIP tal como está en public
  const zipPath = "/documents.zip";
  downloadFileFromPublic(zipPath, "documents.zip");
};
