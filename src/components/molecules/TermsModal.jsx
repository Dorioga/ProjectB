import { useState, useRef, useCallback } from "react";
import Modal from "../atoms/Modal";
import SimpleButton from "../atoms/SimpleButton";
import Loader from "../atoms/Loader";
import useAuth from "../../lib/hooks/useAuth";
import SignatureCanvas from "react-signature-canvas";

/**
 * Modal encargado de mostrar los términos y condiciones y la política de datos.
 * - onClose  : cierra el modal sin navegar (botón ✕ / backdrop).
 * - onAccept : se llama tras enviar la aceptación y navega al dashboard.
 *              Si no se proporciona, usa onClose como fallback.
 */
const TermsModal = ({ isOpen, onClose, onAccept }) => {
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signatureData, setSignatureData] = useState("");
  const [signatureSaved, setSignatureSaved] = useState(false);
  const [savingSig, setSavingSig] = useState(false);

  const sigCanvas = useRef(null);

  const {
    accessData,
    rol,
    registerSignature,
    idPersona,
    numero_identificacion,
  } = useAuth();

  const isRole5 = String(rol) === "5";

  const parseIdPersona = (val) => {
    try {
      return parseInt(JSON.parse(val), 10);
    } catch {
      return parseInt(String(val).replace(/['"/\\]/g, ""), 10);
    }
  };

  /* ── Handlers de firma ───────────────────────────────────────── */
  const handleSignatureEnd = useCallback(() => {
    const data = sigCanvas.current?.toDataURL("image/png") ?? "";
    setSignatureData(data);
  }, []);

  const handleClearSignature = useCallback(() => {
    sigCanvas.current?.clear();
    setSignatureData("");
    setSignatureSaved(false);
  }, []);

  const handleCancelSignature = useCallback(() => {
    sigCanvas.current?.clear();
    setSignatureData("");
    setSignatureSaved(false);
    setChecked(false);
  }, []);

  const handleSaveSignature = useCallback(async () => {
    if (!signatureData || !numero_identificacion) return;
    setSavingSig(true);
    try {
      await registerSignature({
        identificacion: numero_identificacion,
        imageBase64: signatureData,
      });
      setSignatureSaved(true);
    } catch (err) {
      console.error("Error guardando firma:", err);
    } finally {
      setSavingSig(false);
    }
  }, [signatureData, numero_identificacion, registerSignature]);

  /* ── Handler principal ───────────────────────────────────────── */
  const handleAccept = useCallback(async () => {
    if (isRole5 && !signatureSaved) return;
    setLoading(true);
    let idPersona = parseIdPersona(localStorage.getItem("idPersona"));
    console.log("Enviando aceptación de términos para idPersona:", idPersona);
    try {
      await accessData({ fk_perona: idPersona, numero_identificacion });
      localStorage.setItem("termsAccepted", "true");
      (onAccept ?? onClose)();
    } catch (err) {
      console.error("Error enviando aceptación de términos:", err);
    } finally {
      setLoading(false);
    }
  }, [
    isRole5,
    signatureSaved,
    idPersona,
    numero_identificacion,
    accessData,
    onAccept,
    onClose,
  ]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Aceptación de términos y condiciones y Política de Datos"
      size="md"
    >
      <div className="space-y-4">
        <p>
          En cumplimiento de la Ley 1581 de 2012 y demás normas aplicables en
          materia de protección de datos personales, Nexus informa que el
          tratamiento de la información se realiza conforme a su Política de
          Tratamiento de Datos Personales.
        </p>
        <p>Le invitamos a leer los documentos completos antes de continuar.</p>
        <ul className="list-disc pl-6">
          <li>
            <a
              href="https://nexusplataforma.com/storage/otros/T%C3%89RMINOS%20Y%20CONDICIONES%20DE%20USO.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Términos y condiciones de uso (PDF)
            </a>
          </li>
          <li>
            <a
              href="https://nexusplataforma.com/storage/otros/POL%C3%8DTICA%20DE%20TRATAMIENTO%20DE%20DATOS%20PERSONALES.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Política de tratamiento de datos personales (PDF)
            </a>
          </li>
        </ul>
        <div className="flex items-start">
          <input
            id="terms-checkbox"
            type="checkbox"
            checked={checked}
            onChange={() => setChecked((v) => !v)}
            className="mr-2 mt-1"
          />
          <label htmlFor="terms-checkbox" className="text-sm">
            He leído y acepto los términos y condiciones y la Política de
            Tratamiento de Datos Personales.
          </label>
        </div>
        {/* signature canvas for role 5 */}
        {isRole5 && checked && (
          <div className="space-y-2">
            {/* option to save signature to server */}
            <SignatureCanvas
              ref={sigCanvas}
              penColor="black"
              canvasProps={{ className: "signature-canvas border w-full h-32" }}
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
              <div className="relative inline-block">
                <SimpleButton
                  msj="Guardar firma"
                  onClick={handleSaveSignature}
                  disabled={!signatureData || savingSig}
                  bg="bg-secondary"
                  text="text-surface"
                  hover="hover:bg-secondary/80"
                />
                {savingSig && (
                  <span className="absolute right-0 top-0">
                    <Loader />
                  </span>
                )}
              </div>
              <SimpleButton
                msj="Cancelar"
                onClick={handleCancelSignature}
                bg="bg-red-500"
                text="text-surface"
                hover="hover:bg-red-600"
              />
            </div>
            {isRole5 && !signatureData && (
              <p className="text-xs text-error">
                Debe dibujar su firma para poder continuar.
              </p>
            )}
            {isRole5 && signatureData && !signatureSaved && (
              <p className="text-xs text-warning">
                Después de dibujar la firma, pulse{" "}
                <strong>Guardar firma</strong> para habilitar el botón
                Continuar.
              </p>
            )}
          </div>
        )}

        <div className="flex items-center gap-4">
          <SimpleButton
            msj="Continuar"
            onClick={handleAccept}
            disabled={!checked || loading || (isRole5 && !signatureSaved)}
            bg="bg-secondary"
            text="text-surface"
            hover="hover:bg-secondary/80"
          />
          {loading && <Loader />}
        </div>
      </div>
    </Modal>
  );
};

export default TermsModal;
