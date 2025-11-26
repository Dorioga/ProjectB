import React, { useState } from "react";
import Modal from "../atoms/Modal";

const QRModal = ({ isOpen, onClose, onScan, title = "Escanear código QR" }) => {
  const [manualCode, setManualCode] = useState("");

  // const handleSimulatedScan = () => {
  //   const code = manualCode.trim();
  //   if (!code) return;
  //   onScan?.(code);
  //   onClose?.();
  // };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4">
        <div className="w-full aspect-video bg-gray-100 rounded border border-dashed border-gray-300 flex items-center justify-center text-gray-500">
          {/* Aquí puedes montar un lector real (react-qr-reader, html5-qrcode, etc.) */}
          Vista previa del lector QR
        </div>

        {/* <div className="flex items-center gap-2">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Pegar código QR manualmente"
            className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-secondary"
          />
          <button
            type="button"
            onClick={handleSimulatedScan}
            disabled={!manualCode.trim()}
            className="px-4 py-2 bg-secondary text-white rounded disabled:opacity-50 hover:bg-secondary/90"
          >
            Usar código
          </button>
        </div> */}

        <p className="text-sm text-gray-500">
          Sugerencia: integra un lector real (por ejemplo, 'react-qr-reader' o
          'html5-qrcode').
        </p>
      </div>
    </Modal>
  );
};

export default QRModal;
