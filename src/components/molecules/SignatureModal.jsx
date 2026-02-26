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
  const { registerSignature, numero_identificacion } = useAuth();

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
    setSavingSig(true);
    try {
      await registerSignature({
        identificacion: numero_identificacion,
        imageBase64: signatureData,
      });
      setSaved(true);
      if (onSaved) onSaved();
    } catch (err) {
      console.error("Error guardando firma:", err);
    } finally {
      setSavingSig(false);
    }
  }, [signatureData, numero_identificacion, registerSignature, onSaved]);

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
