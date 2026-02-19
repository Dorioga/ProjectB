import { useState, useEffect } from "react";
import PreviewIMG from "../atoms/PreviewIMG";
import PeriodSelector from "../atoms/PeriodSelector";
import SimpleButton from "../atoms/SimpleButton";
import FileChooser from "../atoms/FileChooser";
import CameraModal from "./CameraModal";
import ExcuseModal from "./ExcuseModal";
import PDFViewerModal from "./PDFViewerModal.jsx";
import { formatDateToDisplay } from "../../utils/formatUtils";

const ProfileStudent = ({
  data,
  state = false,
  onSave,
  initialEditing = false,
}) => {
  console.log(" 123 Data en ProfileStudent:", data);
  ///Preguntar el State
  const [isEditing, setIsEditing] = useState(Boolean(initialEditing));

  // Si la prop initialEditing cambia (abrir en modo edición), sincronizar el estado local
  useEffect(() => {
    setIsEditing(Boolean(initialEditing));
  }, [initialEditing]);

  const [isOpenCamera, setIsOpenCamera] = useState(false);
  const [isOpenExcuse, setIsOpenExcuse] = useState(false);
  const [isOpenDocument, setIsOpenDocument] = useState(false);
  const [documentSelected, setDocumentSelected] = useState({
    file: null,
    name: "",
  });

  // Estados para manejar archivos y previews
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(
    data.link_foto || data.url_photo,
  );
  const [documentFiles, setDocumentFiles] = useState({
    id_Student: null,
    id_Acudiente: null,
    piar: null,
  });

  const [editedData, setEditedData] = useState({
    state_first: data?.nombre_primera_etapa || data?.state_first || "Pendiente",
    state_second:
      data?.nombre_segunda_etapa || data?.state_second || "Pendiente",
    state_beca: data?.status_beca || data?.state_beca || "Activo",
    state_process: data?.nombre_proceso || data?.state_process || "Conforme",
    first_name: data?.primero_nombre || data?.first_name || "",
    second_name: data?.segundo_nombre || data?.second_name || "",
    first_lastname: data?.primer_apellido || data?.first_lastname || "",
    second_lastname: data?.segundo_apellido || data?.second_lastname || "",
    // Periodo de ingreso (editable)
    periodo_ingreso: data?.periodo_ingreso || data?.fk_periodo_ingreso || "",
  });

  // Selectores para sede y jornada
  const [selectedSede, setSelectedSede] = useState(
    data?.id_sede || data?.sede_id || "",
  );
  const [selectedJourney, setSelectedJourney] = useState(
    data?.jornada_estudiante || data?.fk_journey || data?.fk_jornada || "",
  );

  // Estado para PIAR (checkbox + posible archivo)
  const [hasPiar, setHasPiar] = useState(
    Boolean(data?.cuenta_piar || data?.auDoc_piar || data?.link_piar),
  );

  useEffect(() => {
    // Sincronizar selects cuando cambian los datos
    setSelectedSede(data?.id_sede || data?.sede_id || "");
    setSelectedJourney(data?.fk_journey || data?.fk_jornada || "");
  }, [data]);

  // Sincronizar el checkbox PIAR cuando cambian los datos
  useEffect(() => {
    setHasPiar(
      Boolean(data?.cuenta_piar || data?.auDoc_piar || data?.link_piar),
    );
  }, [data]);

  const toggleEditing = () => {
    if (isEditing) {
      // Aquí puedes llamar a la función para guardar los cambios
      handleSaveChanges();
    }
    setIsEditing(!isEditing);
  };
  const handleSaveChanges = () => {
    // Mapear state_process a process_id
    const processIdMap = {
      Conforme: "2",
      Completo: "2",
      Retirado: "3",
      SinExcusa: "4",
      Excusa: "5",
      Reasignado: "6",
    };

    // Mapear state_beca a fk_beca
    const becaIdMap = {
      Activo: 1,
      Retirado: 0,
    };

    // Construir el payload según el formato requerido
    const updatedData = {
      first_name: editedData.first_name,
      second_name: editedData.second_name,
      first_lastname: editedData.first_lastname,
      second_lastname: editedData.second_lastname,
      phone: data.telefono_acudiente || data.telephone || data.phone || "",
      identification_number:
        data.numero_identificacion || data.identification || "",
      email: data.email || data.correo_electronico || "",
      birth_date: data.fecha_nacimiento || data.birthday || "",
      process_id: processIdMap[editedData.state_process] || "2",
      gender: data.genero || data.genre || "",
      photo_link: photoPreview || data.link_foto || data.url_photo || "",
      identification_link:
        data.auDoc_idEstudiante || data.link_identificacion || "",
      nui: data.nui || "",
      per_id: data.per_id || "",
      fk_beca: becaIdMap[editedData.state_beca] ?? 1,
      // Periodo de ingreso
      periodo_ingreso: editedData.periodo_ingreso || data.periodo_ingreso || "",
      fk_periodo_ingreso: editedData.periodo_ingreso
        ? Number(editedData.periodo_ingreso)
        : data.fk_periodo_ingreso
          ? Number(data.fk_periodo_ingreso)
          : null,
      // PIAR
      cuenta_piar: hasPiar,
    };

    // Si hay archivos nuevos, actualizar los links correspondientes
    if (photoFile) {
      // La foto se subirá y se actualizará el photo_link
      updatedData.photo_link = photoPreview;
    }

    if (documentFiles.id_Student) {
      // El documento se subirá y se actualizará el identification_link
      updatedData.identification_link = ""; // Se actualizará después de subir
    }

    // PIAR (archivo Excel)
    if (documentFiles.piar) {
      // Se subirá y el backend deberá devolver el enlace en la respuesta
      updatedData.piar_link = "";
    }

    if (onSave) {
      const studentId = data.id_estudiante ?? data.identification;
      const personId = data.id_persona ?? data.id_person ?? null;
      if (!personId) {
        console.warn(
          "ProfileStudent: personId (per_id) no encontrado en student data",
          data,
        );
      }
      onSave(studentId, personId, updatedData);
    }

    console.log("Payload para actualización:", updatedData);
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
    if (field === "state_beca" && value === "Retirado") {
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
          <div className="grid grid-cols-2 gap-2">
            <SimpleButton
              onClick={toggleEditing}
              msj={isEditing ? "Guardar" : "Editar"}
              bg={isEditing ? "bg-accent" : "bg-secondary"}
              icon={isEditing ? "Save" : "Pencil"}
              text={"text-surface"}
            />
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-4 p-4 bg-bg rounded-lg shadow-md">
          <div className="flex flex-col gap-2 items-center justify-center">
            <PreviewIMG path={photoPreview} size="profile" />
          </div>
          <div className="flex flex-col pb-4 lg:col-span-2">
            <h2 className="text-2xl font-semibold pb-4">Información básica</h2>
            <div className="flex flex-row gap-4 items-center">
              <label className="text-lg font-medium">
                Tipo de identificación:
              </label>
              <p>
                {data.identificationType ||
                  (data.fk_tipo_identificacion === "4"
                    ? "Tarjeta de Identidad"
                    : "Cédula de Ciudadanía")}
              </p>
            </div>
            <div className="flex flex-row gap-4 items-center">
              <label className="text-lg font-medium">
                Número de identificación:
              </label>
              <p>{data.numero_identificacion || data.identification}</p>
            </div>
            <div className="flex flex-row gap-4 items-center">
              <label className="text-lg font-medium">Primer nombre:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.first_name}
                  onChange={(e) =>
                    handleStateChange("first_name", e.target.value)
                  }
                  className="border p-2 rounded bg-surface"
                />
              ) : (
                <p>{editedData.first_name}</p>
              )}
            </div>
            <div className="flex flex-row gap-4 items-center">
              <label className="text-lg font-medium">Segundo nombre:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.second_name}
                  onChange={(e) =>
                    handleStateChange("second_name", e.target.value)
                  }
                  className="border p-2 rounded bg-surface"
                />
              ) : (
                <p>{editedData.second_name}</p>
              )}
            </div>
            <div className="flex flex-row gap-4 items-center">
              <label className="text-lg font-medium">Primer apellido:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.first_lastname}
                  onChange={(e) =>
                    handleStateChange("first_lastname", e.target.value)
                  }
                  className="border p-2 rounded bg-surface"
                />
              ) : (
                <p>{editedData.first_lastname}</p>
              )}
            </div>
            <div className="flex flex-row gap-4 items-center">
              <label className="text-lg font-medium">Segundo apellido:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.second_lastname}
                  onChange={(e) =>
                    handleStateChange("second_lastname", e.target.value)
                  }
                  className="border p-2 rounded bg-surface"
                />
              ) : (
                <p>{editedData.second_lastname}</p>
              )}
            </div>
            <div className="flex flex-row gap-4 items-center">
              <label className="text-lg font-medium">Género:</label>
              <p>{data.genero || data.genre}</p>
            </div>
            <div className="flex flex-row gap-4 items-center">
              <label className="text-lg font-medium">
                Fecha de nacimiento:
              </label>
              <p>
                {formatDateToDisplay(data.fecha_nacimiento || data.birthday)}
              </p>
            </div>
            <div className="flex flex-row gap-4 items-center">
              <label className="text-lg font-medium">PER ID:</label>
              <p>{data.per_id}</p>
            </div>
            <div className="flex flex-row gap-4 items-center">
              <label className="text-lg font-medium">NUI:</label>
              <p>{data.nui}</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-bg rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold pb-4">Información escolar</h2>
          <div className="flex flex-row gap-4 items-center">
            <label className="text-lg font-medium">Institución:</label>
            <p>{data.nombre_sede || data.name_school}</p>
          </div>
          <div className="flex flex-row gap-4 items-center">
            <label className="text-lg font-medium">Grado:</label>
            <p>{data.nombre_grado || data.grade_scholar}</p>
          </div>
          <div className="flex flex-row gap-4 items-center">
            <label className="text-lg font-medium">Grupo:</label>
            <p>{data.grupo || data.group_grade}</p>
          </div>

          <div className="flex flex-row gap-4 items-center">
            <label className="text-lg font-medium">Periodo de ingreso:</label>
            {isEditing ? (
              <PeriodSelector
                name="periodo_ingreso"
                label={false}
                value={editedData.periodo_ingreso}
                onChange={(e) =>
                  handleStateChange("periodo_ingreso", e.target.value)
                }
                className="w-full p-2 border rounded bg-surface"
              />
            ) : (
              <p>
                {data.nombre_periodo ||
                  data.periodo_ingreso ||
                  data.fk_periodo_ingreso ||
                  "No registrado"}
              </p>
            )}
          </div>

          <div className="flex flex-row gap-4 items-center">
            <label className="text-lg font-medium">Jornada:</label>
            <p>{data.nombre_jornada_estudiante}</p>
          </div>
        </div>
        <div className="p-4 bg-bg rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold pb-4">Información familiar</h2>
          <div className="flex flex-row gap-4 items-center">
            <label className="text-lg font-medium">
              Tipo Documento Acudiente:
            </label>
            <p>
              {data.tipo_documento_acudiente ||
                (data.fk_tipo_identificacion_acudiente === "4"
                  ? "Tarjeta de Identidad"
                  : "Cédula de Ciudadanía")}
            </p>
          </div>
          <div className="flex flex-row gap-4 items-center">
            <label className="text-lg font-medium">
              Número Identificación Acudiente:
            </label>
            <p>{data.numero_identificacion_acudiente}</p>
          </div>
          <div className="flex flex-row gap-4 items-center">
            <label className="text-lg font-medium">Nombre Acudiente:</label>
            <p>
              {data.nombre_acudiente ||
                `${data.primero_nombre_acudiente || ""} ${data.segundo_nombre_acudiente || ""} ${data.primer_apellido_acudiente || ""} ${data.segundo_apellido_acudiente || ""}`.trim()}
            </p>
          </div>
          <div className="flex flex-row gap-4 items-center">
            <label className="text-lg font-medium">Teléfono Acudiente:</label>
            <p>
              {data.telefono_acudiente || data.telephone || "No registrado"}
            </p>
          </div>
        </div>
        <div className="p-4 bg-bg rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold pb-4">
            Estados del estudiante
          </h2>

          <div className="flex flex-col gap-3">
            {/* Estado Primera Etapa */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <label className="text-lg font-medium w-48">Primera Etapa:</label>
              <span
                className={`px-3 py-1 rounded-lg text-sm font-semibold text-center border border-solid  ${
                  editedData.state_first === "Registrado"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {editedData.state_first}
              </span>
              {data.state_first === "Ausente" ||
              data.nombre_primera_etapa === "Pendiente" ? (
                <div className="">
                  <SimpleButton
                    onClick={() => setIsOpenCamera(true)}
                    msj="Tomar foto"
                    bg="bg-accent"
                    icon="Camera"
                    text="text-surface"
                  />
                </div>
              ) : null}
            </div>
            {/* Estado Segunda Etapa */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <label className="text-lg font-medium w-48">Segunda Etapa:</label>

              <span
                className={`px-3 py-1 rounded-lg text-sm font-semibold text-center border border-solid  ${
                  editedData.state_second === "Validado"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {editedData.state_second}
              </span>
              {(data.state_first === "Registrado" ||
                data.nombre_primera_etapa === "Registrado") &&
                (data.state_second === "Ausente" ||
                  data.nombre_segunda_etapa === "Pendiente") && (
                  <div className="">
                    <SimpleButton
                      onClick={() => setIsOpenCamera(true)}
                      msj="Tomar Foto"
                      bg="bg-accent"
                      icon="Camera"
                      text="text-surface"
                    />
                  </div>
                )}
            </div>

            {/* Estado Institucional */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <label className="text-lg font-medium w-48">
                Estado de la beca:
              </label>

              {isEditing ? (
                <select
                  value={editedData.state_beca}
                  onChange={(e) =>
                    handleStateChange("state_beca", e.target.value)
                  }
                  className="border p-2 rounded bg-surface text-center"
                >
                  <option value="Activo">Activo</option>
                  <option value="Retirado">Retirado</option>
                </select>
              ) : (
                <span
                  className={`px-3 py-1 rounded-lg text-sm font-semibold text-center border border-solid  ${
                    editedData.state_beca === "Activo"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {editedData.state_beca}
                </span>
              )}
            </div>

            {/* Estado Proceso */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <label className="text-lg font-medium w-48">
                Estado del proceso:
              </label>

              {isEditing ? (
                <select
                  value={editedData.state_process}
                  onChange={(e) =>
                    handleStateChange("state_process", e.target.value)
                  }
                  className="border p-2 rounded bg-surface text-center"
                >
                  <option value="Conforme">Completo</option>
                  <option value="Retirado">Retirado</option>
                  <option value="SinExcusa">Sin Excusa</option>
                  <option value="Excusa">Excusa</option>
                </select>
              ) : (
                <span
                  className={`px-3 py-1 rounded-lg text-sm font-semibold text-center border border-solid  ${
                    editedData.state_process === "Conforme"
                      ? "bg-green-100 text-green-800"
                      : editedData.state_process === "Retirado"
                        ? "bg-gray-100 text-gray-800"
                        : editedData.state_process === "Reasignado"
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-red-100 text-red-800"
                  }`}
                >
                  {editedData.state_process}
                </span>
              )}

              {(editedData.state_process === "Excusa" ||
                editedData.state_process === "SinExcusa") && (
                <SimpleButton
                  onClick={() => setIsOpenExcuse(true)}
                  msj={isEditing ? "Cargar excusa" : "Ver excusa"}
                  bg="bg-accent"
                  icon="Save"
                  text="text-surface"
                />
              )}
            </div>
          </div>
        </div>
        <div className="p-4 bg-bg rounded-lg shadow-md flex flex-col gap-2">
          <h2 className="text-2xl font-semibold pb-4">Documentos Auditoria</h2>

          <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
            <label className="text-lg font-medium">Ficha de matrícula:</label>
            <span
              className={`px-3 py-1 rounded-lg text-sm font-semibold text-center border border-solid  ${
                String(data?.auDoc_matricula || "").includes("https://")
                  ? "bg-green-100 text-green-800 border-green-200 "
                  : "bg-yellow-100 text-yellow-800 border-yellow-200 "
              }`}
            >
              {String(data?.auDoc_matricula || "").includes("https://")
                ? "Cargado"
                : "No cargado"}
            </span>

            {String(data?.auDoc_matricula || "").includes("https://") && (
              <SimpleButton
                onClick={() => {
                  setIsOpenDocument(true);
                  setDocumentSelected({
                    file: data.auDoc_matricula,
                    name: "Documento Matricula",
                  });
                }}
                msj="Ver Documento"
                bg="bg-accent"
                icon="View"
                text="text-surface"
              />
            )}
          </div>

          {/* PIAR - checkbox + FileChooser (edit) / descarga (view) */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
            <label className="text-lg font-medium">Cuenta con PIAR:</label>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={hasPiar}
                disabled={!isEditing}
                onChange={(e) => setHasPiar(!!e.target.checked)}
                className="w-4 h-4"
              />
              <span
                className={`px-3 py-1 rounded-lg text-sm font-semibold text-center border border-solid  ${
                  hasPiar
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-yellow-100 text-yellow-800 border-yellow-200"
                }`}
              >
                {hasPiar ? "Sí" : "No"}
              </span>
            </div>

            {isEditing ? (
              hasPiar ? (
                <div className="flex">
                  <FileChooser
                    accept=".xlsx,.xls"
                    onChange={(file) => handleDocumentChange("piar", file)}
                    label={
                      documentFiles.piar
                        ? documentFiles.piar.name
                        : "Cargar (.xlsx)"
                    }
                  />
                </div>
              ) : (
                <div />
              )
            ) : String(data?.auDoc_piar || "").includes("https://") ||
              data?.link_piar ? (
              <a
                className="text-primary underline"
                href={data.auDoc_piar || data?.link_piar}
                target="_blank"
                rel="noreferrer"
              >
                Descargar PIAR
              </a>
            ) : (
              <div />
            )}
          </div>
          <div
            className={`w-full grid grid-cols-1  gap-4 items-center ${
              documentFiles.id_Acudiente ? "grid-cols-5" : "grid-cols-3"
            }`}
          >
            <label className="text-lg font-medium lg:col-span-1">
              Identificación Acudiente:
            </label>
            <span
              className={`px-3 py-1 rounded-lg text-sm font-semibold text-center border border-solid  ${
                String(data?.auDoc_idAcudiente || "").includes("https://") ||
                data?.link_identificacion_acudiente
                  ? "bg-green-100 text-green-800 border-green-200 "
                  : "bg-yellow-100 text-yellow-800 border-yellow-200 "
              }`}
            >
              {String(data?.auDoc_idAcudiente || "").includes("https://") ||
              data?.link_identificacion_acudiente
                ? "Cargado"
                : "No cargado"}
            </span>
            {isEditing ? (
              <div
                className={`flex  ${
                  documentFiles.id_Acudiente ? "col-span-3" : "col-span-1"
                }`}
              >
                <FileChooser
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(file) =>
                    handleDocumentChange("id_Acudiente", file)
                  }
                  label={
                    documentFiles.id_Acudiente
                      ? documentFiles.id_Acudiente.name
                      : "Cargar archivo"
                  }
                />
              </div>
            ) : String(data?.auDoc_idAcudiente || "").includes("https://") ||
              data?.link_identificacion_acudiente ? (
              <SimpleButton
                onClick={() => {
                  setIsOpenDocument(true);
                  setDocumentSelected({
                    file:
                      data.auDoc_idAcudiente ||
                      data.link_identificacion_acudiente,
                    name: "Documento Acudiente",
                  });
                }}
                msj="Ver Documento"
                bg="bg-accent"
                icon="View"
                text="text-surface"
              />
            ) : (
              <FileChooser
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(file) => handleDocumentChange("id_Acudiente", file)}
                label={
                  documentFiles.id_Acudiente
                    ? documentFiles.id_Acudiente.name
                    : "Cargar archivo"
                }
              />
            )}
          </div>
          <div
            className={`w-full grid grid-cols-1  gap-4 items-center ${
              documentFiles.id_Student ? "grid-cols-5" : "grid-cols-3"
            }`}
          >
            <label className="text-lg font-medium lg:col-span-1">
              Identificación Estudiante:
            </label>
            <span
              className={`px-3 py-1 rounded-lg text-sm font-semibold text-center border border-solid  ${
                String(data?.auDoc_idEstudiante || "").includes("https://") ||
                data?.link_identificacion
                  ? "bg-green-100 text-green-800 border-green-200 "
                  : "bg-yellow-100 text-yellow-800 border-yellow-200 "
              }`}
            >
              {String(data?.auDoc_idEstudiante || "").includes("https://") ||
              data?.link_identificacion
                ? "Cargado"
                : "No cargado"}
            </span>
            {isEditing ? (
              <div
                className={`flex  ${
                  documentFiles.id_Student ? "col-span-3" : "col-span-1"
                }`}
              >
                <FileChooser
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(file) => handleDocumentChange("id_Student", file)}
                  label={
                    documentFiles.id_Student
                      ? documentFiles.id_Student.name
                      : "Cargar archivo"
                  }
                />
              </div>
            ) : String(data?.auDoc_idEstudiante || "").includes("https://") ||
              data?.link_identificacion ? (
              <SimpleButton
                onClick={() => {
                  setIsOpenDocument(true);
                  setDocumentSelected({
                    file: data.auDoc_idEstudiante || data.link_identificacion,
                    name: "Documento Estudiante",
                  });
                }}
                msj="Ver Documento"
                bg="bg-accent"
                icon="View"
                text="text-surface"
              />
            ) : (
              <FileChooser
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(file) => handleDocumentChange("id_Student", file)}
                label={
                  documentFiles.id_Student
                    ? documentFiles.id_Student.name
                    : "Cargar archivo"
                }
              />
            )}
          </div>
        </div>
        <div className="p-4 bg-bg rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold pb-4">Historial</h2>
          <p>Fecha de ingreso: {data.fecha_ingreso}</p>
          <p>Última actualización: {data.ultima_actualizacion}</p>
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

      <PDFViewerModal
        isOpen={isOpenDocument}
        onClose={() => setIsOpenDocument(false)}
        pdfUrl={documentSelected.file}
        title={documentSelected.name}
      />
    </div>
  );
};

export default ProfileStudent;
