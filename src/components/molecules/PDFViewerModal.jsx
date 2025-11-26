import React from "react";
import Modal from "../atoms/Modal";
import PDFViewer from "../atoms/PDFViewer";
import SimpleButton from "../atoms/SimpleButton";

const PDFViewerModal = ({
  isOpen,
  onClose,
  pdfUrl,
  title = "Documento PDF",
}) => {
  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = `${title}.pdf`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
      <div className="w-full">
        {/* Visor de PDF */}
        <div className="w-full h-[600px]">
          {pdfUrl ? (
            <PDFViewer pdfUrl={pdfUrl} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No hay documento disponible.</p>
            </div>
          )}
        </div>
        {/* Botones de acción */}
        <div className="flex gap-2 pt-4 justify-end">
          <SimpleButton
            onClick={handleDownload}
            msj="Descargar documento"
            icon="Download"
            bg="bg-accent"
            text="text-white"
          ></SimpleButton>
        </div>
      </div>
    </Modal>
  );
};

export default PDFViewerModal;
