import { useContext } from "react";
import { StudentContext } from "../context/StudentContext";

export const useStudent = () => {
  const context = useContext(StudentContext);

  // ✅ ESTO está bien porque useContext ya se ejecutó
  if (!context) {
    throw new Error("useStudent debe ser usado dentro de StudentProvider");
  }

  return context;
};
