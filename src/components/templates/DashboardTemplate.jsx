import React from "react";
import Sidebar from "../molecules/Sidebar";
import { Outlet } from "react-router-dom";

const DashboardTemplate = ({ data, options }) => {
  return (
    <div className="min-h-screen flex flex-row w-full">
      <Sidebar />

      {/* Main con margen para el sidebar */}
      <main className="flex-1 flex flex-col py-10 px-5 ml-auto md:ml-[33.333%] xl:ml-[16.666%] overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardTemplate;
