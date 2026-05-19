import { useState, useCallback, useRef } from "react";
import { LogIn, LogOut, CheckCircle, Clock, MessageCircle } from "lucide-react";
import { entradaQR, salidaQR } from "../../services/schoolService";
import { useNotify } from "../../lib/hooks/useNotify";
import QRScannerModal from "../../components/molecules/QRScannerModal";
import Loader from "../../components/atoms/Loader";

const ControlAccesoSalida = () => {
  const notify = useNotify();

  // Tipo de acción activa: "entrada" | "salida" | null
  const [accionActiva, setAccionActiva] = useState(null);
  const [loading, setLoading] = useState(false);

  // Registro de la última operación exitosa
  const [ultimoRegistro, setUltimoRegistro] = useState(null);

  // URL de WhatsApp para notificar al acudiente
  const [whatsappURL, setWhatsappURL] = useState(null);

  // Ref para evitar doble llamada si el scanner dispara dos veces
  const procesandoRef = useRef(false);

  const handleScan = useCallback(
    async (decodedText) => {
      if (procesandoRef.current || !accionActiva) return;
      procesandoRef.current = true;
      setLoading(true);

      try {
        const payload = { qr: decodedText };
        const res =
          accionActiva === "entrada"
            ? await entradaQR(payload)
            : await salidaQR(payload);

        const ahora = new Date();
        const fecha = ahora.toLocaleDateString("es-CO", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        const hora = ahora.toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        setUltimoRegistro({
          tipo: accionActiva,
          fecha: res?.fecha ?? fecha,
          hora: res?.hora ?? hora,
          estudiante:
            res?.nombre_estudiante ?? res?.name ?? res?.student ?? "Estudiante",
          mensaje:
            res?.mensaje ??
            res?.message ??
            `${accionActiva === "entrada" ? "Entrada" : "Salida"} registrada. Notificación enviada al acudiente.`,
        });

        // Construir URL de WhatsApp si el backend devuelve mensaje y teléfono
        const mensaje = res?.mensaje;
        const telefono = res?.telefono_acudiente;
        if (mensaje && telefono) {
          const url =
            `https://api.whatsapp.com/send?phone=57${telefono}` +
            `&text=${encodeURIComponent(mensaje)}`;
          setWhatsappURL(url);
        } else {
          setWhatsappURL(null);
        }

        notify.success(
          `${accionActiva === "entrada" ? "Entrada" : "Salida"} registrada correctamente. El acudiente fue notificado.`,
        );
      } catch (err) {
        console.error("ControlAccesoSalida - error al registrar:", err);
        notify.error(
          err?.response?.data?.message ??
            err?.message ??
            "Error al registrar. Intenta nuevamente.",
        );
      } finally {
        setLoading(false);
        setAccionActiva(null);
        procesandoRef.current = false;
      }
    },
    [accionActiva, notify],
  );

  const abrirEntrada = () => {
    procesandoRef.current = false;
    setWhatsappURL(null);
    setAccionActiva("entrada");
  };

  const abrirSalida = () => {
    procesandoRef.current = false;
    setWhatsappURL(null);
    setAccionActiva("salida");
  };

  const handleCloseModal = () => {
    setAccionActiva(null);
    procesandoRef.current = false;
  };

  return (
    <div className="p-6 flex flex-col gap-6 min-h-full">
      {/* Encabezado */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-primary">
          Control de Acceso y Salida
        </h1>
        <p className="text-sm text-gray-500">
          Escanea el QR del carnet del estudiante para registrar su entrada o
          salida. Se enviará una notificación automática al acudiente.
        </p>
      </div>

      {/* Botones de acción */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
        <button
          type="button"
          onClick={abrirEntrada}
          disabled={loading}
          className="flex flex-col items-center justify-center gap-3 rounded-2xl p-8 bg-primary text-surface shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-60 cursor-pointer"
        >
          <LogIn size={48} />
          <span className="text-xl font-semibold">Entrada</span>
          <span className="text-sm opacity-80">Registrar ingreso</span>
        </button>

        <button
          type="button"
          onClick={abrirSalida}
          disabled={loading}
          className="flex flex-col items-center justify-center gap-3 rounded-2xl p-8 bg-accent text-surface shadow-lg hover:bg-accent/90 transition-colors disabled:opacity-60 cursor-pointer"
        >
          <LogOut size={48} />
          <span className="text-xl font-semibold">Salida</span>
          <span className="text-sm opacity-80">Registrar salida</span>
        </button>
      </div>

      {/* Loader mientras procesa */}
      {loading && (
        <div className="flex items-center gap-3 text-primary">
          <Loader />
          <span className="text-sm">
            Registrando y notificando al acudiente...
          </span>
        </div>
      )}

      {/* Último registro exitoso */}
      {ultimoRegistro && !loading && (
        <div className="max-w-lg rounded-2xl border border-green-300 bg-green-50 p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-green-700 font-semibold text-base">
            <CheckCircle size={20} />
            Registro exitoso
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase font-semibold text-gray-400">
                Tipo
              </span>
              <span className="capitalize font-medium">
                {ultimoRegistro.tipo}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase font-semibold text-gray-400">
                Estudiante
              </span>
              <span className="font-medium">{ultimoRegistro.estudiante}</span>
            </div>
            <div className="flex items-center gap-1 col-span-2">
              <Clock size={14} className="text-gray-400" />
              <span>
                {ultimoRegistro.fecha} — {ultimoRegistro.hora}
              </span>
            </div>
          </div>

          <p className="text-sm text-green-700 border-t border-green-200 pt-2">
            {ultimoRegistro.mensaje}
          </p>

          {whatsappURL && (
            <button
              type="button"
              onClick={() => {
                window.open(whatsappURL, "_blank", "noopener,noreferrer");
              }}
              className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 bg-[#25D366] text-white font-semibold text-sm hover:bg-[#1ebe5d] transition-colors"
            >
              <MessageCircle size={18} />
              Enviar WhatsApp al acudiente
            </button>
          )}
        </div>
      )}

      {/* Historial vacío */}
      {!ultimoRegistro && !loading && (
        <p className="text-sm text-gray-400 italic max-w-lg">
          Aún no hay registros en esta sesión.
        </p>
      )}

      {/* Modal del escáner QR */}
      <QRScannerModal
        isOpen={accionActiva !== null}
        onClose={handleCloseModal}
        onScan={handleScan}
        title={
          accionActiva === "entrada"
            ? "Escanear QR — Entrada"
            : "Escanear QR — Salida"
        }
      />
    </div>
  );
};

export default ControlAccesoSalida;
