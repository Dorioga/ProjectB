import { useState, useEffect, useCallback } from "react";
import useAuth from "../../lib/hooks/useAuth";
import PreviewIMG from "../atoms/PreviewIMG";
import PeriodSelector from "../atoms/PeriodSelector";
import SimpleButton from "../atoms/SimpleButton";
import FileChooser from "../atoms/FileChooser";
import CameraModal from "./CameraModal";
import ExcuseModal from "./ExcuseModal";
import PDFViewerModal from "./PDFViewerModal.jsx";
import { formatDateToDisplay } from "../../utils/formatUtils";
import { upload } from "../../services/uploadService";
import { useNotify } from "../../lib/hooks/useNotify";
import tourProfileStudent from "../../tour/tourProfileStudent";

const ProfileStudent = ({
  data,
  state = false,
  onSave,
  initialEditing = false,
  showStates = true,
}) => {
  const notify = useNotify();
  const { nameRole } = useAuth();
  const isDocente = String(nameRole ?? "")
    .toLowerCase()
    .includes("docente");
  const [isTourMode, setIsTourMode] = useState(false);

  const startTour = useCallback(() => {
    setIsTourMode(true);
    tourProfileStudent();
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
  }, []);

  console.log(" 123 Data en ProfileStudent:", data);
  ///Preguntar el State
  const [isEditing, setIsEditing] = useState(Boolean(initialEditing));

  // Si la prop initialEditing cambia (abrir en modo edición), sincronizar el estado local
  useEffect(() => {
    setIsEditing(Boolean(initialEditing));
  }, [initialEditing]);

  const [isOpenCamera, setIsOpenCamera] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    periodo_ingreso: data?.perido_ingreso || data?.fk_periodo_ingreso || "",
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

  const toggleEditing = async () => {
    if (isEditing) {
      setIsSubmitting(true);
      try {
        await handleSaveChanges();
      } finally {
        setIsSubmitting(false);
      }
    }
    setIsEditing(!isEditing);
  };
  const handleSaveChanges = async () => {
    // Validar que si PIAR está activado, debe haber un archivo (nuevo o ya existente)
    const piarYaExiste = Boolean(data?.link_piar || data?.auDoc_piar);
    if (hasPiar && !piarYaExiste && !documentFiles.piar) {
      notify.error(
        "El PIAR está activado. Debes adjuntar el archivo de soporte antes de guardar.",
      );
      return;
    }

    // Mapear state_process a process_id
    const processIdMap = {
      Conforme: "1",
      Excusa: "2",
      SinExcusa: "3",
      Retirado: "4",
      Reasignado: "5",
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
      updatedData.photo_link = photoPreview;
    }

    // ── Subida de archivos (identificación y/o PIAR) ───────────────────────
    const hasIdFile = Boolean(documentFiles.id_Student);
    const hasPiarFile = Boolean(hasPiar && documentFiles.piar);

    if (hasIdFile || hasPiarFile) {
      try {
        const form = new FormData();
        form.append(
          "identificacion",
          data.numero_identificacion || data.identification || "",
        );
        if (hasIdFile) {
          form.append("cedulaEstudiante", documentFiles.id_Student);
        }
        if (hasPiarFile) {
          form.append("soporteExcel", documentFiles.piar);
        }

        const res = await upload(form, "upload/estudiantes");

        if (res && res.status === 200 && Array.isArray(res.data)) {
          res.data.forEach((entry) => {
            if (entry.field === "cedulaEstudiante") {
              updatedData.identification_link = "yes";
            } else if (entry.field === "soporteExcel") {
              updatedData.link_piar = "yes";
            }
          });
        }
      } catch (err) {
        console.error("Error subiendo archivos en ProfileStudent:", err);
      }
    }
    const hasGuardianIdFile = Boolean(documentFiles.id_Acudiente);

    if (hasGuardianIdFile) {
      try {
        const form = new FormData();
        form.append("identificacion", data.numero_identificacion_acudiente);
        form.append("cedulaAcudiente", documentFiles.id_Acudiente);

        const res = await upload(form, "upload/acudientes");
      } catch (err) {
        console.error(
          "Error subiendo cédula de acudiente en ProfileStudent:",
          err,
        );
      }
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
      console.log(
        "Invocando onSave con studentId:",
        studentId,
        "personId:",
        personId,
        "updatedData:",
        updatedData,
      );
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
        <div id="tour-ps-edit" className="w-full flex justify-end">
          <div className="flex gap-2">
            {!isDocente && (
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
            )}
            {!isDocente && isEditing && (
              <SimpleButton
                onClick={() => setIsEditing(false)}
                msj="Cancelar"
                bg="bg-secondary"
                icon="X"
                text="text-surface"
              />
            )}
            {!isDocente && (
              <SimpleButton
                onClick={() => setIsEditing(true)}
                msj="Editar"
                bg="bg-primary"
                icon="Pencil"
                text="text-surface"
                disabled={isEditing}
              />
            )}
          </div>
        </div>
        <div
          id="tour-ps-basic-info"
          className="grid lg:grid-cols-3 gap-4 p-4 bg-bg rounded-lg shadow-md"
        >
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
        <div
          id="tour-ps-school-info"
          className="p-4 bg-bg rounded-lg shadow-md"
        >
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
                  data.perido_ingreso ||
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
        <div
          id="tour-ps-family-info"
          className="p-4 bg-bg rounded-lg shadow-md"
        >
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
        {showStates && (
          <div id="tour-ps-states" className="p-4 bg-bg rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold pb-4">
              Estados del estudiante
            </h2>

            <div className="flex flex-col gap-3">
              {/* Estado Primera Etapa */}
              <div className="grid grid-cols-3 gap-4 items-center">
                <label className="text-lg font-medium w-48">
                  Primera Etapa:
                </label>
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
                <label className="text-lg font-medium w-48">
                  Segunda Etapa:
                </label>

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
                    <option value="Conforme">Conforme</option>
                    <option value="Retirado">Retirado</option>
                    <option value="SinExcusa">Sin Excusa</option>
                    <option value="Excusa">Excusa</option>
                    <option value="Reasignado">Reasignado</option>
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
        )}
        <div
          id="tour-ps-documents"
          className="p-4 bg-bg rounded-lg shadow-md flex flex-col gap-2"
        >
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
          <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
            <label className="text-lg font-medium">Cuenta con PIAR:</label>

            <div className="flex w-full items-center justify-center gap-3 col-span-2">
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
              {hasPiar && (
                <div className="flex">
                  <FileChooser
                    editing={isEditing}
                    accept=".xlsx,.xls"
                    onChange={(file) => handleDocumentChange("piar", file)}
                    label={
                      documentFiles.piar
                        ? documentFiles.piar.name
                        : "Cargar (.xlsx)"
                    }
                  />
                </div>
              )}
            </div>

            {!isEditing &&
            (String(data?.auDoc_piar || "").includes("https://") ||
              data?.link_piar) ? (
              <SimpleButton
                onClick={() =>
                  window.open(
                    data.auDoc_piar || data?.link_piar,
                    "_blank",
                    "noreferrer",
                  )
                }
                msj="Descargar PIAR"
                bg="bg-accent"
                icon="Download"
                text="text-surface"
              />
            ) : null}
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
                data.Doc_acudiente
                  ? "bg-green-100 text-green-800 border-green-200 "
                  : "bg-yellow-100 text-yellow-800 border-yellow-200 "
              }`}
            >
              {/* ||
              data?.link_identificacion_acudiente */}
              {data?.Doc_acudiente ? "Cargado" : "No cargado"}
            </span>
            {isEditing ? (
              <div
                className={`flex  ${
                  documentFiles.id_Acudiente ? "col-span-3" : "col-span-1"
                }`}
              >
                <FileChooser
                  editing={isEditing}
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
            ) : data?.Doc_acudiente ? (
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
              <div />
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
            {/* ||
                data?.link_identificacion */}
            <span
              className={`px-3 py-1 rounded-lg text-sm font-semibold text-center border border-solid  ${
                data?.Doc_estudiante
                  ? "bg-green-100 text-green-800 border-green-200 "
                  : "bg-yellow-100 text-yellow-800 border-yellow-200 "
              }`}
            >
              {data?.Doc_estudiante ? "Cargado" : "No cargado"}
            </span>
            {isEditing ? (
              <div
                className={`flex  ${
                  documentFiles.id_Student ? "col-span-3" : "col-span-1"
                }`}
              >
                <FileChooser
                  editing={isEditing}
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(file) => handleDocumentChange("id_Student", file)}
                  label={
                    documentFiles.id_Student
                      ? documentFiles.id_Student.name
                      : "Cargar archivo"
                  }
                />
              </div>
            ) : data?.Doc_estudiante ? (
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
              <div />
            )}
          </div>
        </div>
        <div id="tour-ps-history" className="p-4 bg-bg rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold pb-4">Historial</h2>
          <p>Fecha de ingreso: {data.fecha_ingreso}</p>
          <p>Última actualización: {data.ultima_actualizacion}</p>
        </div>

        {/* Botón guardar en la parte inferior, solo visible en modo edición */}
        {isEditing && (
          <div className="w-full flex justify-end pb-4">
            <SimpleButton
              onClick={toggleEditing}
              msj={isSubmitting ? "Guardando..." : "Guardar"}
              bg="bg-accent"
              icon="Save"
              text="text-surface"
              disabled={isSubmitting}
            />
          </div>
        )}
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
