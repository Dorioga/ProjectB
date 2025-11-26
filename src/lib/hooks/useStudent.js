import { useContext } from "react";
import { StudentContext } from "../context/StudentContext";

const useStudent = () => {
  const context = useContext(StudentContext);

  if (!context) {
    throw new Error("useStudent debe utilizarse dentro de StudentProvider.");
  }

  return context;
};

export default useStudent;
