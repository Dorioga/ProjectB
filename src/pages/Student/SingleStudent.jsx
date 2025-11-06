import React, { useState } from "react";
import SimpleButton from "../../components/atoms/SimpleButton";
import useStudent from "../../lib/hooks/useStudent";
import { handleNumericInput } from "../../utils/formatUtils";
import ProfileStudent from "../../components/molecules/ProfileStudent";
import QRModal from "../../components/molecules/QRModal";
import CarnetModal from "../../components/molecules/CarnetModal";

const SingleStudent = () => {
  const { fetchStudent, selected, loading, error } = useStudent(); // ✅ Obtener selected del contexto
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
    handleNumericInput(e, setStudentId, { maxLength: 15 });
  };
  const handleSearch = async () => {
    if (!studentId) {
      alert("Por favor ingrese un documento de identidad");
      return;
    }
    //1096252058
    try {
      console.log("Buscando estudiante con ID:", studentId);
      await fetchStudent(studentId);
      // El resultado se guarda automáticamente en 'selected' del contexto
    } catch (err) {
      console.error("Error al buscar estudiante:", err);
      alert("Estudiante no encontrado");
    }
  };

  const handleQRCodeScan = () => {
    // TODO: escaneo Código QR
    console.log("Código QR leído:", code);
  };

  return (
    <div className="border p-6 rounded bg-bg h-full gap-4 flex flex-col">
      <h2 className="font-bold text-2xl">Perfil Estudiante</h2>

      <div id="Busqueda" className="w-full flex flex-col gap-4 border-b pb-4">
        <div className="grid grid-cols-4 items-center justify-center gap-4">
          <div className="grid grid-cols-6 items-center gap-4 w-full col-span-2">
            <label className="col-span-2 text-lg font-semibold">
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

          <div className="flex flex-row items-center justify-center gap-4 w-full">
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
            <div className="flex flex-row items-center justify-start gap-4 w-full">
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
