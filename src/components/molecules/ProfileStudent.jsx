import { useState } from "react";
import PreviewIMG from "../atoms/PreviewIMG";
import SimpleButton from "../atoms/SimpleButton";
import FileChooser from "../atoms/FileChooser";

const ProfileStudent = ({ data }) => {
  // ✅ AGREGAR ESTE HOOK
  const [isEditing, setIsEditing] = useState(false);

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center ">
      <div className="w-11/12 flex  flex-col gap-4  ">
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
        <div className="grid lg:grid-cols-3 gap-4 p-4 bg-bg rounded-lg shadow-md ">
          <div className="flex items-center justify-center">
            <PreviewIMG path={data.url_photo} size="profile" />
          </div>
          <div className="flex flex-col pb-4  lg:col-span-2">
            {" "}
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
          </div>{" "}
          <div className="flex flex-row gap-4 items-center">
            <label className="text-lg font-medium">Grupo:</label>
            <p>{data.group_grade}</p>
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
        <div className="p-4 bg-bg rounded-lg shadow-md flex flex-col gap-2">
          <h2 className="text-2xl font-semibold pb-4">Documentos Auditoria</h2>
          <div className="flex flex-row gap-4 items-center">
            <label className="text-lg font-medium">Habeas Data:</label>
            <p>{data.documento1}</p>
          </div>
          <div className="flex flex-row gap-4 items-center">
            <label className="text-lg font-medium">Ficha Matricula:</label>
            <p>{data.documento2}</p>
          </div>
          <div className=" w-full grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
            <label className="text-lg font-medium lg:col-span-1">
              Identificación Acudiente:
            </label>
            {!isEditing ? (
              <p>{data.documento3}</p>
            ) : (
              <div className="lg:col-span-2 flex justify-end">
                <FileChooser />
              </div>
            )}
          </div>
          <div className=" w-full grid grid-cols-1 lg:grid-cols-3 gap-4 lg:items-center">
            <label className="text-lg font-medium lg:col-span-1">
              Identificación Estudiante:
            </label>
            {!isEditing ? (
              <p>{data.documento3}</p>
            ) : (
              <div className="lg:col-span-2 flex justify-end">
                <FileChooser />
              </div>
            )}
          </div>
        </div>
        <div className="p-4 bg-bg rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold pb-4">Historial</h2>
          <p>Fecha de Ingreso: {data.fecha_ingreso}</p>
          <p>Ultima Actualización: {data.ultima_actualizacion}</p>
          <p>Ultima Actualización: {data.ultima_actualizacion}</p>
          <p>Ultima Actualización: {data.ultima_actualizacion}</p>
          <p>Ultima Actualización: {data.ultima_actualizacion}</p>
          <p>Ultima Actualización: {data.ultima_actualizacion}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileStudent;
