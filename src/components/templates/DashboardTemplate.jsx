import React from "react";
import Sidebar from "../molecules/Sidebar";
import { Outlet } from "react-router-dom";
import useAuth from "../../lib/hooks/useAuth";
const DashboardTemplate = ({ data, options }) => {
  const { isOpen } = useAuth();
  return (
    <div className="min-h-screen flex flex-row w-full">
      <Sidebar />

      {/* Main con margen para el sidebar */}
      <main
        className={`flex-1 flex flex-col py-10 px-5  overflow-y-auto ${
          isOpen ? "xl:pl-85 " : "pl-20"
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardTemplate;
