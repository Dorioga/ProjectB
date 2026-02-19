import { useState } from "react";
import Loader from "./Loader";

const PDFViewer = ({ pdfUrl }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded">
        <p className="text-gray-500">No se proporcionó la URL del documento</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {loading && <Loader message="Cargando documento..." size={56} />}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <p className="text-red-500 mb-2">Error al cargar el documento.</p>
            <p className="text-sm text-gray-600">URL del documento: {pdfUrl}</p>
          </div>
        </div>
      )}

      <iframe
        src={pdfUrl}
        className="w-full h-full border-0 rounded"
        title="Visor de PDF"
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};

export default PDFViewer;
