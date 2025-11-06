import { loginResponse } from "../../services/DataExamples/ExamplesResponse";
import PreviewIMG from "../atoms/PreviewIMG";

const ProfileStudent = ({ data }) => {
  console.log(data);
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="w-11/12">
        <div className="grid grid-cols-3 gap-4 p-4">
          <div className="flex items-center justify-center">
            <PreviewIMG path={data.url_photo} size="profile" />
          </div>
          <div className="flex flex-col pb-4  col-span-2">
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
        <div className="grid grid-cols-2">
          <div className="pb-4">
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
          <div className="pb-4">
            <h2 className="text-2xl font-semibold pb-4">
              Informacion Familiar
            </h2>
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
        </div>
        <div id="Documentos Auditoria" className="pb-4">
          <h2 className="text-2xl font-semibold pb-4">Documentos Auditoria</h2>
          <div className="flex flex-row gap-4 items-center">
            <label className="text-lg font-medium">Documento 1:</label>
            <p>{data.documento1}</p>
          </div>
          <div className="flex flex-row gap-4 items-center">
            <label className="text-lg font-medium">Documento 2:</label>
            <p>{data.documento2}</p>
          </div>
          <div className="flex flex-row gap-4 items-center">
            <label className="text-lg font-medium">Documento 3:</label>
            <p>{data.documento3}</p>
          </div>
        </div>
        <div id="Historial" className="pb-4">
          <h2 className="text-2xl font-semibold pb-4">Historial</h2>
          <p>Fecha de Ingreso: {data.fecha_ingreso}</p>
          <p>Ultima Actualización: {data.ultima_actualizacion}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileStudent;
