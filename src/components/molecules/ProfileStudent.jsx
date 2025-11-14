import { useState } from "react";
import PreviewIMG from "../atoms/PreviewIMG";
import SimpleButton from "../atoms/SimpleButton";
import FileChooser from "../atoms/FileChooser";
import CameraModal from "./CameraModal";
import ExcuseModal from "./ExcuseModal";
import SignatureFormatModal from "./SignatureFormatModal";

const ProfileStudent = ({ data, state = false, onSave }) => {
  console.log("Data en ProfileStudent:", data);
  ///Preguntar el State
  const [isEditing, setIsEditing] = useState(false);
  const [isOpenCamera, setIsOpenCamera] = useState(false);
  const [isOpenExcuse, setIsOpenExcuse] = useState(false);
  const [isOpenSignatureFormat, setIsOpenSignatureFormat] = useState(false);

  // Estados para manejar archivos y previews
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(data.url_photo);
  const [documentFiles, setDocumentFiles] = useState({
    documento3: null,
    documento4: null,
  });

  const [editedData, setEditedData] = useState({
    state_first: data?.state_first || "Ausente",
    state_second: data?.state_second || "Pendiente",
    state_institutional: data?.state_institutional || "Inactivo",
    state_process: data?.state_process || "Incompleto",
    state_beca: data?.state_beca || "No",
  });

  const toggleEditing = () => {
    if (isEditing) {
      // Aquí puedes llamar a la función para guardar los cambios
      handleSaveChanges();
    }
    setIsEditing(!isEditing);
  };
  const handleSaveChanges = () => {
    const updatedData = {
      ...editedData,
      ultima_actualizacion: new Date().toISOString().split("T")[0],
    };

    if (photoFile) {
      if (data.state_first === "Ausente") {
        updatedData.state_first = "Registrado";
      } else {
        if (data.state_second === "Ausente") {
          updatedData.state_second = "Validado";
        }
      }
      ///Pendiente Subir la foto al servidor y obtener la URL
      //updatedData.url_photo = photoPreview;
    }

    if (documentFiles.documento3) {
      updatedData.documento3 = documentFiles.documento3.name;
    }

    if (documentFiles.documento4) {
      updatedData.documento4 = documentFiles.documento4.name;
    }

    if (onSave) {
      onSave(data.identification, updatedData);
    }

    console.log("Cambios guardados:", updatedData);
  };

  const handleImageCapture = (file, preview) => {
    setPhotoFile(file);
    setPhotoPreview(preview);
  };

  const handleDocumentChange = (documentName, file) => {
    setDocumentFiles((prev) => ({
      ...prev,
      [documentName]: file,
    }));
  };
  const handleStateChange = (field, value) => {
    console.log("Cambiando campo:", field, "a valor:", value);
    if (field === "state_institutional" && value === "Inactivo") {
      setEditedData((prev) => ({
        ...prev,
        ["state_process"]: "Retirado",
      }));
    }
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleExcuseSubmit = ({ file }) => {
    if (file) {
      console.log("Archivo de excusa:", file);
    } else {
      console.log("No se adjuntó ningún archivo.");
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="w-11/12 flex flex-col gap-4">
        <div className="w-full flex justify-end">
          <div>
            <SimpleButton
              onClick={toggleEditing}
              msj={isEditing ? "Guardar" : "Editar"}
              bg={isEditing ? "bg-accent" : "bg-secondary"}
              icon={isEditing ? "Save" : "Pencil"}
              text={"text-white"}
            />
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-4 p-4 bg-bg rounded-lg shadow-md">
          <div className="flex flex-col gap-2 items-center justify-center">
            <PreviewIMG path={photoPreview} size="profile" />
          </div>
          <div className="flex flex-col pb-4 lg:col-span-2">
            <h2 className="text-2xl font-semibold pb-4">Información Básica</h2>
            <div className="flex flex-row gap-4 items-center">
              <label className="text-lg font-medium">
                Tipo de Identificación:
              </label>
              <p>{data.identificationType}</p>
            </div>
            <div className="flex flex-row gap-4 items-center">
              <label className="text-lg font-medium">
                Numero de Identificacion:
              </label>
              <p>{data.identification}</p>
            </div>
            <div className="flex flex-row gap-4 items-center">
              <label className="text-lg font-medium">Nombre Completo:</label>
              <p>
                {data.first_name} {data.second_name} {data.first_lastname}{" "}
                {data.second_lastname}
              </p>
            </div>
            <div className="flex flex-row gap-4 items-center">
              <label className="text-lg font-medium">Genero:</label>
              <p>{data.genre}</p>
            </div>
            <div className="flex flex-row gap-4 items-center">
              <label className="text-lg font-medium">Fecha Nacimiento:</label>
              <p>{data.birthday}</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-bg rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold pb-4">Información Escolar</h2>
          <div className="flex flex-row gap-4 items-center">
            <label className="text-lg font-medium">Institución:</label>
            <p>{data.name_school}</p>
          </div>
          <div className="flex flex-row gap-4 items-center">
            <label className="text-lg font-medium">Grado:</label>
            <p>{data.grade_scholar}</p>
          </div>
          <div className="flex flex-row gap-4 items-center">
            <label className="text-lg font-medium">Grupo:</label>
            <p>{data.group_grade}</p>
          </div>
          <div className="flex flex-row gap-4 items-center">
            <label className="text-lg font-medium">Becado:</label>
            {isEditing ? (
              <select
                value={editedData.state_beca}
                onChange={(e) =>
                  handleStateChange("state_beca", e.target.value)
                }
                className="border p-2 rounded bg-white"
              >
                <option value="Si">Si</option>
                <option value="No">No</option>
              </select>
            ) : (
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  editedData.state_beca === "Si"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {editedData.state_beca}
              </span>
            )}
          </div>
        </div>
        <div className="p-4 bg-bg rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold pb-4">Informacion Familiar</h2>
          <div className="flex flex-row gap-4 items-center">
            <label className="text-lg font-medium">
              Tipo Documento Acudiente:
            </label>
            <p>{data.tipo_documento_acudiente}</p>
          </div>
          <div className="flex flex-row gap-4 items-center">
            <label className="text-lg font-medium">
              Número Identificación Acudiente:
            </label>
            <p>{data.numero_identificacion_acudiente}</p>
          </div>
          <div className="flex flex-row gap-4 items-center">
            <label className="text-lg font-medium">Nombre Acudiente:</label>
            <p>{data.nombre_acudiente}</p>
          </div>
          <div className="flex flex-row gap-4 items-center">
            <label className="text-lg font-medium">Teléfono Acudiente:</label>
            <p>{data.telefono_acudiente}</p>
          </div>
        </div>
        <div className="p-4 bg-bg rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold pb-4">
            Estados del Estudiante
          </h2>

          <div className="flex flex-col gap-3">
            {/* Estado Primera Etapa */}
            <div className="flex flex-row gap-4 items-center">
              <label className="text-lg font-medium w-48">Primera Etapa:</label>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  editedData.state_first === "Registrado"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {editedData.state_first}
              </span>
              {data.state_first === "Ausente" ? (
                <div className="w-1/5">
                  <SimpleButton
                    onClick={() => setIsOpenCamera(true)}
                    msj="Tomar Foto"
                    bg="bg-accent"
                    icon="Camera"
                    text="text-white"
                  />
                </div>
              ) : null}
            </div>
            <div className="flex flex-row gap-4 items-center">
              <label className="text-lg font-medium w-48">Segunda Etapa:</label>

              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  editedData.state_second === "Validado"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {editedData.state_second}
              </span>
              {data.state_first === "Registrado" &&
                data.state_second === "Ausente" && (
                  <div className="w-1/5">
                    <SimpleButton
                      onClick={() => setIsOpenCamera(true)}
                      msj="Tomar Foto"
                      bg="bg-accent"
                      icon="Camera"
                      text="text-white"
                    />
                  </div>
                )}
            </div>

            {/* Estado Institucional */}
            <div className="flex flex-row gap-4 items-center">
              <label className="text-lg font-medium w-48">
                Estado Institucional:
              </label>
              {isEditing ? (
                <select
                  value={editedData.state_institutional}
                  onChange={(e) =>
                    handleStateChange("state_institutional", e.target.value)
                  }
                  className="border p-2 rounded bg-white"
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              ) : (
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    editedData.state_institutional === "Activo"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {editedData.state_institutional}
                </span>
              )}
            </div>

            {/* Estado Proceso */}
            <div className="flex flex-row gap-4 items-center">
              <label className="text-lg font-medium w-48">
                Estado Proceso:
              </label>
              {isEditing ? (
                <div className="flex flex-row gap-2 ">
                  <select
                    value={editedData.state_process}
                    onChange={(e) =>
                      handleStateChange("state_process", e.target.value)
                    }
                    className="border p-2 rounded bg-white"
                  >
                    <option value="Completo">Completo</option>
                    <option value="Retirado">Retirado</option>
                    <option value="Excusa">Excusa</option>
                  </select>
                  {editedData.state_process === "Excusa" && (
                    <SimpleButton
                      onClick={() => setIsOpenExcuse(true)}
                      msj="Cargar Excusa"
                      bg="bg-accent"
                      icon="Save"
                      text="text-white"
                    />
                  )}
                </div>
              ) : (
                <div className="flex  flex-row gap-2 items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      editedData.state_process === "Correcto" ||
                      editedData.state_process === "Completo"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {editedData.state_process}
                  </span>
                  {editedData.state_process === "Excusa" && (
                    <SimpleButton
                      onClick={() => setIsOpenExcuse(true)}
                      msj="Mostrar Excusa"
                      bg="bg-accent"
                      icon="Save"
                      text="text-white"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-4 bg-bg rounded-lg shadow-md flex flex-col gap-2">
          <h2 className="text-2xl font-semibold pb-4">Documentos Auditoria</h2>
          <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
            <label className="text-lg font-medium">Habeas Data:</label>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold w-20 ${
                data.auDoc_habeas
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {data.auDoc_habeas ? "Cargado" : "No cargado"}
            </span>
          </div>
          <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
            <label className="text-lg font-medium">Ficha Matricula:</label>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold w-20 ${
                data.auDoc_matricula
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {data.auDoc_matricula ? "Cargado" : "No cargado"}
            </span>
          </div>
          <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
            <label className="text-lg font-medium lg:col-span-1">
              Identificación Acudiente:
            </label>
            {!isEditing ? (
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold text-center w-20 ${
                  data.auDoc_idAcudiente
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {data.auDoc_idAcudiente ? "Cargado" : "No cargado"}
              </span>
            ) : (
              <div className="lg:col-span-2 flex justify-end">
                <FileChooser
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(file) => handleDocumentChange("documento3", file)}
                  label={
                    documentFiles.documento3
                      ? documentFiles.documento3.name
                      : "Seleccionar archivo"
                  }
                />
              </div>
            )}
          </div>
          <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4 lg:items-center">
            <label className="text-lg font-medium lg:col-span-1">
              Identificación Estudiante:
            </label>
            {!isEditing ? (
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold text-center w-20 ${
                  data.auDoc_idAcudiente
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {data.auDoc_idAcudiente ? "Cargado" : "No cargado"}
              </span>
            ) : (
              <div className="lg:col-span-2 flex justify-end">
                <FileChooser
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(file) => handleDocumentChange("documento4", file)}
                  label={
                    documentFiles.documento4
                      ? documentFiles.documento4.name
                      : "Seleccionar archivo"
                  }
                />
              </div>
            )}
          </div>
          <div className="w-full grid grid-cols-1 lg:grid-cols-5 gap-4 lg:items-center">
            <label className="text-lg font-medium lg:col-span-2">
              Autorización Firma:
            </label>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold text-center w-30 ${
                data.auDoc_signatureFormat
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {data.auDoc_signatureFormat ? "Cargado" : "No cargado"}
            </span>
            <div className="lg:col-span-2 flex justify-end">
              <SimpleButton
                onClick={() => setIsOpenSignatureFormat(true)}
                msj={
                  data.auDoc_signatureFormat ? "Ver Formato" : "Cargar Formato"
                }
                bg="bg-accent"
                icon="Eye"
                text="text-white"
              />
            </div>
          </div>
        </div>
        <div className="p-4 bg-bg rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold pb-4">Historial</h2>
          <p>Fecha de Ingreso: {data.fecha_ingreso}</p>
          <p>Ultima Actualización: {data.ultima_actualizacion}</p>
        </div>
      </div>
      <CameraModal
        isOpen={isOpenCamera}
        onClose={() => setIsOpenCamera(false)}
        onImageCapture={handleImageCapture}
      />
      <ExcuseModal
        isOpen={isOpenExcuse}
        onClose={() => setIsOpenExcuse(false)}
        mode={isEditing ? "upload" : "view"}
        onSubmit={handleExcuseSubmit}
      />
      <SignatureFormatModal
        idEstudiante={data.identification}
        isOpen={isOpenSignatureFormat}
        onClose={() => setIsOpenSignatureFormat(false)}
      />
    </div>
  );
};

export default ProfileStudent;
