import { useState, useEffect } from "react";
import Modal from "../atoms/Modal";
import SimpleButton from "../atoms/SimpleButton";
import FileChooser from "../atoms/FileChooser";
import { isAfterEndDate } from "../../utils/formatUtils";
import PdfSchool from "./PdfAudit";

const AuditoryModal = ({ isOpen, onClose, mode, data }) => {
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    startdate: getTodayDate(),
    enddate: "",
    observation: "",
    personext: "",
    personint: "",
  });

  const [photoData, setPhotoData] = useState({
    photo1: null,
    photo2: null,
    photo3: null,
    photo4: null,
    photo5: null,
  });

  const [filesData, setFilesData] = useState({
    startact: null,
    endact: "ASdasdasd",
    anex: null,
  });

  // ✅ Estado para la nueva observación temporal
  const [newObservation, setNewObservation] = useState("");

  const [isEditing, setIsEditing] = useState(false);

  const isBlocked =
    formData.enddate && filesData.endact
      ? isAfterEndDate(formData.enddate)
      : false;

  console.log("isBlocked:", isBlocked);
  console.log("enddate:", formData.enddate);
  console.log("endact:", filesData.endact);

  useEffect(() => {
    if (mode === "view" && data) {
      setFormData({
        year: data.year || new Date().getFullYear(),
        startdate: data.startdate || getTodayDate(),
        enddate: data.enddate || "",
        observation: data.observation || "",
        personext: data.personext || "",
        personint: data.personint || "",
      });

      if (data.filesData) {
        setFilesData({
          startact: data.filesData.startact || null,
          endact: data.filesData.endact || null,
          anex: data.filesData.anex || null,
        });
      }
    } else if (mode === "create") {
      setFormData({
        year: new Date().getFullYear(),
        startdate: getTodayDate(),
        enddate: "",
        observation: "",
        personext: "",
        personint: "",
      });
      setFilesData({
        startact: null,
        endact: null,
        anex: null,
      });
      setNewObservation("");
    }
  }, [mode, data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Función para agregar observación
  const handleAddObservation = () => {
    if (newObservation.trim()) {
      const timestamp = new Date().toLocaleString("es-CO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      // Formato: [DD/MM/YYYY HH:MM - Usuario]: Nueva observación
      const newEntry = formData.observation
        ? `\n\n[${timestamp} - Usuario Actual]: ${newObservation}`
        : `[${timestamp} - Usuario Actual]: ${newObservation}`;

      setFormData((prev) => ({
        ...prev,
        observation: prev.observation + newEntry,
      }));

      setNewObservation("");
      alert("Observación agregada correctamente");
    } else {
      alert("Por favor, escribe una observación antes de agregar.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos de auditoría:", formData);
    setIsEditing(false);
    onClose();
  };

  const handleDocumentChange = (documentName, file) => {
    setPhotoData((prev) => ({
      ...prev,
      [documentName]: file,
    }));
  };

  const handleFileChange = (documentName, file) => {
    setFilesData((prev) => ({
      ...prev,
      [documentName]: file,
    }));
    if (documentName === "endact" && mode === "view") {
      setFormData((prev) => ({
        ...prev,
        enddate: getTodayDate(),
      }));
    }
  };

  const handleDownloadFile = async () => {
    const data = {
      school_name: "Colegio Central",
      rector: "Carlos Gómez",
      fechaApertura: "2024-02-01",
      fechaCierre: "2024-02-15",
    };

    await PdfSchool(data);
  };

  const toggleEditing = () => {
    if (isEditing) {
      setNewObservation("");
    }
    setIsEditing(!isEditing);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "Nueva auditoría" : "Ver auditoría"}
      size="4xl"
    >
      <div
        className={`grid gap-4${
          mode === "view" ? " grid-cols-3" : " grid-cols-1 "
        }`}
      >
        <h2 className="text-lg font-medium">
          {mode === "create"
            ? "Complete el formulario para crear una nueva auditoría."
            : isBlocked
            ? "Auditoría cerrada - Solo lectura"
            : "Detalles de la auditoría"}
        </h2>

        {mode === "view" && (
          <div className="grid gap-4 grid-cols-2 col-span-2 ">
            <SimpleButton
              onClick={handleDownloadFile}
              msj="Descargar informe"
              bg="bg-green-500"
              hover="hover:bg-green-600"
              text="text-white"
              icon="Download"
            />
            <SimpleButton
              onClick={toggleEditing}
              msj={isEditing ? "Cancelar Edición" : "Editar"}
              bg="bg-secondary"
              hover="hover:bg-yellow-700"
              text="text-white"
              icon="Edit"
            />
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Año */}
        <div>
          <label className="block text-sm font-medium mb-2">Año</label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            min="2020"
            max="2100"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={mode === "view" || isBlocked}
          />
        </div>
        {/* Fecha inicio */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Fecha de inicio
            </label>
            <input
              type="date"
              name="startdate"
              value={formData.startdate}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={mode === "view" || isBlocked}
            />
          </div>

          {/* Fecha cierre */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Fecha de cierre
            </label>
            <input
              type="date"
              name="enddate"
              value={formData.enddate}
              onChange={handleChange}
              min={formData.startdate}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={
                mode === "create" || filesData.endact == null || isBlocked
              }
            />
          </div>
        </div>
        {/* Encargado Auditoria Externa*/}
        <div>
          <label className="block text-sm font-medium mb-2">
            Encargado auditoría externa
          </label>
          <input
            type="text"
            name="personext"
            value={formData.personext}
            onChange={handleChange}
            rows="4"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Nombre del encargado externo..."
            required
            disabled={mode === "view" || isBlocked}
          />
        </div>
        {/* Encargado Auditoria Interna*/}
        <div>
          <label className="block text-sm font-medium mb-2">
            Encargado auditoría interna
          </label>
          <input
            type="text"
            name="personint"
            value={formData.personint}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Nombre del encargado interno..."
            required
            disabled={mode === "view" || isBlocked}
          />
        </div>
        {/* Evidencias */}
        <div className="grid grid-cols-5 gap-2">
          <label className="block text-lg font-medium col-span-5 ">
            Fotos de la auditoría
          </label>
          <div className="w-full flex flex-col items-center">
            <label className="font-semibold text-center">Foto 1</label>
            {(isEditing || mode == "create") && !isBlocked ? (
              <FileChooser
                onChange={(file) => handleDocumentChange("photo1", file)}
                accept={".jpg"}
                label={
                  photoData.photo1 ? photoData.photo1.name : "Cargar Archivo"
                }
                mode="horizontal"
              />
            ) : (
              <p className="text-sm text-gray-600">
                {photoData.photo1 ? photoData.photo1.name : "Sin archivo"}
              </p>
            )}
          </div>
          <div className="w-full flex flex-col items-center">
            <label className="font-semibold text-center">Foto 2</label>
            {(isEditing || mode == "create") && !isBlocked ? (
              <FileChooser
                onChange={(file) => handleDocumentChange("photo2", file)}
                accept={".jpg"}
                label={
                  photoData.photo2 ? photoData.photo2.name : "Cargar Archivo"
                }
                mode="horizontal"
              />
            ) : (
              <p className="text-sm text-gray-600">
                {photoData.photo2 ? photoData.photo2.name : "Sin archivo"}
              </p>
            )}
          </div>
          <div className="w-full flex flex-col items-center">
            <label className="font-semibold text-center">Foto 3</label>
            {(isEditing || mode == "create") && !isBlocked ? (
              <FileChooser
                onChange={(file) => handleDocumentChange("photo3", file)}
                accept={".jpg"}
                label={
                  photoData.photo3 ? photoData.photo3.name : "Cargar Archivo"
                }
                mode="horizontal"
              />
            ) : (
              <p className="text-sm text-gray-600">
                {photoData.photo3 ? photoData.photo3.name : "Sin archivo"}
              </p>
            )}
          </div>
          <div className="w-full flex flex-col items-center">
            <label className="font-semibold text-center">Foto 4</label>
            {(isEditing || mode == "create") && !isBlocked ? (
              <FileChooser
                onChange={(file) => handleDocumentChange("photo4", file)}
                accept={".jpg"}
                label={
                  photoData.photo4 ? photoData.photo4.name : "Cargar Archivo"
                }
                mode="horizontal"
              />
            ) : (
              <p className="text-sm text-gray-600">
                {photoData.photo4 ? photoData.photo4.name : "Sin archivo"}
              </p>
            )}
          </div>
          <div className="w-full flex flex-col items-center">
            <label className="font-semibold text-center">Foto 5</label>
            {(isEditing || mode == "create") && !isBlocked ? (
              <FileChooser
                onChange={(file) => handleDocumentChange("photo5", file)}
                accept={".jpg"}
                label={
                  photoData.photo5 ? photoData.photo5.name : "Cargar Archivo"
                }
                mode="horizontal"
              />
            ) : (
              <p className="text-sm text-gray-600">
                {photoData.photo5 ? photoData.photo5.name : "Sin archivo"}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <label className="block text-lg font-medium col-span-5 ">
            Acta y anexos
          </label>
          <div className="w-full flex flex-col items-center">
            <label className="font-semibold text-center">Acta de Inicio</label>
            {(isEditing || mode == "create") && !isBlocked ? (
              <FileChooser
                onChange={(file) => handleFileChange("startact", file)}
                accept={".jpg"}
                label={
                  filesData.startact
                    ? filesData.startact.name
                    : "Cargar archivo"
                }
                mode="horizontal"
                disabled={mode === "view"}
              />
            ) : (
              <p className="text-sm text-gray-600">
                {filesData.startact ? filesData.startact.name : "Sin archivo"}
              </p>
            )}
          </div>
          <div className="w-full flex flex-col items-center">
            <label className="font-semibold text-center">Acta de cierre</label>
            {(isEditing || mode == "create") && !isBlocked ? (
              <FileChooser
                onChange={(file) => handleFileChange("endact", file)}
                accept={".jpg"}
                label={
                  filesData.endact ? filesData.endact.name : "Cargar archivo"
                }
                mode="horizontal"
                disabled={mode === "create"}
              />
            ) : (
              <p className="text-sm text-gray-600">
                {filesData.endact ? filesData.endact.name : "Sin archivo"}
              </p>
            )}
          </div>
          <div className="w-full flex flex-col items-center">
            <label className="font-semibold text-center">Anexos</label>
            {(isEditing || mode == "create") && !isBlocked ? (
              <FileChooser
                onChange={(file) => handleFileChange("anex", file)}
                accept={".jpg"}
                label={filesData.anex ? filesData.anex.name : "Cargar archivo"}
                mode="horizontal"
                disabled={mode === "create"}
              />
            ) : (
              <p className="text-sm text-gray-600">
                {filesData.anex ? filesData.anex.name : "Sin archivo"}
              </p>
            )}
          </div>
        </div>
        {/* Observaciones */}
        <div>
          <label className="block text-lg font-medium mb-2">
            Observaciones
          </label>

          {/* ✅ Historial completo (solo lectura en modo view) */}
          {mode === "view" && (
            <textarea
              name="observation"
              value={formData.observation}
              readOnly
              rows="6"
              className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-700 resize-none mb-3"
              placeholder="No hay observaciones previas..."
            />
          )}

          {/* ✅ Campo para nueva observación */}
          {((isEditing && !isBlocked) || mode === "create") && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-600">
                {mode === "create"
                  ? "Observaciones iniciales:"
                  : "Agregar nueva observación:"}
              </label>
              <textarea
                value={
                  mode === "create" ? formData.observation : newObservation
                }
                onChange={(e) =>
                  mode === "create"
                    ? handleChange(e)
                    : setNewObservation(e.target.value)
                }
                name={mode === "create" ? "observation" : "newObservation"}
                rows="4"
                className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder={
                  mode === "create"
                    ? "Describe los detalles iniciales de la auditoría..."
                    : "Escribe aquí los cambios o comentarios realizados..."
                }
              />
              {mode === "view" && (
                <div className="flex justify-end">
                  <SimpleButton
                    onClick={handleAddObservation}
                    msj="Agregar observación"
                    bg="bg-blue-500"
                    text="text-white"
                    icon="Plus"
                    type="button"
                  />
                </div>
              )}
            </div>
          )}

          {/* ✅ Mensaje informativo */}
          {!isEditing && mode === "view" && !isBlocked && (
            <p className="text-sm text-gray-500 italic">
              💡 Haz clic en "Editar" para agregar una nueva observación
            </p>
          )}
        </div>

        {/* Botones */}
        <div className="flex gap-2 justify-end pt-4">
          {!isBlocked && (
            <>
              <SimpleButton
                onClick={onClose}
                msj={mode === "view" ? "Cerrar" : "Cancelar"}
                bg="bg-gray-500"
                text="text-white"
                type="button"
              />
              {(mode === "create" || isEditing) && (
                <SimpleButton
                  msj="Guardar"
                  bg="bg-blue-500"
                  text="text-white"
                  type="submit"
                />
              )}
            </>
          )}
          {isBlocked && (
            <SimpleButton
              onClick={onClose}
              msj="Cerrar"
              bg="bg-gray-500"
              text="text-white"
              type="button"
            />
          )}
        </div>
      </form>
    </Modal>
  );
};

export default AuditoryModal;
