import { useContext } from "react";
import { AuditContext } from "../context/AuditContext";

const useAudit = () => {
  const context = useContext(AuditContext);

  if (!context) {
    throw new Error("useAudit debe utilizarse dentro de AuditProvider.");
  }

  return context;
};

export default useAudit;
