import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

// Configurar worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PDFViewer = ({ file, className = "" }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(numPages || 1, prev + 1));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(2.5, prev + 0.25));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(0.5, prev - 0.25));
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Controles superiores */}
      <div className="flex items-center gap-4 bg-surface p-3 rounded-lg shadow">
        {/* Zoom */}
        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            className="p-2 bg-secondary text-white rounded hover:bg-secondary/90 disabled:opacity-50"
            disabled={scale <= 0.5}
            title="Alejar"
          >
            <ZoomOut size={18} />
          </button>
          <span className="text-sm font-medium min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="p-2 bg-secondary text-white rounded hover:bg-secondary/90 disabled:opacity-50"
            disabled={scale >= 2.5}
            title="Acercar"
          >
            <ZoomIn size={18} />
          </button>
        </div>

        {/* Separador */}
        <div className="h-6 w-px bg-gray-300" />

        {/* Navegación de páginas */}
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="p-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
            title="Página anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium min-w-[100px] text-center">
            Página {pageNumber} de {numPages || "..."}
          </span>
          <button
            onClick={goToNextPage}
            disabled={pageNumber >= (numPages || 1)}
            className="p-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
            title="Página siguiente"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Visualizador del PDF */}
      <div className="border rounded-lg overflow-auto max-h-[600px] bg-gray-100 p-4">
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(error) => console.error("Error al cargar PDF:", error)}
          loading={
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-600">Cargando PDF...</p>
            </div>
          }
          error={
            <div className="flex items-center justify-center h-64">
              <p className="text-red-600">Error al cargar el PDF</p>
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="shadow-lg"
          />
        </Document>
      </div>
    </div>
  );
};

export default PDFViewer;
