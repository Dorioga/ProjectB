import React, { useState } from "react";
import SimpleButton from "../../components/atoms/SimpleButton";
import useStudent from "../../lib/hooks/useStudent";
import { handleNumericInput } from "../../utils/formatUtils";
import ProfileStudent from "../../components/molecules/ProfileStudent";
import QRModal from "../../components/molecules/QRModal";
import CarnetModal from "../../components/molecules/CarnetModal";
import { getStudent } from "../../services/studentService";

const SingleStudent = () => {
  const { getStudent, selected, loading, error } = useStudent(); // ✅ Obtener selected del contexto
  const [studentId, setStudentId] = useState("");
  const [qrOpen, setQrOpen] = useState(false);
  const [carnetOpen, setCarnetOpen] = useState(false);
  const [fileDocument, setFileDocument] = useState({
    doc1: "",
    doc2: "",
    doc3: "",
    doc4: "",
  });
  const handleInputChange = (e) => {
    setStudentId(e.target.value);
  };
  const handleSearch = async () => {
    if (!studentId) {
      alert("Por favor ingrese un documento de identidad");
      return;
    }
    //1096252058
    try {
      const student = await getStudent(studentId);
      // getStudent del contexto ahora setea `selected`; además logueamos el resultado recibido
      console.log("Estudiante encontrado (retornado):", student);
    } catch (err) {
      console.error("Error al buscar estudiante:", err);
      alert("Estudiante no encontrado");
    }
  };

  const handleQRCodeScan = () => {
    // TODO: escaneo Código QR
  };

  return (
    <div className="border p-6 rounded bg-bg h-full gap-4 flex flex-col">
      <h2 className="font-bold text-2xl ">Perfil Estudiante</h2>

      <div className="w-full flex flex-col gap-4 border-b pb-4">
        <div className="grid grid-cols-4 xl:grid-cols-8  items-center justify-center gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3  xl:grid-cols-12 items-center w-full col-span-4 xl:col-span-8 gap-2">
            <div className="md:col-span-2 xl:col-span-4 flex flex-col ">
              <label className=" text-lg font-semibold">
                Documento de Identidad
              </label>
              <input
                className="bg-white rounded-sm p-2 border border-gray-300 col-span-3 focus:outline-none focus:ring-2 focus:ring-secondary"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Solo números (máx. 15 dígitos)"
                value={studentId}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
            <div className="md:col-span-1 xl:col-span-2 flex w-full h-full items-end">
              <SimpleButton
                msj={loading ? "Buscando..." : "Buscar"}
                onClick={handleSearch}
                bg={"bg-secondary"}
                text={"text-white"}
                hover={"hover:bg-secondary/80"}
                icon={"Search"}
                disabled={loading}
              />
            </div>
            <div className="md:col-span-3 xl:col-span-3 flex w-full h-full items-end">
              <SimpleButton
                msj={"Escanear QR"}
                onClick={() => setQrOpen(true)}
                bg={"bg-secondary"}
                text={"text-white"}
                hover={"hover:bg-secondary/80"}
                icon={"QrCode"}
              />
              <QRModal
                isOpen={qrOpen}
                onClose={() => setQrOpen(false)}
                onScan={handleQRCodeScan}
                title="Escanear QR del estudiante"
              />
            </div>
            {selected ? (
              <div className="md:col-span-3  xl:col-span-3 flex w-full h-full items-end">
                <SimpleButton
                  msj={"Generar Carnet"}
                  onClick={() => setCarnetOpen(true)}
                  bg={"bg-secondary"}
                  text={"text-white"}
                  hover={"hover:bg-secondary/80"}
                  icon={"IdCard"}
                />
                <CarnetModal
                  isOpen={carnetOpen}
                  onClose={() => setCarnetOpen(false)}
                  data={selected}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Mostrar loading */}
      {loading && (
        <div className="text-center py-4">
          <p className="text-gray-600">Buscando estudiante...</p>
        </div>
      )}

      {/* Mostrar error */}
      {error && !loading && (
        <div className="text-center py-4">
          <p className="text-red-600">Error: Estudiante no encontrado</p>
        </div>
      )}

      {/* Mostrar perfil del estudiante */}
      {selected && !loading && <ProfileStudent data={selected} />}
    </div>
  );
};

export default SingleStudent;
