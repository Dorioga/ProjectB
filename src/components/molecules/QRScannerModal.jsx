import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import Modal from "../atoms/Modal";
import SimpleButton from "../atoms/SimpleButton";

const SCANNER_ID = "qr-scanner-region";

const QRScannerModal = ({
  isOpen,
  onClose,
  onScan,
  title = "Escanear QR del carnet",
}) => {
  const scannerRef = useRef(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const startedRef = useRef(false);

  const stopScanner = async () => {
    if (scannerRef.current && startedRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (_) {
        // ignorar errores al detener
      }
      startedRef.current = false;
    }
    scannerRef.current = null;
  };

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;

    const startScanner = async () => {
      // Esperar a que el DOM renderice el contenedor
      await new Promise((r) => setTimeout(r, 200));
      if (!mounted) return;

      try {
        const html5QrCode = new Html5Qrcode(SCANNER_ID);
        scannerRef.current = html5QrCode;

        setScanning(true);
        setError(null);

        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (!mounted) return;
            stopScanner().then(() => {
              if (mounted) {
                setScanning(false);
                onScan?.(decodedText);
              }
            });
          },
          () => {
            // frame sin QR, ignorar
          },
        );
        startedRef.current = true;
      } catch (err) {
        if (mounted) {
          setError("No se pudo acceder a la cámara. Verifica los permisos.");
          setScanning(false);
        }
      }
    };

    startScanner();

    return () => {
      mounted = false;
      stopScanner();
    };
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = async () => {
    await stopScanner();
    setScanning(false);
    setError(null);
    onClose?.();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="md">
      <div className="flex flex-col gap-4 items-center">
        {error ? (
          <div className="w-full rounded bg-red-100 border border-red-400 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center">
            {scanning
              ? "Apunta la cámara al código QR del carnet del estudiante..."
              : "Iniciando cámara..."}
          </p>
        )}

        {/* Contenedor donde html5-qrcode monta el video */}
        <div
          id={SCANNER_ID}
          className="w-full rounded overflow-hidden"
          style={{ minHeight: "300px" }}
        />

        <SimpleButton
          onClick={handleClose}
          msj="Cancelar"
          bg="bg-gray-400"
          text="text-surface"
          icon="X"
        />
      </div>
    </Modal>
  );
};

export default QRScannerModal;
