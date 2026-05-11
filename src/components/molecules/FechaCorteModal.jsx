import React, { useState } from "react";
import Modal from "../atoms/Modal";
import SimpleButton from "../atoms/SimpleButton";
import PeriodSelector from "../atoms/PeriodSelector";
import useAuth from "../../lib/hooks/useAuth";
import { useNotification } from "../../lib/context/NotificationContext";
import { addDateCutPeriod } from "../../services/schoolService";

const FechaCorteModal = ({ isOpen, onClose }) => {
  const { idInstitution } = useAuth();
  const { addNotification } = useNotification();

  const [fechaCorte, setFechaCorte] = useState("");
  const [periodoSelected, setPeriodoSelected] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = fechaCorte && periodoSelected && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    try {
      await addDateCutPeriod({
        fecha_corte: fechaCorte,
        fk_periodo: Number(periodoSelected),
        fk_institucion: Number(idInstitution),
      });
      addNotification("Fecha de corte registrada exitosamente.", "success");
      // Resetear formulario y cerrar
      setFechaCorte("");
      setPeriodoSelected("");
      onClose();
    } catch (err) {
      addNotification(
        err?.message ?? "Error al registrar corte de periodo",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Fecha Corte" size="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold" htmlFor="periodo-corte">
            Período
          </label>
          <PeriodSelector
            name="periodo-corte"
            label=""
            value={periodoSelected}
            onChange={(e) => setPeriodoSelected(e.target.value)}
            placeholder="Selecciona un período"
            className="w-full p-2 border rounded bg-surface"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold" htmlFor="fecha-corte">
            Fecha de corte
          </label>
          <input
            id="fecha-corte"
            type="date"
            className="w-full p-2 border rounded bg-surface"
            value={fechaCorte}
            onChange={(e) => setFechaCorte(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end">
          <SimpleButton
            msj={loading ? "Guardando..." : "Guardar"}
            bg="bg-secondary"
            text="text-surface"
            icon="Save"
            disabled={!canSubmit}
          />
        </div>
      </form>
    </Modal>
  );
};

export default FechaCorteModal;
