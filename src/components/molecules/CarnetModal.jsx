import React, { useRef, useState, useEffect } from "react";
import Modal from "../atoms/Modal";
import PreviewIMG from "../atoms/PreviewIMG";
import { exportElementToPNG } from "../../utils/exportPdf";
import { QRCodeCanvas } from "qrcode.react";
import { getQR } from "../../services/studentService";

const CarnetModal = ({ isOpen, onClose, data }) => {
  const cardRef = useRef(null);
  const [qrValue, setQrValue] = useState("");
  const [qrLoading, setQrLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !data?.id_estudiante) return;
    const fk_sede = data.fk_sede ?? data.id_sede ?? data.sede_id;
    if (!fk_sede) return;
    setQrLoading(true);
    getQR({ id_estudiante: data.id_estudiante, fk_sede })
      .then((res) => setQrValue(res?.QR ?? res?.qr ?? ""))
      .catch(() => setQrValue(""))
      .finally(() => setQrLoading(false));
  }, [
    isOpen,
    data?.id_estudiante,
    data?.fk_sede,
    data?.id_sede,
    data?.sede_id,
  ]);

  const fullName = [
    data?.first_name,
    data?.second_name,
    data?.first_lastname,
    data?.second_lastname,
  ]
    .filter(Boolean)
    .join(" ");

  const handleDownloadPNG = async () => {
    await exportElementToPNG(
      cardRef.current,
      `Carnet-${data?.identification || "estudiante"}.png`,
      { scale: 3, backgroundColor: "#ffffff", useCORS: true },
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Carnét del estudiante"
      size="xl"
    >
      {data ? (
        <>
          {/* CARNET */}
          <div
            ref={cardRef}
            className="flex rounded-2xl overflow-hidden shadow-xl bg-white"
          >
            {/* IZQUIERDA */}
            <div className="w-2/5 bg-primary text-surface flex flex-col items-center justify-center gap-4 p-6">
              <h2 className="text-center font-bold text-sm uppercase leading-tight">
                {data.name_school || "Institución Educativa"}
              </h2>
              <div className="w-28 h-28 rounded-full bg-white overflow-hidden flex items-center justify-center shrink-0">
                <PreviewIMG path={data.url_photo} size="profile" />
              </div>
              <h3 className="text-center font-semibold text-sm">{fullName}</h3>
              <p className="text-sm opacity-80">Carnet Estudiantil</p>
            </div>

            {/* DERECHA */}
            <div className="flex-1 flex flex-col justify-between p-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-primary font-bold text-base mb-2">
                  Información del Estudiante
                </h2>
                <p className="text-primary text-sm">
                  <strong>Documento:</strong> {data.identification}
                </p>
                <p className="text-primary text-sm">
                  <strong>Género:</strong> {data.genre}
                </p>
                <p className="text-primary text-sm">
                  <strong>Curso:</strong> {data.grade_scholar}{" "}
                  {data.group_grade}
                </p>
                <p className="text-primary text-sm">
                  <strong>Estado:</strong> {data.status_beca}
                </p>
              </div>

              {/* QR */}
              <div className="flex justify-around items-center mt-4">
                <p className="text-xs text-gray-500 max-w-[150px]">
                  Escanee este código para registrar ingresos y salidas del
                  estudiante.
                </p>
                {qrLoading ? (
                  <div className="w-28 h-28 flex items-center justify-center text-sm text-gray-400">
                    Cargando...
                  </div>
                ) : qrValue ? (
                  <QRCodeCanvas value={qrValue} size={120} level="H" />
                ) : (
                  <div className="w-28 h-28 flex items-center justify-center text-xs text-gray-400 border rounded">
                    Sin QR
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* BOTONES */}
          <div className="flex justify-center gap-3 mt-4">
            <button
              onClick={handleDownloadPNG}
              className="px-5 py-3 bg-green-600 text-white rounded-xl cursor-pointer hover:bg-green-700 transition-colors"
            >
              Descargar Carnet PNG
            </button>
            <button
              onClick={onClose}
              className="px-5 py-3 bg-red-600 text-white rounded-xl cursor-pointer hover:bg-red-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </>
      ) : (
        <p>No hay datos disponibles para el carné.</p>
      )}
    </Modal>
  );
};

export default CarnetModal;
