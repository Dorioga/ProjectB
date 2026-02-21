import React, { useState } from "react";
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
const TermsModal = ({ isOpen, onClose, onAccept }) => {
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const { accessData } = useAuth();

  const handleAccept = async () => {
    let idPersona = localStorage.getItem("idPersona");
    if (!idPersona) {
      console.warn("TermsModal: no hay idPersona en localStorage");
      return;
    }
    // limpiar posibles comillas y convertir a número
    idPersona = idPersona.replace(/['"\\]/g, "");
    const idNum = parseInt(idPersona, 10);
    if (Number.isNaN(idNum)) {
      console.warn("TermsModal: idPersona no es un número válido", idPersona);
      return;
    }
    setLoading(true);
    try {
      let res = await accessData({ fk_perona: idNum });
      console.log("TermsModal - Respuesta de accessData:", res);
      localStorage.setItem("termsAccepted", "true");
      // Usar onAccept si existe; si no, onClose como fallback
      (onAccept ?? onClose)();
    } catch (err) {
      console.error("Error enviando aceptación de términos:", err);
    } finally {
      setLoading(false);
    }
  };

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
        {!localStorage.getItem("userId") && (
          <p className="text-xs text-error">
            Debe iniciar sesión para poder aceptar y continuar.
          </p>
        )}
        <div className="flex items-center gap-4">
          <SimpleButton
            msj="Continuar"
            onClick={handleAccept}
            disabled={!checked || loading || !localStorage.getItem("userId")}
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
