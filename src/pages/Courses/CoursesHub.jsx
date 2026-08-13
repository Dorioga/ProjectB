import { Link } from "react-router-dom";

import subjects from "./anatomy/data/subjects";

export default function CoursesHub() {
  return (
    <div className="min-h-full w-full overflow-y-auto box-border px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
      <div className="w-full max-w-[1000px] mx-auto text-center">
        <p className="text-sm text-gray-500 mb-2">
          <Link
            to="/dashboard/home"
            className="text-[#1976d2] hover:underline font-medium"
          >
            ← Volver al inicio
          </Link>
        </p>

        <h1 className="font-bold text-gray-800 text-3xl sm:text-4xl md:text-5xl mb-1">
          Explora tus asignaturas
        </h1>

        <p className="text-gray-500 mb-6 sm:mb-8">
          Selecciona una asignatura para comenzar
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 justify-items-center">
          {subjects.map((subject) => {
            const available = Boolean(subject.link);

            const cardInner = (
              <div
                className={`w-full h-[190px] sm:h-[220px] rounded-2xl border bg-white flex flex-col items-center justify-center px-4 sm:px-6 py-4 box-border transition-transform duration-200 ${
                  available
                    ? "border-gray-200 hover:shadow-lg hover:-translate-y-1.5 cursor-pointer active:scale-[0.98]"
                    : "border-gray-200 opacity-70"
                }`}
              >
                <div className="w-[62px] sm:w-[72px] h-[62px] sm:h-[72px] rounded-[20px] bg-[#eff6ff] flex items-center justify-center text-[32px] sm:text-[38px] mb-2">
                  {subject.icon}
                </div>

                <h2 className="font-bold text-gray-800 text-lg mb-1">
                  {subject.name}
                </h2>

                <p className="text-sm text-gray-500">{subject.description}</p>

                {!available && (
                  <span className="mt-2 text-xs font-semibold text-gray-400">
                    Próximamente
                  </span>
                )}
              </div>
            );

            return (
              <div key={subject.id} className="w-full">
                {available ? (
                  <Link to={subject.link} className="block h-full">
                    {cardInner}
                  </Link>
                ) : (
                  cardInner
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-sm text-gray-400">
          Elige un curso para comenzar tu experiencia.
        </p>
      </div>
    </div>
  );
}