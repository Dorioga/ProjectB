import React from "react";
import Sidebar from "../molecules/Sidebar";
import { Outlet } from "react-router-dom";
import useAuth from "../../lib/hooks/useAuth";
import { SideProfile } from "../molecules/SideProfile";
const DashboardTemplate = ({ data, options }) => {
  const { isOpen } = useAuth();
  return (
    <div className="min-h-screen flex flex-row w-full">
      <Sidebar />

      {/* Área principal con margen para la barra lateral */}
      <main
        className={`flex-1 flex flex-col overflow-y-auto ${
          isOpen ? "xl:pl-75" : "pl-17"
        }`}
      >
        <div className="h-16 bg-primary w-full flex items-center shadow  rounded-br-2xl ">
          <SideProfile />
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardTemplate;
