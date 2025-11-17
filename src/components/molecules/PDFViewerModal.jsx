import React from "react";
import Modal from "../atoms/Modal";
import PDFViewer from "../atoms/PDFViewer";

const PDFViewerModal = ({
  isOpen,
  onClose,
  pdfUrl,
  title = "Documento PDF",
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
      <div className="w-full h-[600px]">
        {pdfUrl ? (
          <PDFViewer pdfUrl={pdfUrl} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No hay documento disponible</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PDFViewerModal;
