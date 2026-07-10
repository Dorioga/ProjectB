import { useState } from "react";
import jsPDF from "jspdf";
import Modal from "../atoms/Modal.jsx";
import useAuth from "../../lib/hooks/useAuth";
import SimpleButton from "../atoms/SimpleButton.jsx";
import { getIdentificationLabel } from "../../utils/formatUtils";

const buildFullName = (data, suffix = "") => {
  const parts = [
    data[`primero_nombre${suffix}`] || data[`first_name${suffix}`] || "",
    data[`segundo_nombre${suffix}`] || data[`second_name${suffix}`] || "",
    data[`primer_apellido${suffix}`] || data[`first_lastname${suffix}`] || "",
    data[`segundo_apellido${suffix}`] || data[`second_lastname${suffix}`] || "",
  ];
  return parts.filter(Boolean).join(" ");
};

const HabeasDataModal = ({ isOpen, onClose, data }) => {
  const { nameSchool } = useAuth();

  const nombreEstudiante = buildFullName(data);
  const tipoDocEstudiante = getIdentificationLabel(
    Number(data?.fk_tipo_identificacion),
  );
  const numDocEstudiante =
    data?.numero_identificacion || data?.identification || "";
  const gradoGrupo = [data?.nombre_grado, data?.grupo]
    .filter(Boolean)
    .join(" - ");
  const nombreInstitucion =
    nameSchool || data?.nombre_institucion || data?.nombre_sede || "";

  const [nombreAcudiente, setNombreAcudiente] = useState("");
  const [identificacionAcudiente, setIdentificacionAcudiente] = useState("");
  const [calidadDe, setCalidadDe] = useState("");
  const [telefonoAcudiente, setTelefonoAcudiente] = useState("");

  const handleDownloadPDF = () => {
    const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "letter" });
    const pageW = pdf.internal.pageSize.getWidth();
    const margin = 15;
    const contentW = pageW - margin * 2;
    let y = 20;

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    const titleLines = pdf.splitTextToSize(
      "AUTORIZACIÓN PARA LA TOMA Y TRATAMIENTO DE DATOS BIOMÉTRICOS Y REGISTROS FOTOGRÁFICOS",
      contentW,
    );
    pdf.text(titleLines, pageW / 2, y, { align: "center" });
    y += titleLines.length * 6;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.text(`Fecha: ${new Date().toLocaleDateString()}`, margin, (y += 6));

    y += 6;
    const legalText =
      "En cumplimiento de lo dispuesto en el artículo 288 del Código Civil Colombiano, el artículo 24 del Decreto 2820 de 1974, la Ley 1098 de 2006 (Código de la Infancia y la Adolescencia) y la Ley 1581 de 2012 sobre Protección de Datos Personales, la Secretaría de Educación Municipal de Soledad solicita la presente autorización para la toma y tratamiento de datos biométricos y registros fotográficos de los estudiantes beneficiarios de la matrícula contratada.";
    const legalLines = pdf.splitTextToSize(legalText, contentW);
    pdf.text(legalLines, margin, y, { align: "justify", maxWidth: contentW });
    y += legalLines.length * 5;

    pdf.setFont("helvetica", "bold");
    pdf.text("DATOS DEL ESTUDIANTE", margin, y);
    y += 2;
    pdf.setFont("helvetica", "normal");
    pdf.text(`Nombre completo: ${nombreEstudiante}`, margin, (y += 5));
    pdf.text(
      `Tipo y número de documento: ${tipoDocEstudiante} ${numDocEstudiante}`,
      margin,
      (y += 5),
    );
    pdf.text(`Institución educativa: ${nombreInstitucion}`, margin, (y += 5));
    pdf.text(`Grado: ${gradoGrupo || "_______________"}`, margin, (y += 5));

    y += 6;
    pdf.setFont("helvetica", "bold");
    pdf.text(
      "DATOS DEL PADRE, MADRE, ACUDIENTE O REPRESENTANTE LEGAL",
      margin,
      y,
    );
    pdf.setFont("helvetica", "normal");
    pdf.text("Nombre completo: ", margin, (y += 8));
    const nameW = pdf.getTextWidth("Nombre completo: ");
    const barEnd0 = margin + contentW * 0.9;
    pdf.line(margin + nameW, y + 0.5, barEnd0, y + 0.5);
    pdf.text("Tipo y número de documento:", margin, (y += 8));
    const ParentW = pdf.getTextWidth("Tipo y número de documento: ");
    const barEnd1 = margin + contentW * 0.9;
    pdf.line(margin + ParentW, y + 0.5, barEnd1, y + 0.5);
    pdf.text("Parentesco o calidad en que actúa:", margin, (y += 8));
    const ParentW2 = pdf.getTextWidth("Parentesco o calidad en que actúa: ");
    const barEnd2 = margin + contentW * 0.9;
    pdf.line(margin + ParentW2, y + 0.5, barEnd2, y + 0.5);
    pdf.text("Teléfono de contacto:", margin, (y += 8));
    const contactW = pdf.getTextWidth("Teléfono de contacto: ");
    const barEnd3 = margin + contentW * 0.9;
    pdf.line(margin + contactW, y + 0.5, barEnd3, y + 0.5);
    y += 6;

    pdf.setFont("helvetica", "bold");
    pdf.text("AUTORIZACIÓN", margin, y);
    y += 6;
    pdf.setFont("helvetica", "normal");
    pdf.text("Yo", margin, y);
    const yoW = pdf.getTextWidth("Yo ");
    const barEnd = margin + contentW * 0.9;
    pdf.line(margin + yoW, y + 0.5, barEnd, y + 0.5);
    y += 6;
    const authText = `identificado(a) como aparece al pie de mi correspondiente firma, actuando en calidad de padre, madre, acudiente o representante legal del estudiante anteriormente identificado, autorizo de manera libre, previa expresa e informada a la Secretaría de Educación Municipal de Soledad para realizar la toma de datos biométricos (huellas dactilares) y registros fotográficos del estudiante.\n\nDeclaro que he sido informado(a) de que dichos datos serán recolectados y tratados exclusivamente para las actividades de inspección, vigilancia, seguimiento y control de los recursos del Sistema General de Participaciones (SGP) asignados a la matrícula contratada, de la cual mi hijo es beneficiario, así como para la verificación de la información relacionada con la prestación del servicio educativo.\n\nIgualmente, manifiesto conocer que la información será tratada conforme a la Ley 1581 de 2012 y demás normas aplicables sobre protección de datos personales, garantizando la confidencialidad, seguridad y uso exclusivo para las finalidades aquí descritas.\n\nLa presente autorización se otorga de manera voluntaria y permanecerá vigente durante el tiempo requerido para el cumplimiento de las finalidades señaladas y las obligaciones legales correspondientes.`;
    const authLines = pdf.splitTextToSize(authText, contentW);
    pdf.text(authLines, margin, y, { align: "justify", maxWidth: contentW });
    y += authLines.length * 5 + 2;

    pdf.setFont("helvetica", "bold");
    pdf.text("Firma del padre, madre o acudiente:", margin, y);
    const f = pdf.getTextWidth("Firma del padre, madre o acudiente: ");
    const barf = margin + contentW * 1;
    pdf.line(margin + f, y + 0.5, barf, y + 0.5);
    y += 1;
    pdf.setFont("helvetica", "bold");
    pdf.text("Nombre completo: ", margin, (y += 8));
    const nameW1 = pdf.getTextWidth("Nombre completo: ");
    const barEnd01 = margin + contentW * 1;
    pdf.line(margin + nameW1, y + 0.5, barEnd01, y + 0.5);
    pdf.text("Documento de identidad: ", margin, (y += 8));
    const idW1 = pdf.getTextWidth("Documento de identidad: ");
    const barEnd02 = margin + contentW * 1;
    pdf.line(margin + idW1, y + 0.5, barEnd02, y + 0.5);
    const safeName = nombreEstudiante.replace(/\s+/g, "_");
    pdf.save(`Habeas_data_${safeName}.pdf`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Formato de firma"
      size="6xl"
    >
      <div className="signature-format-modal">
        <div className="modal-content">
          <div className="p-4 border-2 border-dashed rounded-lg w-full">
            <h3 className="font-bold text-lg text-center mb-2">
              AUTORIZACIÓN PARA LA TOMA Y TRATAMIENTO DE DATOS BIOMÉTRICOS Y
              REGISTROS FOTOGRÁFICOS
            </h3>

            <p className="text-sm mb-4">
              Fecha: {new Date().toLocaleDateString()}
            </p>

            <p className="text-sm text-justify mb-4">
              En cumplimiento de lo dispuesto en el artículo 288 del Código
              Civil Colombiano, el artículo 24 del Decreto 2820 de 1974, la Ley
              1098 de 2006 (Código de la Infancia y la Adolescencia) y la Ley
              1581 de 2012 sobre Protección de Datos Personales, la Secretaría
              de Educación Municipal de Soledad solicita la presente
              autorización para la toma y tratamiento de datos biométricos y
              registros fotográficos de los estudiantes beneficiarios de la
              matrícula contratada.
            </p>

            <hr className="border-dashed my-4" />

            <h4 className="font-bold text-sm mb-2">DATOS DEL ESTUDIANTE</h4>
            <div className="flex flex-col gap-1 text-sm mb-4">
              <p>
                <span className="font-medium">Nombre completo:</span>{" "}
                {nombreEstudiante}
              </p>
              <p>
                <span className="font-medium">Tipo y número de documento:</span>{" "}
                {tipoDocEstudiante} {numDocEstudiante}
              </p>
              <p>
                <span className="font-medium">Institución educativa:</span>{" "}
                {nombreInstitucion}
              </p>
              <p>
                <span className="font-medium">Grado:</span>{" "}
                {gradoGrupo || "_______________"}
              </p>
            </div>

            <h4 className="font-bold text-sm mb-2">
              DATOS DEL PADRE, MADRE, ACUDIENTE O REPRESENTANTE LEGAL
            </h4>
            <div className="flex flex-col gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nombre completo:
                </label>
                <input
                  type="text"
                  value={nombreAcudiente}
                  onChange={(e) => setNombreAcudiente(e.target.value)}
                  className="w-full p-2 border rounded bg-surface"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tipo y número de documento:
                </label>
                <input
                  type="text"
                  value={identificacionAcudiente}
                  onChange={(e) => setIdentificacionAcudiente(e.target.value)}
                  className="w-full p-2 border rounded bg-surface"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Parentesco o calidad en que actúa:
                </label>
                <input
                  type="text"
                  value={calidadDe}
                  onChange={(e) => setCalidadDe(e.target.value)}
                  className="w-full p-2 border rounded bg-surface"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Teléfono de contacto:
                </label>
                <input
                  type="text"
                  value={telefonoAcudiente}
                  onChange={(e) => setTelefonoAcudiente(e.target.value)}
                  className="w-full p-2 border rounded bg-surface"
                />
              </div>
            </div>

            <hr className="border-dashed my-4" />

            <h4 className="font-bold text-sm mb-2">AUTORIZACIÓN</h4>
            <p className="text-sm text-justify mb-2">
              Yo _________________________________________________
              identificado(a) como aparece al pie de mi correspondiente firma,
              actuando en calidad de padre, madre, acudiente o representante
              legal del estudiante anteriormente identificado, autorizo de
              manera libre, previa expresa e informada a la Secretaría de
              Educación Municipal de Soledad para realizar la toma de datos
              biométricos (huellas dactilares) y registros fotográficos del
              estudiante.
            </p>
            <p className="text-sm text-justify mb-2">
              Declaro que he sido informado(a) de que dichos datos serán
              recolectados y tratados exclusivamente para las actividades de
              inspección, vigilancia, seguimiento y control de los recursos del
              Sistema General de Participaciones (SGP) asignados a la matrícula
              contratada, de la cual mi hijo es beneficiario, así como para la
              verificación de la información relacionada con la prestación del
              servicio educativo.
            </p>
            <p className="text-sm text-justify mb-2">
              Igualmente, manifiesto conocer que la información será tratada
              conforme a la Ley 1581 de 2012 y demás normas aplicables sobre
              protección de datos personales, garantizando la confidencialidad,
              seguridad y uso exclusivo para las finalidades aquí descritas.
            </p>
            <p className="text-sm text-justify mb-4">
              La presente autorización se otorga de manera voluntaria y
              permanecerá vigente durante el tiempo requerido para el
              cumplimiento de las finalidades señaladas y las obligaciones
              legales correspondientes.
            </p>

            <hr className="border-dashed my-4" />

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Firma del padre, madre o acudiente:
                </label>
                <div className="border-b border-black h-10" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nombre completo:
                </label>
                <input
                  type="text"
                  value={nombreAcudiente}
                  onChange={(e) => setNombreAcudiente(e.target.value)}
                  className="w-full p-2 border rounded bg-surface"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Documento de identidad:
                </label>
                <input
                  type="text"
                  value={identificacionAcudiente}
                  onChange={(e) => setIdentificacionAcudiente(e.target.value)}
                  className="w-full p-2 border rounded bg-surface"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <SimpleButton
                msj="Descargar PDF"
                bg="bg-green-600"
                text="text-surface"
                icon="DownloadCloud"
                onClick={handleDownloadPDF}
              />
              <SimpleButton
                msj="Cerrar"
                bg="bg-secondary"
                text="text-surface"
                icon="X"
                onClick={onClose}
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default HabeasDataModal;
