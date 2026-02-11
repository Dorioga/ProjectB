import { useContext } from "react";
import { TeacherContext } from "../context/TeacherContext.jsx";

export default function useTeacher() {
  const ctx = useContext(TeacherContext);
  if (!ctx)
    throw new Error("useTeacher debe utilizarse dentro de TeacherProvider.");
  return ctx;
}
