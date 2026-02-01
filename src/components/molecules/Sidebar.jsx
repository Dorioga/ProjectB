import React, { useState } from "react";
import useAuth from "../../lib/hooks/useAuth";
import { Link } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import * as LucideIcons from "lucide-react";
import PreviewIMG from "../atoms/PreviewIMG";
import PdfReportCard from "./PdfReportCard";
import reportCardResponse from "../../services/DataExamples/reportCardResponse";
const Sidebar = () => {
  const {
    userName,
    nameSchool,
    idInstitution,
    imgSchool,
    menu,
    nameRole,
    nameSede,
    logout,
    isOpen,
    toggleSidebar,
  } = useAuth();

  const toggleIsOpen = () => {
    toggleSidebar();
  };

  const displayName = String(userName ?? "").trim();
  return (
    <div
      className={`fixed left-0 top-0  z-50 h-screen grid grid-rows-12 border  bg-primary transition-all duration-300 ease-in-out${
        isOpen
          ? " w-4/5 sm:w-3/6 md:w-2/5 lg:w-1/3 xl:w-3/12 2xl:w-2/12 bg-primary"
          : "w-15"
      }`}
    >
      <div className="p-2 row-span-3">
        <div
          className="flex justify-end p-2 cursor-pointer"
          onClick={toggleIsOpen}
        >
          {isOpen ? (
            <LucideIcons.PanelRightOpen className="text-surface" />
          ) : (
            <LucideIcons.PanelLeftOpen className="text-surface" />
          )}
        </div>
        {isOpen && (
          <div className="flex flex-col items-center justify-center text-center gap-2 p-4 transition-all duration-300 ease-in-out">
            <PreviewIMG
              path={
                imgSchool ||
                "https://i.pinimg.com/736x/2d/5f/10/2d5f106e7866848b4bf3b0673904a143.jpg"
              }
              size={"logo"}
            />
            <div className="text-surface font-bold text-lg">
              {nameSchool || "NEXUS"}
            </div>
            <div className="text-surface text-sm">{nameSede || "Software"}</div>
          </div>
        )}
      </div>
      <div className="row-span-7 flex flex-col justify-start xl:justify-center 2xl:justify-start overflow-y-auto ">
        <ul className="">
          {menu &&
            Array.isArray(menu) &&
            menu.map((item, id) => {
              const IconComponent = LucideIcons[item.icon] || LucideIcons.User;
              return (
                <Link
                  key={id}
                  to={item.link}
                  className="flex flex-row px-4 py-2 items-center gap-2 hover:bg-secondary rounded"
                >
                  <IconComponent className="text-surface text-2xl" />
                  {isOpen ? (
                    <li className=" px-2 hover:bg-secondary rounded text-xl text-surface">
                      {item.option}
                    </li>
                  ) : null}
                </Link>
              );
            })}

          {/* Botón de prueba: Generar Boletín */}
          <button
            type="button"
            className="w-full flex flex-row px-4 py-2 items-center gap-2 hover:bg-secondary rounded"
            onClick={async () => {
              try {
                await PdfReportCard(reportCardResponse);
              } catch (err) {
                console.error(err);
                alert("No fue posible generar el boletín.");
              }
            }}
          >
            <LucideIcons.FileText className="text-surface text-2xl" />
            {isOpen ? (
              <li className="px-2 hover:bg-secondary rounded text-xl text-surface">
                Boletín (PDF)
              </li>
            ) : null}
          </button>

          {/* Manage Teacher */}
          <Link
            to="/dashboard/manageTeacher"
            className="flex flex-row px-4 py-2 items-center gap-2 hover:bg-secondary rounded"
          >
            <LucideIcons.Users className="text-surface text-2xl" />
            {isOpen ? (
              <li className="px-2 hover:bg-secondary rounded text-xl text-surface">
                Gestionar Profesores
              </li>
            ) : null}
          </Link>

          {/* Manage Student */}
          <Link
            to="/dashboard/manageStudent"
            className="flex flex-row px-4 py-2 items-center gap-2 hover:bg-secondary rounded"
          >
            <LucideIcons.GraduationCap className="text-surface text-2xl" />
            {isOpen ? (
              <li className="px-2 hover:bg-secondary rounded text-xl text-surface">
                Gestionar Estudiantes
              </li>
            ) : null}
          </Link>

          {/* Manage School */}
          <Link
            to="/dashboard/manageSchool"
            className="flex flex-row px-4 py-2 items-center gap-2 hover:bg-secondary rounded"
          >
            <LucideIcons.Home className="text-surface text-2xl" />
            {isOpen ? (
              <li className="px-2 hover:bg-secondary rounded text-xl text-surface">
                Gestionar Instituciones
              </li>
            ) : null}
          </Link>
        </ul>
      </div>
      <div className="flex flex-col items-center row-span-3 justify-center ">
        <div className="flex flex-row items-center gap-2 ">
          <User className="text-surface text-2xl" />
          {isOpen ? (
            <div className="flex flex-col">
              {displayName ? (
                <h2 className="text-surface font-bold text-xl text-center">
                  {(() => {
                    const words = displayName.split(" ");
                    if (words.length >= 4) {
                      return (
                        <>
                          <div>{words.slice(0, 2).join(" ")}</div>
                          <div>{words.slice(2).join(" ")}</div>
                        </>
                      );
                    }
                    return displayName;
                  })()}
                </h2>
              ) : null}
              <div className="text-surface text-sm text-center">{nameRole}</div>
            </div>
          ) : null}
        </div>
        <button
          className="flex flex-row items-center gap-2 px-4 py-2 rounded-md  hover:bg-error hover:text-surface text-error transition-colors duration-200 font-semibold cursor-pointer"
          onClick={logout}
        >
          <LogOut className="text-xl" />
          {isOpen ? <h2 className="text-lg">Cerrar sesión</h2> : null}
        </button>
        <div className="flex flex-row items-center gap-2 ">
          {isOpen ? (
            <h2 className="text-surface font-bold text-xl">NEXUS</h2>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
