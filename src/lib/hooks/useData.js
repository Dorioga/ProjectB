import { useContext } from "react";
import { DataContext } from "../context/DataContext";

export default function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData debe utilizarse dentro de DataProvider.");
  return ctx;
}
