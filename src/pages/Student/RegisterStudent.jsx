import React, { useEffect, useMemo, useState } from "react";
import { sha256 } from "js-sha256";
import FileChooser from "../../components/atoms/FileChooser";
import SimpleButton from "../../components/atoms/SimpleButton";
import SedeSelect from "../../components/atoms/SedeSelect";
import JourneySelect from "../../components/atoms/JourneySelect";
import BecaSelector from "../../components/atoms/BecaSelector";
import GradeSelector from "../../components/atoms/GradeSelector";
import TypeDocumentSelector from "../../components/molecules/TypeDocumentSelector";
import PeriodSelector from "../../components/atoms/PeriodSelector";
import useStudent from "../../lib/hooks/useStudent";
import useData from "../../lib/hooks/useData";
import { useNotify } from "../../lib/hooks/useNotify";
import Loader from "../../components/atoms/Loader";
import { upload } from "../../services/uploadService";

const RegisterStudent = ({ onSuccess }) => {
  const { registerStudent, loading } = useStudent();
  const { institutionSedes } = useData();
  const notify = useNotify();
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    first_name: "",
    second_name: "",
    first_lastname: "",
    second_lastname: "",
    telephone: "",
    email: "",
    identification: "",
    identificationtype: "",
    sede: "",
    password: "",
    workday: "",
    fk_grade: "",
    fecha_nacimiento: "",
    direccion: "",
    gender: "",
    photo_link: null,
    nui: "",
    per_id: "",
    fk_beca: "",
    // Periodo de ingreso
    periodo_ingreso: "",
    // PIAR
    cuenta_piar: false,
    link_piar: null,
    // documentos
    link_identificacion: null,
  });

  // Obtener fk_workday de la sede seleccionada para filtrar jornadas
  const sedeWorkday = useMemo(() => {
    if (!formData.sede || !Array.isArray(institutionSedes)) return null;
    const sede = institutionSedes.find(
      (s) => String(s?.id) === String(formData.sede),
    );
    return sede?.fk_workday ? String(sede.fk_workday) : null;
  }, [formData.sede, institutionSedes]);

  // Limpiar jornada y grado cuando cambie la sede
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      workday: "",
      fk_grade: "",
    }));
  }, [formData.sede]);

  // Auto-seleccionar jornada si fk_workday no es 3
  useEffect(() => {
    if (!sedeWorkday) return;

    // Si fk_workday es 3 (ambas), el usuario puede elegir, no auto-seleccionar
    if (sedeWorkday === "3") return;

    // Si es 1 o 2, auto-seleccionar esa jornada
    setFormData((prev) => ({
      ...prev,
      workday: sedeWorkday,
    }));
  }, [sedeWorkday]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.identificationtype)
      newErrors.identificationtype = "Selecciona un tipo de documento.";
    if (!formData.identification.trim())
      newErrors.identification = "El número de identificación es requerido.";
    if (!formData.first_name.trim())
      newErrors.first_name = "El primer nombre es requerido.";
    if (!formData.first_lastname.trim())
      newErrors.first_lastname = "El primer apellido es requerido.";
    if (!formData.gender) newErrors.gender = "El género es requerido.";
    if (!formData.fecha_nacimiento)
      newErrors.fecha_nacimiento = "La fecha de nacimiento es requerida.";
    if (!formData.telephone.trim())
      newErrors.telephone = "El teléfono es requerido.";
    if (!formData.email.trim()) newErrors.email = "El email es requerido.";
    if (!formData.password.trim())
      newErrors.password = "La contraseña es requerida.";
    if (!formData.sede) newErrors.sede = "La sede es requerida.";
    if (!formData.workday) newErrors.workday = "La jornada es requerida.";
    if (!formData.fk_grade) newErrors.fk_grade = "El grado es requerido.";
    if (!formData.link_identificacion)
      newErrors.link_identificacion =
        "El documento de identificación es requerido.";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // ── PASO 1: construir el FormData con los archivos y enviarlo ──────────
      const form = new FormData();
      form.append("cedulaEstudiante", formData.link_identificacion);
      form.append("soporteExcel", formData.link_piar);
      form.append("identificacion", formData.identification);

      const res = await upload(form, "upload/estudiantes");

      // ── PASO 2: validar que el servidor respondió correctamente ────────────
      if (!res || res.status !== 200 || !Array.isArray(res.data)) {
        throw new Error("Error en la subida de archivos");
      }

      // ── PASO 3: extraer las URLs del response y actualizar el estado ───────
      // Usamos variables locales para el payload porque setFormData es
      // asíncrono: el estado no se refleja hasta el siguiente render.
      let idDocUrl = "";
      let piarUrl = "";

      res.data.forEach((entry) => {
        const fileInfo = entry.files && entry.files[0];
        const url = fileInfo ? fileInfo.folder : "";

        if (entry.field === "soporteExcel") {
          piarUrl = "yes";
        } else if (entry.field === "cedulaEstudiante") {
          idDocUrl = "yes";
        }
      });

      // Verificar que al menos una URL se haya recibido antes de continuar
      if (!idDocUrl && !piarUrl) {
        throw new Error("No se recibieron URLs de los archivos subidos");
      }

      // ── PASO 4: construir el payload con las URLs ya resueltas ─────────────
      // Se usan las variables locales (idDocUrl, piarUrl) y no formData,
      // porque el estado aún no se actualizó en este ciclo de render.
      const payload = {
        first_name: formData.first_name || "",
        second_name: formData.second_name || "",
        first_lastname: formData.first_lastname || "",
        second_lastname: formData.second_lastname || "",
        telephone: formData.telephone || "",
        email: formData.email || "",
        identification: formData.identification || "",
        identificationtype: formData.identificationtype
          ? Number(formData.identificationtype)
          : "",
        sede: formData.sede ? Number(formData.sede) : "",
        password: formData.password ? sha256(formData.password) : "",
        workday: formData.workday ? Number(formData.workday) : "",
        fk_grade: formData.fk_grade ? Number(formData.fk_grade) : "",
        fecha_nacimiento: formData.fecha_nacimiento || "",
        direccion: formData.direccion || "",
        gender: formData.gender || "",
        photo_link: formData.photo_link || "",
        nui: formData.nui || "",
        per_id: formData.per_id || "",
        fk_beca: formData.fk_beca ? Number(formData.fk_beca) : "",
        // Periodo de ingreso
        periodo_ingreso: formData.periodo_ingreso || "",
        fk_periodo_ingreso: formData.periodo_ingreso
          ? Number(formData.periodo_ingreso)
          : "",
        link_identificacion: "",
        link_identificacion_validado: idDocUrl || "",
        link_piar: piarUrl || "",
      };

      console.log("=== Payload a enviar ===");
      console.log(JSON.stringify(payload, null, 2));
      console.log("========================");

      // Enviar los datos al backend
      const result = await registerStudent(payload);

      console.log("¡Estudiante registrado exitosamente!", result);

      // Mostrar notificación de éxito
      try {
        notify.success("Estudiante registrado exitosamente.");
      } catch (e) {
        console.warn(e);
      }

      // Limpiar el formulario después del registro exitoso
      setFormData({
        first_name: "",
        second_name: "",
        first_lastname: "",
        second_lastname: "",
        telephone: "",
        email: "",
        identification: "",
        identificationtype: "",
        sede: "",
        password: "",
        workday: "",
        fk_grade: "",
        fecha_nacimiento: "",
        direccion: "",
        gender: "",
        photo_link: null,
        nui: "",
        per_id: "",
        fk_beca: "",
        // Periodo de ingreso
        periodo_ingreso: "",
        // PIAR
        cuenta_piar: false,
        link_piar: null,
        link_identificacion: null,
      });
      setErrors({});

      // Notificar al componente padre (si fue pasado)
      if (typeof onSuccess === "function") {
        try {
          onSuccess(result);
        } catch (err) {
          console.warn("onSuccess callback failed:", err);
        }
      }
    } catch (err) {
      console.error("Error al registrar estudiante:", err);
      notify.error(
        err?.message || "Error al registrar el estudiante. Intenta nuevamente.",
      );
    }
  };

  return (
    <div className="border p-6 rounded bg-bg h-full gap-4 flex flex-col">
      <h2 className="text-xl font-semibold mb-4">Registrar estudiante</h2>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* -- Campos del formulario -- */}
        <div className="md:col-span-3 font-bold">Información personal</div>
        <div>
          <TypeDocumentSelector
            name="identificationtype"
            label={
              <>
                Tipo de documento <span className="text-error">*</span>
              </>
            }
            value={formData.identificationtype}
            onChange={handleChange}
            placeholder="Selecciona un tipo de documento"
          />
          {errors.identificationtype && (
            <p className="text-xs text-error mt-1">
              {errors.identificationtype}
            </p>
          )}
        </div>
        <div>
          <label>
            N.º de identificación <span className="text-error">*</span>
          </label>
          <input
            type="text"
            name="identification"
            value={formData.identification}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
          />
          {errors.identification && (
            <p className="text-xs text-error mt-1">{errors.identification}</p>
          )}
        </div>
        <div>
          <label>NUI</label>
          <input
            type="text"
            name="nui"
            value={formData.nui}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
          />
        </div>
        <div>
          <label>
            Primer nombre <span className="text-error">*</span>
          </label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
          />
          {errors.first_name && (
            <p className="text-xs text-error mt-1">{errors.first_name}</p>
          )}
        </div>
        <div>
          <label>Segundo nombre</label>
          <input
            type="text"
            name="second_name"
            value={formData.second_name}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
          />
        </div>
        <div>
          <label>
            Primer apellido <span className="text-error">*</span>
          </label>
          <input
            type="text"
            name="first_lastname"
            value={formData.first_lastname}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
          />
          {errors.first_lastname && (
            <p className="text-xs text-error mt-1">{errors.first_lastname}</p>
          )}
        </div>
        <div>
          <label>Segundo apellido</label>
          <input
            type="text"
            name="second_lastname"
            value={formData.second_lastname}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
          />
        </div>
        <div>
          <label>
            Género <span className="text-error">*</span>
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
          >
            <option value=""></option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
          </select>
          {errors.gender && (
            <p className="text-xs text-error mt-1">{errors.gender}</p>
          )}
        </div>
        <div>
          <label>
            Fecha de nacimiento <span className="text-error">*</span>
          </label>
          <input
            type="date"
            name="fecha_nacimiento"
            value={formData.fecha_nacimiento}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
          />
          {errors.fecha_nacimiento && (
            <p className="text-xs text-error mt-1">{errors.fecha_nacimiento}</p>
          )}
        </div>
        <div>
          <label>
            Teléfono <span className="text-error">*</span>
          </label>
          <input
            type="tel"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
          />
          {errors.telephone && (
            <p className="text-xs text-error mt-1">{errors.telephone}</p>
          )}
        </div>
        <div>
          <label>
            Email <span className="text-error">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
          />
          {errors.email && (
            <p className="text-xs text-error mt-1">{errors.email}</p>
          )}
        </div>
        <div>
          <label>Dirección</label>
          <input
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
          />
        </div>
        <div>
          <label>
            Contraseña <span className="text-error">*</span>
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
          />
          {errors.password && (
            <p className="text-xs text-error mt-1">{errors.password}</p>
          )}
        </div>

        <div className="md:col-span-3 font-bold mt-4">
          Información académica
        </div>
        <div>
          <SedeSelect
            name="sede"
            label={
              <>
                Sede <span className="text-error">*</span>
              </>
            }
            value={formData.sede}
            onChange={handleChange}
            placeholder="Selecciona una sede"
          />
          {errors.sede && (
            <p className="text-xs text-error mt-1">{errors.sede}</p>
          )}
        </div>
        <div>
          <JourneySelect
            name="workday"
            label={
              <>
                Jornada <span className="text-error">*</span>
              </>
            }
            value={formData.workday}
            filterValue={sedeWorkday}
            onChange={handleChange}
            placeholder="Selecciona una jornada"
            includeAmbas={false}
          />
          {errors.workday && (
            <p className="text-xs text-error mt-1">{errors.workday}</p>
          )}
        </div>
        <div>
          <GradeSelector
            name="fk_grade"
            label={
              <>
                Grado <span className="text-error">*</span>
              </>
            }
            value={formData.fk_grade}
            onChange={handleChange}
            sedeId={formData.sede}
            workdayId={formData.workday}
            placeholder="Selecciona un grado"
          />
          {errors.fk_grade && (
            <p className="text-xs text-error mt-1">{errors.fk_grade}</p>
          )}
        </div>
        <BecaSelector
          name="fk_beca"
          label="Beca"
          value={formData.fk_beca}
          onChange={handleChange}
          placeholder="Selecciona una beca"
        />
        <PeriodSelector
          name="periodo_ingreso"
          label="Periodo de ingreso"
          value={formData.periodo_ingreso}
          onChange={handleChange}
          placeholder="Selecciona un período"
        />
        <div>
          <label>PER ID</label>
          <input
            type="text"
            name="per_id"
            value={formData.per_id}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-surface"
          />
        </div>

        <div className="md:col-span-3 font-bold mt-4 grid grid-cols-2 gap-4">
          Documentos y archivos
        </div>
        <div className="grid grid-cols-2 w-full col-span-3">
          {/* <div>
          <label>Foto del estudiante</label>
          <FileChooser
            onChange={(file) =>
              setFormData((prev) => ({ ...prev, photo_link: file }))
            }
            accept={".pdf"}
          />
        </div> */}
          <div className="flex flex-col justify-center items-center">
            <label>
              Documento de identificación <span className="text-error">*</span>
            </label>
            <FileChooser
              onChange={(file) => {
                setFormData((prev) => ({ ...prev, link_identificacion: file }));
                setErrors((prev) => ({ ...prev, link_identificacion: "" }));
              }}
              accept={".pdf"}
            />
            {errors.link_identificacion && (
              <p className="text-xs text-error mt-1">
                {errors.link_identificacion}
              </p>
            )}
          </div>

          {/* PIAR: checkbox + FileChooser (.xlsx/.xls) */}
          <div className="grid grid-cols-2">
            <div className=" flex flex-col gap-3  text-center">
              <label>Cuenta con PIAR</label>
              <div className="flex flex-row gap-2 items-center justify-center">
                <input
                  type="checkbox"
                  name="cuenta_piar"
                  checked={!!formData.cuenta_piar}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      cuenta_piar: !!e.target.checked,
                    }))
                  }
                  className="w-4 h-4"
                />
                <span
                  className={`px-3 py-1 rounded-lg text-sm font-semibold text-center border border-solid  ${
                    formData.cuenta_piar
                      ? "bg-green-100 text-green-800 border-green-200"
                      : "bg-yellow-100 text-yellow-800 border-yellow-200"
                  }`}
                >
                  {formData.cuenta_piar ? "Sí" : "No"}
                </span>
              </div>
            </div>
            {formData.cuenta_piar && (
              <div className="mt-3">
                <FileChooser
                  accept=".xlsx,.xls"
                  onChange={(file) =>
                    setFormData((prev) => ({ ...prev, link_piar: file }))
                  }
                  label={
                    formData.link_piar
                      ? formData.link_piar.name
                      : "Cargar (.xlsx)"
                  }
                />
              </div>
            )}
          </div>
        </div>
        <div className="md:col-span-3 mt-4 flex flex-col items-center gap-4">
          {loading && <Loader message="Registrando estudiante..." />}

          {!loading && (
            <SimpleButton
              msj="Registrar estudiante"
              text={"text-surface"}
              bg={"bg-secondary"}
              icon={"Save"}
            />
          )}
        </div>
      </form>
    </div>
  );
};

export default RegisterStudent;
