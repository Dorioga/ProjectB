import React, { useState, useEffect } from "react";
import useAuth from "../../lib/hooks/useAuth";
import { Link } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import * as LucideIcons from "lucide-react";
import PreviewIMG from "../atoms/PreviewIMG";
import PdfReportCard from "./PdfReportCard";
import reportCardResponse from "../../services/DataExamples/reportCardResponse";
import ChangePasswordModal from "./ChangePasswordModal";
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
    closeSidebar,
  } = useAuth();

  // showContent se activa DESPUÉS de que termina la animación de apertura (300ms)
  // y se desactiva inmediatamente al cerrar para ocultar el contenido al instante
  const [showContent, setShowContent] = useState(isOpen);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  useEffect(() => {
    let timer;
    if (isOpen) {
      timer = setTimeout(() => setShowContent(true), 300);
    } else {
      setShowContent(false);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Colapsar automáticamente en pantallas pequeñas (< 768px = md)
  useEffect(() => {
    const BREAKPOINT = 1300;
    const handleResize = () => {
      if (window.innerWidth < BREAKPOINT) {
        closeSidebar();
      }
    };
    // Verificar al montar
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [closeSidebar]);

  const displayName = String(userName ?? "").trim();
  return (
    <div
      className="fixed left-0 top-0 z-50 h-screen grid grid-rows-10 border rounded-r-2xl bg-primary overflow-hidden"
      style={{
        width: isOpen ? "300px" : "70px",
        transition: "width 300ms ease-in-out",
      }}
    >
      <div className="row-span-3">
        <div
          className="flex justify-end py-3 px-6 cursor-pointer"
          onClick={toggleSidebar}
        >
          {isOpen ? (
            <LucideIcons.PanelRightOpen className="text-surface" />
          ) : (
            <LucideIcons.PanelLeftOpen className="text-surface" />
          )}
        </div>
        {showContent && (
          <div className="flex flex-col items-center justify-center text-center gap-2 px-2 transition-all duration-300 ease-in-out">
            <PreviewIMG
              path={imgSchool || "/LogoGuadalupe.png"}
              size={"logo"}
            />
            <div className="text-surface font-bold text-sm px-2">
              {nameSchool || "NEXUS"}
            </div>
            <div className="text-surface text-sm px-2">
              {nameSede || "Software"}
            </div>
          </div>
        )}
      </div>
      <div className="row-span-5 flex flex-col justify-start overflow-y-auto ">
        <ul className="">
          {menu &&
            Array.isArray(menu) &&
            menu.map((item, id) => {
              const IconComponent = LucideIcons[item.icon] || LucideIcons.User;
              return (
                <li
                  key={id}
                  className="rounded-lg  hover:bg-secondary cursor-pointer w-full px-2"
                >
                  <Link
                    to={item.link}
                    className="flex w-full flex-row px-4 py-1 items-center gap-2"
                  >
                    <IconComponent className="text-surface hover:text-primary text-2xl" />
                    {showContent && (
                      <span className="px-2 text-md text-surface">
                        {item.option}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
        </ul>
      </div>
      <div className="flex flex-col items-center row-span-2 justify-center  ">
        <button
          type="button"
          title="Cambiar contraseña"
          onClick={() => setChangePasswordOpen(true)}
          className="flex flex-col items-center cursor-pointer rounded-lg px-2 py-1 hover:bg-secondary/40 transition-colors gap-2"
        >
          <div className="flex flex-row gap-2">
            <User className="text-surface text-2xl" />
            <p className="text-surface">Ver perfil</p>
          </div>
          {showContent ? (
            <div className="text-surface text-sm text-center">{nameRole}</div>
          ) : null}
        </button>
        <button
          className="flex flex-row items-center gap-2 px-4 py-2 rounded-md  hover:bg-error hover:text-surface text-error transition-colors duration-200 font-semibold cursor-pointer"
          onClick={logout}
        >
          <LogOut className="text-xl" />
          {showContent ? <h2 className="text-lg">Cerrar sesión</h2> : null}
        </button>
        <div className="flex flex-row items-center">
          {showContent ? (
            <h2 className="text-surface font-bold text-xl">NEXUS</h2>
          ) : null}
        </div>
      </div>
      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </div>
  );
};

export default Sidebar;
