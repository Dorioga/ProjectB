import React, { useRef } from "react";
import Modal from "../atoms/Modal";
// Si tu hook es export default, usa esta importación.
// Si es export nombrado, cambia a: import { useAuth } from "../../lib/hooks/useAuth";
import PreviewIMG from "../atoms/PreviewIMG";
import { exportCardToPDF, exportElementToPNG } from "../../utils/exportPdf";
import useSchool from "../../lib/hooks/useSchool";

const CarnetModal = ({ isOpen, onClose, data }) => {
  const cardRef = useRef(null);
  const printRef = useRef(null);
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const { pathSignature } = useSchool();
  let fullName =
    data.first_name +
    " " +
    data.second_name +
    " " +
    data.first_lastname +
    " " +
    data.second_lastname;
  const handleDownloadPDF = async (dosPaginas = true) => {
    await exportCardToPDF(frontRef.current, backRef.current, {
      twoPages: dosPaginas,
      fileName: `Carnet-${data?.identification || "estudiante"}.pdf`,
    });
  };
  const handleDownloadPNG = async (side) => {
    await exportElementToPNG(
      side === "front" ? frontRef.current : backRef.current,
      `Carnet-${data?.identification || "estudiante"}-${side}.png`
    );
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Carné del Estudiante">
      {/* Estilos de impresión: sólo imprime el contenedor del carné */}
      <div className="flex flex-col gap-4  rounded-lg " ref={cardRef}>
        {data ? (
          <div className="flex flex-col gap-4">
            <div
              className="grid grid-cols-5 border rounded  aspect-86/54 "
              ref={frontRef}
            >
              <div className="col-span-5 grid grid-cols-3 py-2 px-4 bg-primary border rounded">
                <PreviewIMG path={"/logo-school.svg"} size={"logo"} />
                <h2 className=" col-span-2 text-lg font-bold text-center text-white">
                  {data.name_school}
                </h2>
              </div>
              <div className="col-span-2 py-2 px-1">
                <PreviewIMG path={data.url_photo} size="profile" />
              </div>
              <div className="col-span-3 px-1 py-2 text-center">
                <div>
                  <h3 className="font-semibold">Nombre Completo</h3>
                  <p>{fullName}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Genero</h3>
                  <p>{data.genre}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Documento de Identidad</h3>
                  <p>{data.identification}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Grado y Curso</h3>
                  <p>
                    {data.grade_scholar} {data.group_grade}
                  </p>
                </div>
              </div>
            </div>
            <div
              className="grid grid-cols-2 border rounded  aspect-86/54  "
              ref={backRef}
            >
              <div className="py-2 px-1 flex items-center justify-center">
                <PreviewIMG
                  path={
                    "https://cdn.pixabay.com/photo/2023/02/28/01/51/qr-code-7819654_1280.jpg"
                  }
                  size="carnet"
                />
              </div>
              <div className=" px-1 py-2 text-center gap-2 flex items-center flex-col ">
                <div className="py-2">
                  <h3 className="font-bold text-3xl">Información</h3>
                  <p className="text-center">
                    Este carnet es personal e intransferible, el uso inadecuado
                    de este documento es responsabilidad del titular
                  </p>
                </div>
                <div className="w-full">
                  <div className="h-16 border  rounded-2xl flex items-end justify-center p-1">
                    {/* <PreviewIMG
                      path={pathSignature}
                      size="banner"
                      className="h-16"
                    /> */}
                    <h3 className="font-semibold ">Firma</h3>
                  </div>
                </div>
                <div className=" rounded-2xl  text-3xl text-accent  flex justify-center items-center">
                  <h3 className="font-bold">{data.state_bd}</h3>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p>No hay datos disponibles para el carné.</p>
        )}
      </div>
      <div className="grid grid-cols-4 gap-4 mt-4">
        <button
          onClick={() => handleDownloadPDF(true)}
          className="px-4 py-2 bg-primary text-white rounded"
        >
          PDF (2 páginas)
        </button>
        <button
          onClick={() => handleDownloadPDF(false)}
          className="px-4 py-2 bg-primary/80 text-white rounded"
        >
          PDF (1 página)
        </button>
        <button
          onClick={() => handleDownloadPNG("front")}
          className="px-4 py-2 bg-secondary text-white rounded"
        >
          PNG (frente)
        </button>
        <button
          onClick={() => handleDownloadPNG("back")}
          className="px-4 py-2 bg-secondary text-white rounded"
        >
          PNG (atrás)
        </button>
      </div>
    </Modal>
  );
};

export default CarnetModal;
