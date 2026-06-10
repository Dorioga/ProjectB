import React, { createContext, useCallback, useMemo, useState } from "react";
import * as auditService from "../../services/auditService";

export const AuditContext = createContext(null);

export function AuditProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const setStudentDataAudit = useCallback(async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const result = await auditService.setStudentDataAudit(payload);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      loading,
      error,
      setStudentDataAudit,
    }),
    [loading, error, setStudentDataAudit],
  );

  return (
    <AuditContext.Provider value={value}>{children}</AuditContext.Provider>
  );
}
