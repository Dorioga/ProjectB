import { useState, useEffect, useCallback } from "react";
import useAuth from "../../lib/hooks/useAuth";
import PreviewIMG from "../atoms/PreviewIMG";
import PeriodSelector from "../atoms/PeriodSelector";
import SimpleButton from "../atoms/SimpleButton";
import FileChooser from "../atoms/FileChooser";
import CameraModal from "./CameraModal";
import ExcuseModal from "./ExcuseModal";
import PDFViewerModal from "./PDFViewerModal.jsx";
import MatriculaModal from "./MatriculaModal.jsx";
import CarnetModal from "./CarnetModal.jsx";
import {
  formatDateToDisplay,
  getIdentificationLabel,
} from "../../utils/formatUtils";
import { upload } from "../../services/uploadService";
import { useNotify } from "../../lib/hooks/useNotify";
import useAudit from "../../lib/hooks/useAudit";
import tourProfileStudent from "../../tour/tourProfileStudent";

const ProfileStudent = ({
  data,
  state = false,
  onSave,
  initialEditing = false,
  showStates = true,
}) => {
  const notify = useNotify();
  const { nameRole, rol } = useAuth();
  const { setStudentDataAudit } = useAudit();
  const isDocente = String(nameRole ?? "")
    .toLowerCase()
    .includes("docente");
  const isRol6 = String(rol) === "6";
  const isRol7 = String(rol) === "7";
  const isRol9 = String(rol) === "9";
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

  ///Preguntar el State
  const [isEditing, setIsEditing] = useState(Boolean(initialEditing));
  const canEditRestricted = isEditing && !isRol9;

  // Si la prop initialEditing cambia (abrir en modo edición), sincronizar el estado local
  useEffect(() => {
    setIsEditing(Boolean(initialEditing));
  }, [initialEditing]);

  const [isOpenCamera, setIsOpenCamera] = useState(false);
  const [currentEtapa, setCurrentEtapa] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpenExcuse, setIsOpenExcuse] = useState(false);
  const [isOpenDocument, setIsOpenDocument] = useState(false);
  const [isOpenMatricula, setIsOpenMatricula] = useState(false);
  const [isOpenCarnet, setIsOpenCarnet] = useState(false);
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
    piar: data.link_piar,
  });

  const [editedData, setEditedData] = useState({
    state_first: data?.nombre_primera_etapa || data?.state_first || "Pendiente",
    state_second:
      data?.nombre_segunda_etapa || data?.state_second || "Pendiente",
    fk_state_first: data?.fk_primera_etapa,
    fk_state_second: data?.fk_segunda_etapa,
    link_foto_primera_etapa: data?.link_foto_primera_etapa || null,
    link_foto_segunda_etapa: data?.link_foto_segunda_etapa || null,
    state_beca: data?.status_beca || data?.state_beca || "Activo",
    fk_beca: data?.fk_beca,
    state_process: data?.nombre_proceso || data?.state_process || "Conforme",
    fk_process: data?.fk_proceso,
    first_name: data?.primero_nombre || data?.first_name || "",
    second_name: data?.segundo_nombre || data?.second_name || "",
    first_lastname: data?.primer_apellido || data?.first_lastname || "",
    second_lastname: data?.segundo_apellido || data?.second_lastname || "",
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

  const processIdMap = {
    Conforme: "1",
    Excusa: "2",
    SinExcusa: "3",
    Retirado: "4",
    Reasignado: "5",
  };

  const becaIdMap = {
    Activo: 1,
    Retirado: 0,
  };

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
      process_id: processIdMap[editedData.state_process],
      gender: data.genero || data.genre || "",
      photo_link: photoPreview || data.link_foto || data.url_photo || "",
      identification_link: "yes",
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
      link_piar: hasPiar ? data?.link_piar || null : null,
    };

    // -- Subida de archivos (identificación y/o PIAR) -----------------------
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
              const folder =
                entry?.files?.[0]?.folder?.replace("/var/www", "") ?? "";
              const fileName = entry?.files?.[0]?.fileName ?? "";
              updatedData.link_piar = `https://www.nexusplataforma.com${folder}/${fileName}`;
              //si el estudiante tiene piar dejarlo igual si el check es false enviar null en el link piar
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
      onSave(studentId, personId, updatedData);
    }
  };

  const handleImageCapture = (file, preview) => {
    setPhotoFile(file);
    setPhotoPreview(preview);
  };

  const handleUploadEtapaFoto = async () => {
    if (!photoFile) {
      notify.error("No hay foto para subir");
      return;
    }
    if (!currentEtapa) {
      notify.error("Debes tomar una foto de etapa primero");
      return;
    }
    try {
      const reader = new FileReader();
      const photoBase64 = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(photoFile);
      });
      const fd = new FormData();
      fd.append("imageBase64", photoBase64);
      fd.append(
        "identificacion",
        data.numero_identificacion || data.identification || "",
      );
      fd.append("etapa", currentEtapa);
      const uploadRes = await upload(fd, "uploadfirma/estudiantes");
      if (uploadRes?.status === 200 && uploadRes?.data) {
        const { fileName, folder } = uploadRes.data;
        if (fileName && folder) {
          const cleanFolder = folder.replace("/var/www", "");
          const imageUrl = `https://www.nexusplataforma.com${cleanFolder}/${fileName}`;
          const etapaPayload = {
            fk_estudiante: data.id_estudiante,
            fk_primera_etapa: editedData.fk_state_first,
            fk_segunda_etapa: editedData.fk_state_second,
            fk_tercera_etapa: null,
            link_foto_primera_etapa:
              currentEtapa === "et1"
                ? imageUrl
                : editedData.link_foto_primera_etapa,
            link_foto_segunda_etapa:
              currentEtapa === "et2"
                ? imageUrl
                : editedData.link_foto_segunda_etapa,
            fk_beca: editedData.fk_beca || null,
            fk_proceso: editedData.fk_process || null,
          };
          await setStudentDataAudit(etapaPayload);
          if (currentEtapa === "et1") {
            handleStateChange("link_foto_primera_etapa", imageUrl);
          } else if (currentEtapa === "et2") {
            handleStateChange("link_foto_segunda_etapa", imageUrl);
          }
          notify.success("Foto de etapa subida correctamente");
        }
      }
    } catch (err) {
      console.error("Error subiendo foto en ProfileStudent:", err);
      notify.error("Error al subir la foto de etapa");
    }
  };

  const handleDocumentChange = (documentName, file) => {
    setDocumentFiles((prev) => ({
      ...prev,
      [documentName]: file,
    }));
  };
  const handleStateChange = (field, value) => {
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
    } else {
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
            {(!isDocente || isRol7) && isEditing && (
              <SimpleButton
                onClick={() => setIsEditing(false)}
                msj="Cancelar"
                bg="bg-secondary"
                icon="X"
                text="text-surface"
              />
            )}
            {(!isDocente || isRol7) && !isRol6 && (
              <SimpleButton
                onClick={() => setIsEditing(true)}
                msj="Editar"
                bg="bg-primary"
                icon="Pencil"
                text="text-surface"
                disabled={isEditing}
              />
            )}
            <SimpleButton
              onClick={() => setIsOpenCarnet(true)}
              msj="Carné"
              bg="bg-accent"
              icon="CreditCard"
              text="text-surface"
            />
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
                {getIdentificationLabel(Number(data.fk_tipo_identificacion))}
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
              {canEditRestricted ? (
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
              {canEditRestricted ? (
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
              {canEditRestricted ? (
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
              {canEditRestricted ? (
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
            {canEditRestricted ? (
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
            <p>{data.nombre_jornada}</p>
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
                getIdentificationLabel(
                  Number(data.fk_tipo_identificacion_acudiente),
                )}
            </p>
          </div>
          <div className="flex flex-row gap-4 items-center">
            <label className="text-lg font-medium">
              Número identificación Acudiente:
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
              Documentos Auditoria
            </h2>

            <div className="flex flex-col gap-3">
              {/* Estado Primera Etapa */}
              <div className="grid grid-cols-3 gap-4 items-center">
                <label className="text-lg font-medium w-48">
                  Primera Etapa:
                </label>
                {isEditing ? (
                  <select
                    value={editedData.fk_state_first ?? 1}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const labelMap = {
                        1: "Pendiente",
                        2: "Registrado",
                        3: "Ausente",
                        4: "Excusa",
                      };
                      handleStateChange("fk_state_first", val);
                      handleStateChange(
                        "state_first",
                        labelMap[val] || "Pendiente",
                      );
                    }}
                    className="border p-2 rounded bg-surface text-center"
                  >
                    <option value={1}>Pendiente</option>
                    <option value={2}>Registrado</option>
                    <option value={3}>Ausente</option>
                    <option value={4}>Excusa</option>
                  </select>
                ) : (
                  <span
                    className={`px-3 py-1 rounded-lg text-sm font-semibold text-center border border-solid  ${
                      editedData.state_first === "Registrado"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {editedData.state_first}
                  </span>
                )}
                {isEditing && !isRol6 && editedData.fk_state_first === 2 ? (
                  <div lassName="">
                    <SimpleButton
                      onClick={() => {
                        setCurrentEtapa("et1");
                        setIsOpenCamera(true);
                      }}
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

                {isEditing ? (
                  <select
                    value={editedData.fk_state_second ?? 1}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const labelMap = {
                        1: "Pendiente",
                        2: "Registrado",
                        3: "Ausente",
                        4: "Excusa",
                      };
                      handleStateChange("fk_state_second", val);
                      handleStateChange(
                        "state_second",
                        labelMap[val] || "Pendiente",
                      );
                    }}
                    className="border p-2 rounded bg-surface text-center"
                  >
                    <option value={1}>Pendiente</option>
                    <option value={2}>Registrado</option>
                    <option value={3}>Ausente</option>
                    <option value={4}>Excusa</option>
                  </select>
                ) : (
                  <span
                    className={`px-3 py-1 rounded-lg text-sm font-semibold text-center border border-solid  ${
                      editedData.state_second === "Registrado"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {editedData.state_second}
                  </span>
                )}
                {isEditing && !isRol6 && editedData.fk_state_second === 2 && (
                  <div className="">
                    <SimpleButton
                      onClick={() => {
                        setCurrentEtapa("et2");
                        setIsOpenCamera(true);
                      }}
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
                    value={editedData.fk_beca}
                    onChange={(e) =>
                      handleStateChange("fk_beca", e.target.value)
                    }
                    className="border p-2 rounded bg-surface text-center"
                  >
                    <option value="">Seleccionar</option>
                    <option value="1">Activo</option>
                    <option value="2">Retirado</option>
                    <option value="3">Sin beca</option>
                  </select>
                ) : (
                  <span
                    className={`px-3 py-1 rounded-lg text-sm font-semibold text-center border border-solid  ${
                      editedData.fk_beca === "1"
                        ? "bg-green-100 text-green-800"
                        : editedData.fk_beca === "2"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {editedData.state_beca ? editedData.state_beca : "Nulo"}
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
                    value={editedData.fk_process}
                    onChange={(e) =>
                      handleStateChange("fk_process", e.target.value)
                    }
                    className="border p-2 rounded bg-surface text-center"
                  >
                    <option value="1">Conforme</option>
                    <option value="2">Excusa</option>
                    <option value="3">Sin Excusa</option>
                    <option value="4">Retirado</option>
                    <option value="5">Reasignado</option>
                  </select>
                ) : (
                  <span
                    className={`px-3 py-1 rounded-lg text-sm font-semibold text-center border border-solid  ${
                      editedData.fk_process === "1"
                        ? "bg-green-100 text-green-800"
                        : editedData.fk_process === "4"
                          ? "bg-gray-100 text-gray-800"
                          : editedData.fk_process === "5"
                            ? "bg-indigo-100 text-indigo-800"
                            : editedData.fk_process === "2"
                              ? "bg-yellow-700 text-yellow-100"
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

              {isEditing && !isRol6 && (
                <div className="flex justify-start pt-2">
                  <SimpleButton
                    onClick={handleUploadEtapaFoto}
                    msj="Subir foto de etapa"
                    bg="bg-accent"
                    icon="Upload"
                    text="text-surface"
                  />
                </div>
              )}

              {(editedData.link_foto_primera_etapa || editedData.link_foto_segunda_etapa) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex flex-col items-center gap-2">
                    <label className="text-lg font-medium">Foto Primera Etapa</label>
                    {editedData.link_foto_primera_etapa ? (
                      <PreviewIMG path={editedData.link_foto_primera_etapa} size="profile" />
                    ) : (
                      <span className="text-sm text-gray-500">Sin foto</span>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <label className="text-lg font-medium">Foto Segunda Etapa</label>
                    {editedData.link_foto_segunda_etapa ? (
                      <PreviewIMG path={editedData.link_foto_segunda_etapa} size="profile" />
                    ) : (
                      <span className="text-sm text-gray-500">Sin foto</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        <div
          id="tour-ps-documents"
          className="p-4 bg-bg rounded-lg shadow-md flex flex-col gap-2"
        >
          <h2 className="text-2xl font-semibold pb-4">
            Documentos del estudiante
          </h2>

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

            <div className="flex gap-2">
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
              {[3, 5, 6].includes(Number(rol)) && (
                <SimpleButton
                  onClick={() => setIsOpenMatricula(true)}
                  msj="Ficha de matrícula"
                  bg="bg-primary"
                  icon="ClipboardList"
                  text="text-surface"
                />
              )}
            </div>
          </div>

          {/* PIAR - checkbox + FileChooser (edit) / descarga (view) w-full grid grid-cols-1 lg:grid-cols-4 gap-4 items-center */}

          <div
            className={`w-full grid grid-cols-1 lg:grid-cols-3 gap-4 items-center `}
          >
            <label className="text-lg font-medium">Cuenta con PIAR:</label>
            <div
              className={` flex items-center justify-center w-full gap-3 col-span-1 `}
            >
              {isEditing && (
                <input
                  type="checkbox"
                  checked={hasPiar}
                  onChange={(e) => setHasPiar(!!e.target.checked)}
                  className="w-4 h-4"
                />
              )}
              <span
                className={`px-3 py-1 w-full rounded-lg text-sm font-semibold text-center border border-solid  ${
                  hasPiar
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-yellow-100 text-yellow-800 border-yellow-200"
                }`}
              >
                {hasPiar ? "Sí" : "No"}
              </span>
            </div>
            <div className={` w-full gap-3 col-span-1`}>
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
                data?.Doc_estudiante && data?.link_identificacion
                  ? "bg-green-100 text-green-800 border-green-200 "
                  : "bg-yellow-100 text-yellow-800 border-yellow-200 "
              }`}
            >
              {data?.Doc_estudiante && data?.link_identificacion
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
            ) : data?.Doc_estudiante && data?.link_identificacion ? (
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
                data?.Doc_acudiente && data?.link_identificacion_acudiente
                  ? "bg-green-100 text-green-800 border-green-200 "
                  : "bg-yellow-100 text-yellow-800 border-yellow-200 "
              }`}
            >
              {/* ||
              data?.link_identificacion_acudiente */}
              {data?.Doc_acudiente && data?.link_identificacion_acudiente
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
            ) : data?.Doc_acudiente && data?.link_identificacion_acudiente ? (
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
      <MatriculaModal
        isOpen={isOpenMatricula}
        onClose={() => setIsOpenMatricula(false)}
        data={data}
      />
      <CarnetModal
        isOpen={isOpenCarnet}
        onClose={() => setIsOpenCarnet(false)}
        data={{
          ...data,
          // Normalizar id_estudiante y fk_sede explícitamente para que el QR
          // funcione sin importar la nomenclatura que devuelva el API.
          id_estudiante: data?.id_estudiante ?? data?.id_student ?? undefined,
          fk_sede:
            data?.fk_sede ??
            data?.id_sede ??
            data?.sede_id ??
            selectedSede ??
            undefined,
          first_name: editedData.first_name,
          second_name: editedData.second_name,
          first_lastname: editedData.first_lastname,
          second_lastname: editedData.second_lastname,
          url_photo: photoPreview || data.link_foto || data.url_photo,
          identification: data.numero_identificacion || data.identification,
          genre: data.genero || data.genre,
          grade_scholar: data.nombre_grado || data.grade_scholar,
          group_grade: data.grupo || data.group_grade,
          name_school: data.nombre_sede || data.name_school,
        }}
      />
    </div>
  );
};

export default ProfileStudent;
