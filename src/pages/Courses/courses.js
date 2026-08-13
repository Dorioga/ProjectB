import { lazy } from "react";

// Registro de cursos.
// Para añadir un curso nuevo basta con agregar una entrada aquí
// (y crear su página que use <CourseViewer />).
const COURSES = {
  anatomy: lazy(() => import("./anatomy/AnatomyPage")),
  math: lazy(() => import("./math/MathPage")),
};

export default COURSES;