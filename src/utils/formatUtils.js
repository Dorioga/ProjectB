/**
 * Formatea una fecha tipo 'YYYYMMDD' o 'YYYY-MM-DD' a 'DD/MM/YYYY'.
 * Si no es válida, devuelve la cadena original o "N/A".
 */
export function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  const str = String(dateStr);
  // Si es tipo 'YYYYMMDD'
  if (/^\d{8}$/.test(str)) {
    const year = str.slice(0, 4);
    const month = str.slice(4, 6);
    const day = str.slice(6, 8);
    return new Date(`${year}-${month}-${day}`).toLocaleDateString("es-CO");
  }
  // Si es tipo 'YYYY-MM-DD' o reconocida por Date
  const d = new Date(str);
  if (!isNaN(d)) return d.toLocaleDateString("es-CO");
  return str;
}

// Devuelve fecha para mostrar en UI: DD/MM/YYYY o cadena vacía si no hay valor
export function formatDateToDisplay(dateStr) {
  if (!dateStr) return "";
  const str = String(dateStr).trim();
  // ISO yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const d = new Date(str + "T00:00:00");
    if (!isNaN(d)) return d.toLocaleDateString("es-ES");
  }
  // already d/m/yyyy or dd/mm/yyyy (allow single digits)
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    const [ddRaw, mmRaw, yyyy] = str.split("/");
    const dd = String(ddRaw).padStart(2, "0");
    const mm = String(mmRaw).padStart(2, "0");
    return `${dd}/${mm}/${yyyy}`;
  }
  // try Date constructor
  const d2 = new Date(str);
  if (!isNaN(d2)) return d2.toLocaleDateString("es-ES");
  return str;
}

// Convierte entrada de usuario (DD/MM/YYYY, D/M/YYYY, D-M-YYYY o YYYY-MM-DD) a "YYYY-MM-DD" para enviar al backend
export function parseDateToISO(dateStr) {
  if (!dateStr) return "";
  const s = String(dateStr).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // Acepta formatos con separador '/' o '-' y días/meses de 1 o 2 dígitos
  const sepMatch = s.match(/^(\d{1,2})([\/\-])(\d{1,2})[\/\-](\d{4})$/);
  if (sepMatch) {
    const dd = String(sepMatch[1]).padStart(2, "0");
    const mm = String(sepMatch[3]).padStart(2, "0");
    const yyyy = sepMatch[4];
    return `${yyyy}-${mm}-${dd}`;
  }

  const d = new Date(s);
  if (!isNaN(d)) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  return s;
}

/**
 * Formatea un número a cadena con separador de miles y decimales.
 * Si no es válido, devuelve la cadena original o "N/A".
 */
export function formatNumber(num) {
  if (num === null || num === undefined || num === "") return "N/A";
  const n = Number(num);
  if (isNaN(n)) return num;
  return `$${n.toLocaleString("es-CO")}`;
}

/**
 * Valida un correo electrónico simple.
 * Devuelve true si la cadena cumple un patrón razonable de email.
 * No pretende validar todos los casos RFC, pero es suficiente para UI.
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  const re =
    // permite letras, números, puntos, guiones y subdominios; dominio con TLD mínimo 2
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  return re.test(email.trim());
}
/**
 * Valida una contraseña:
 * - mínimo 8 caracteres
 * - al menos una letra
 * - al menos un número
 * Opcional: puedes ajustar la expresión regular (regex) para requerir mayúsculas, símbolos, etc.
 * @param {string} password
 * @returns {boolean}
 */
export function isValidPassword(password) {
  if (!password || typeof password !== "string") return false;
  // mínima longitud 8, al menos una letra y un dígito
  return /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
}

/**
 * Compara dos contraseñas y devuelve true si coinciden exactamente.
 * @param {string} p1
 * @param {string} p2
 * @returns {boolean}
 */
export function passwordsMatch(p1, p2) {
  return String(p1) === String(p2);
}

/**
 * Permite solo números en una entrada.
 * Uso: onChange={(e) => handleNumericInput(e, setValor)}
 * @param {Event} event - El evento de la entrada
 * @param {Function} setter - Función setState para actualizar el valor
 * @param {Object} options - Opciones adicionales
 * @param {number} options.maxLength - Longitud máxima permitida
 * @param {boolean} options.allowDecimals - Permitir decimales (punto o coma)
 * @param {boolean} options.allowNegative - Permitir números negativos
 */
export function handleNumericInput(event, setter, options = {}) {
  const { maxLength, allowDecimals = false, allowNegative = false } = options;
  let value = event.target.value;

  // Permitir solo números, opcionalmente decimales y negativos
  let regex = /[^0-9]/g;

  if (allowDecimals && allowNegative) {
    regex = /[^0-9.,-]/g;
  } else if (allowDecimals) {
    regex = /[^0-9.,]/g;
  } else if (allowNegative) {
    regex = /[^0-9-]/g;
  }

  // Remover caracteres no permitidos
  value = value.replace(regex, "");

  // Limitar longitud si se especifica
  if (maxLength && value.length > maxLength) {
    value = value.slice(0, maxLength);
  }

  // Actualizar el valor
  setter(value);
}

/**
 * Valida que una cadena contenga solo números.
 * @param {string} str
 * @returns {boolean}
 */
export function isNumeric(str) {
  if (!str || typeof str !== "string") return false;
  return /^\d+$/.test(str.trim());
}

/**
 * Genera una abreviatura/acrónimo a partir del nombre de una institución.
 * Ejemplos: "Institución Educativa San Martín" -> "IESM" (o hasta 4 letras)
 * - Elimina palabras vacías comunes (de, del, la, el, y, etc.)
 * - Toma la primera letra de cada palabra y escala a mayúsculas
 * - Si hay una sola palabra, devuelve las primeras N letras
 * @param {string} name
 * @param {number} maxLength (por defecto 4)
 * @returns {string}
 */
export function institutionAbbreviation(name, maxLength = 6) {
  if (!name || typeof name !== "string") return "";
  const stopWords = new Set([
    "de",
    "del",
    "la",
    "las",
    "el",
    "los",
    "y",
    "e",
    "para",
    "por",
    "en",
    "the",
    "of",
    "&",
  ]);

  // Normalizar: eliminar caracteres no alfanuméricos salvo espacios, dividir por espacios
  const cleaned = name
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "";

  let words = cleaned
    .split(" ")
    .map((w) => w.trim())
    .filter(Boolean)
    .filter((w) => !stopWords.has(w.toLowerCase()));

  // Si al filtrar quedan 0 palabras, volver a la lista original
  if (words.length === 0) {
    words = cleaned
      .split(" ")
      .map((w) => w.trim())
      .filter(Boolean);
  }

  if (words.length === 1) {
    const single = words[0].replace(/[^\p{L}\p{N}]/gu, "");
    return single.slice(0, maxLength).toUpperCase();
  }

  // Tomar la primera letra de cada palabra y formar el acrónimo
  let abbr = words
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  if (abbr.length > maxLength) abbr = abbr.slice(0, maxLength);

  // Si quedó corto, rellenar con letras siguientes de las palabras concatenadas
  if (abbr.length < maxLength) {
    const all = words.join("").replace(/[^\p{L}\p{N}]/gu, "");
    abbr = (abbr + all).slice(0, maxLength).toUpperCase();
  }

  return abbr;
}

/**
 * Formatea un número de teléfono (p. ej.: 3001234567 -> 300 123 4567)
 * @param {string} phone
 * @returns {string}
 */
export function formatPhoneNumber(phone) {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");

  // Formato colombiano: XXX XXX XXXX
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }

  return cleaned;
}

/**
 * Formatea un número de documento (p. ej.: 1234567890 -> 1.234.567.890)
 * @param {string} doc
 * @returns {string}
 */
export function formatDocument(doc) {
  if (!doc) return "";
  const cleaned = doc.replace(/\D/g, "");
  return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Limpia una cadena dejando solo números.
 * @param {string} str
 * @returns {string}
 */
export function onlyNumbers(str) {
  if (!str) return "";
  return String(str).replace(/\D/g, "");
}

/**
 * Comprueba si la fecha actual es posterior a la fecha de cierre.
 * @param {string} endDate - Fecha en formato 'YYYY-MM-DD'
 * @returns {boolean} - true si hoy es después de la fecha de cierre
 */
export function isAfterEndDate(endDate) {
  if (!endDate) return false;

  const today = new Date();

  // Crear la fecha en zona horaria local sin conversión UTC
  const [year, month, day] = endDate.split("-");
  const closeDate = new Date(year, month - 1, day); // mes es 0-indexed

  // Establecer horas a 0 para comparar solo fechas
  today.setHours(0, 0, 0, 0);
  closeDate.setHours(0, 0, 0, 0);

  return today > closeDate;
}

/**
 * Ordena un array de objetos alfabéticamente por un campo específico.
 * Útil para ordenar datos antes de pasarlos a un DataTable.
 *
 * @param {Array<Object>} data - Array de objetos a ordenar.
 * @param {string} field - Nombre del campo por el cual ordenar.
 * @param {"asc"|"desc"} order - Dirección del orden: "asc" (A-Z) o "desc" (Z-A). Por defecto "asc".
 * @returns {Array<Object>} Nuevo array ordenado alfabéticamente.
 *
 * @example
 * const sorted = sortAlphabetically(students, "nombre");
 * const sortedDesc = sortAlphabetically(teachers, "apellido", "desc");
 */
export function sortAlphabetically(data, field, order = "asc") {
  if (!Array.isArray(data) || !field) return data;

  return [...data].sort((a, b) => {
    const valA = String(a[field] ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const valB = String(b[field] ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    if (valA < valB) return order === "asc" ? -1 : 1;
    if (valA > valB) return order === "asc" ? 1 : -1;
    return 0;
  });
}
