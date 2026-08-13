import React from "react";
import { Outlet } from "react-router-dom";
import { SideProfile } from "../molecules/SideProfile";

const CoursesTemplate = () => {
  return (
    <div className="h-screen flex flex-col w-full bg-bg">
      {/* Encabezado con el nombre de la institución (sin sidebar) */}
      <header className="bg-primary w-full flex items-center shadow rounded-br-2xl shrink-0">
        <SideProfile />
      </header>

      <main className="flex-1 relative overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default React.memo(CoursesTemplate);