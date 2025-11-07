import React, { useState } from "react";

// Componente de ejemplo para la vista previa de un certificado
const CertificadoPreview = () => (
  <div className="p-4 border-2 border-dashed rounded-lg">
    <h3 className="text-center font-bold text-lg">CERTIFICADO ESCOLAR</h3>
    <p className="mt-4 text-sm">
      La institución <strong>Nombre de la Institución</strong> certifica que el
      estudiante <strong>Nombre del Estudiante</strong>, identificado con NUI{" "}
      <strong>123456789</strong>, se encuentra matriculado en el grado{" "}
      <strong>Décimo</strong> para el presente año lectivo.
    </p>
    <p className="mt-6 text-center text-xs">
      Generado el: {new Date().toLocaleDateString()}
    </p>
  </div>
);

// Componente de ejemplo para la vista previa de un paz y salvo
const PazYSalvoPreview = () => (
  <div className="p-4 border-2 border-dashed rounded-lg">
    <h3 className="text-center font-bold text-lg">PAZ Y SALVO</h3>
    <p className="mt-4 text-sm">
      La institución <strong>Nombre de la Institución</strong> hace constar que
      el estudiante <strong>Nombre del Estudiante</strong> se encuentra a paz y
      salvo por todo concepto con la institución a la fecha.
    </p>
    <p className="mt-6 text-center text-xs">
      Válido hasta: {new Date().toLocaleDateString()}
    </p>
  </div>
);

// Componente de ejemplo para la vista previa de un carnet

const Reports = () => {
  const reportOptions = [
    { value: "none", label: "Seleccione un formato" },
    { value: "certificado", label: "Certificado Escolar" },
    { value: "pazysalvo", label: "Paz y Salvo" },
  ];

  const [selectedReport, setSelectedReport] = useState("none");

  const handleReportChange = (e) => {
    setSelectedReport(e.target.value);
  };

  const renderPreview = () => {
    switch (selectedReport) {
      case "certificado":
        return <CertificadoPreview />;
      case "pazysalvo":
        return <PazYSalvoPreview />;

      default:
        return (
          <p className="text-center text-gray-500">
            Seleccione un formato para ver la vista previa.
          </p>
        );
    }
  };

  return (
    <div className="border p-6 rounded bg-bg h-full gap-6 flex flex-col">
      <div>
        <h2 className="text-xl font-bold mb-4">Generador de Reportes</h2>
        <div className="max-w-sm">
          <label
            htmlFor="report-select"
            className="block mb-2 text-sm font-medium"
          >
            Formato de Reporte:
          </label>
          <select
            id="report-select"
            value={selectedReport}
            onChange={handleReportChange}
            className="w-full p-2 border rounded bg-white"
          >
            {reportOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-grow border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Vista Previa</h3>
        <div className="p-4 rounded bg-background min-h-[300px] flex items-center justify-center">
          {renderPreview()}
        </div>
      </div>
    </div>
  );
};

export default Reports;
