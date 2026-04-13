import { useContext } from "react";
import { SchoolContext } from "../context/SchoolContext.jsx";

// NOTE: in some edge cases (e.g. tests or mis-wrapped components) the
// provider may be missing, causing a crash. To make the application more
// resilient we log an error and return a minimal stub instead of throwing
// outright. This prevents a single missing provider from breaking the
// entire UI and matches the behaviour of some React built-in hooks.

const noop = () => {};

const EMPTY_CONTEXT = {
  // most callers only use a few functions; provide no-op defaults here
  getGradeSede: noop,
  getTeacherSubjects: noop,
  getTeacherGrades: noop,
  getStudentGrades: noop,
  createNote: noop,
  createTransitionNote: noop,
  saveTransitionStudentNote: noop,
  updateTransitionStudentNote: noop,
  updateNote: noop,
  createOrUpdateNote: noop,
  // generic loading/error flags
  loading: false,
  error: null,
};

export default function useSchool() {
  const ctx = useContext(SchoolContext);
  if (!ctx) {
    console.error(
      "useSchool debe utilizarse dentro de SchoolProvider. " +
        "Falling back to empty stub.",
    );
    return EMPTY_CONTEXT;
  }
  return ctx;
}
