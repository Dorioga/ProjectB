import { useState, useRef, useCallback } from "react";
import Modal from "../atoms/Modal";
import SimpleButton from "../atoms/SimpleButton";
import Loader from "../atoms/Loader";
import useAuth from "../../lib/hooks/useAuth";

/**
 * Modal encargado de mostrar los términos y condiciones y la política de datos.
 * - onClose  : cierra el modal sin navegar (botón ✕ / backdrop).
 * - onAccept : se llama tras enviar la aceptación y navega al dashboard.
 *              Si no se proporciona, usa onClose como fallback.
 */
const TermsModal = ({ isOpen, onClose, onAccept, pendingIdPersona }) => {
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const { accessData, rol, numero_identificacion } = useAuth();

  const isRole5 = String(rol) === "5" || String(rol) === "6";

  const parseIdPersona = (val) => {
    try {
      return parseInt(JSON.parse(val), 10);
    } catch {
      return parseInt(String(val).replace(/['"/\\]/g, ""), 10);
    }
  };

  /* ── Handler principal ───────────────────────────────────────── */
  const handleAccept = useCallback(async () => {
    setLoading(true);
    // Usar prop si existe (datos aún no están en localStorage), si no fallback a localStorage
    let idPersona = pendingIdPersona
      ? pendingIdPersona
      : parseIdPersona(localStorage.getItem("idPersona"));
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
  }, [pendingIdPersona, numero_identificacion, accessData, onAccept, onClose]);

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
            He leído y acepto los términos y condiciones
          </label>
        </div>

        <div className="flex items-center gap-4">
          <SimpleButton
            msj="Continuar"
            onClick={handleAccept}
            disabled={!checked || loading}
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
