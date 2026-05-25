import { useState, useRef, useCallback } from "react";
import Modal from "../atoms/Modal";
import SimpleButton from "../atoms/SimpleButton";
import Loader from "../atoms/Loader";
import useAuth from "../../lib/hooks/useAuth";
import SignatureCanvas from "react-signature-canvas";

/**
 * Modal independiente que permite al usuario dibujar y guardar su firma.
 * Sólo se encarga de esta lógica, sin términos ni otros pasos.
 *
 * Props:
 * - isOpen: boolean para mostrar/ocultar el modal.
 * - onClose: callback que se llama cuando se cierra el modal.
 * - onSaved: (opcional) se dispara tras un guardado exitoso.
 */
const SignatureModal = ({ isOpen, onClose, onSaved }) => {
  const [signatureData, setSignatureData] = useState("");
  const [savingSig, setSavingSig] = useState(false);
  const [saved, setSaved] = useState(false);

  const sigCanvas = useRef(null);
  const {
    registerSignature,
    updateFirma,
    numero_identificacion,
    rol,
    idInstitution,
    userId,
    idDocente,
    idPersona,
  } = useAuth();

  const handleSignatureEnd = useCallback(() => {
    const data = sigCanvas.current?.toDataURL("image/png") ?? "";
    setSignatureData(data);
  }, []);

  const handleClearSignature = useCallback(() => {
    sigCanvas.current?.clear();
    setSignatureData("");
    setSaved(false);
  }, []);

  const handleSaveSignature = useCallback(async () => {
    if (!signatureData || !numero_identificacion) return;
    const rolParam =
      rol === 7 || rol === 2
        ? "docentes"
        : rol === 5
          ? "acudientes"
          : rol === "7" || rol === "2"
            ? "docentes"
            : rol === "5"
              ? "acudientes"
              : null;
    if (!rolParam) return;
    setSavingSig(true);

    const formData = new FormData();
    formData.append("identificacion", String(numero_identificacion));
    formData.append("imageBase64", signatureData);

    try {
      const result = await registerSignature(formData, rolParam);

      // Construir URL de firma desde el response
      const folder = result?.data?.folder?.replace("/var/www", "") ?? "";
      const fileName = result?.data?.fileName ?? "";
      const signatureUrl = `https://www.nexusplataforma.com${folder}/${fileName}`;

      // Payload y type según rol
      const rolNum = Number(rol);
      let patchPayload;
      let patchType;
      if (rolNum === 2) {
        patchPayload = {
          institutionId: idInstitution,
          signaturePrincipal: signatureUrl,
        };
        patchType = "institucion";
      } else if (rolNum === 5) {
        patchPayload = {
          fk_persona: idPersona,
          signatureGuardian: signatureUrl,
        };
        patchType = "acudiente";
      } else if (rolNum === 7) {
        patchPayload = {
          id_docente: idDocente,
          signatureTeacher: signatureUrl,
        };
        patchType = "docente";
      }

      if (patchPayload && patchType) {
        await updateFirma(patchPayload, patchType);
      }

      console.log("Firma guardada con éxito:", result);
      setSaved(true);
      if (onSaved) onSaved();
    } catch (err) {
      console.error("Error guardando firma:", err);
    } finally {
      setSavingSig(false);
    }
  }, [
    signatureData,
    numero_identificacion,
    rol,
    idInstitution,
    idPersona,
    idDocente,
    registerSignature,
    updateFirma,
    onSaved,
  ]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar firma" size="md">
      <div className="space-y-4">
        <p className="text-sm">
          Dibuje su firma en el recuadro y luego use el botón "Guardar firma".
        </p>
        <SignatureCanvas
          ref={sigCanvas}
          penColor="black"
          canvasProps={{
            className: "signature-canvas border w-full h-36 rounded",
          }}
          onEnd={handleSignatureEnd}
        />
        <div className="flex gap-2">
          <SimpleButton
            msj="Limpiar"
            onClick={handleClearSignature}
            bg="bg-gray-300"
            text="text-black"
            hover="hover:bg-gray-400"
          />
          <SimpleButton
            msj={saved ? "Guardada" : "Guardar firma"}
            onClick={handleSaveSignature}
            disabled={!signatureData || savingSig || saved}
            bg="bg-secondary"
            text="text-surface"
            hover="hover:bg-secondary/80"
          />
        </div>
        {savingSig && <Loader size={24} />}
        {saved && <p className="text-sm text-green-600">Firma guardada</p>}
      </div>
    </Modal>
  );
};

export default SignatureModal;
