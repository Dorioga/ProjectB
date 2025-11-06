import { useContext } from "react";
import { StudentContext } from "../context/StudentContext";

export default function useStudent() {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error("useStudent debe usarse dentro de StudentProvider");
  return ctx;
}
