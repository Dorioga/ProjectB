import React from "react";
import Sidebar from "../molecules/Sidebar";
import { Outlet } from "react-router-dom";
import useAuth from "../../lib/hooks/useAuth";
const DashboardTemplate = ({ data, options }) => {
  const { isOpen } = useAuth();
  return (
    <div className="min-h-screen flex flex-row w-full">
      <Sidebar />

      {/* Área principal con margen para la barra lateral */}
      <main
        className={`flex-1 flex flex-col overflow-y-auto ${
          isOpen ? "xl:pl-80" : "pl-20"
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardTemplate;
