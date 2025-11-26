import { useContext } from "react";
import { SchoolContext } from "../context/SchoolContext";

export default function useSchool() {
  const ctx = useContext(SchoolContext);
  if (!ctx)
    throw new Error("useSchool debe utilizarse dentro de SchoolProvider.");
  return ctx;
}
