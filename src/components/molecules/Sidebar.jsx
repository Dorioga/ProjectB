import React, { useState, useEffect } from "react";
import useAuth from "../../lib/hooks/useAuth";
import { Link } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import * as LucideIcons from "lucide-react";
import PreviewIMG from "../atoms/PreviewIMG";
import PdfReportCard from "./PdfReportCard";
import reportCardResponse from "../../services/DataExamples/reportCardResponse";
import ChangePasswordModal from "./ChangePasswordModal";
import Modal from "../atoms/Modal";
import BoletinSelector from "./BoletinSelector";
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
    rol,
    idEstudiante,
  } = useAuth();

  const [boletinModalOpen, setBoletinModalOpen] = useState(false);

  // showContent se activa DESPUÉS de que termina la animación de apertura (300ms)
  // y se desactiva inmediatamente al cerrar para ocultar el contenido al instante
  const [showContent, setShowContent] = useState(isOpen);

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
  // Antes usábamos 1300px, lo que cerraba la barra incluso en pantallas
  // grandes. Ahora sólo forzamos el cierre en móviles reales para que el
  // usuario pueda reabrirla sin problemas. La apertura/ cierre depende
  // del botón en el propio sidebar.
  useEffect(() => {
    const BREAKPOINT = 768; // coincide con `md` de Tailwind
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

  // handler to export a sample report card PDF using example data
  const handleExportPdf = async () => {
    try {
      await PdfReportCard(reportCardResponse);
    } catch (err) {
      console.error("Error generating PDF report card:", err);
    }
  };

  return (
    <>
      <div
        className="fixed left-0 top-0 z-50 h-screen grid grid-rows-10  rounded-br-2xl bg-primary overflow-hidden"
        style={{
          width: isOpen ? "300px" : "70px",
          transition: "width 300ms ease-in-out",
        }}
      >
        <div className="row-span-3 md:row-span-4 2xl:row-span-3">
          <div
            className={`flex py-3 cursor-pointer transition-colors duration-200
            ${isOpen ? "justify-end px-6" : "justify-center px-0"}`}
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
              {/* <div className="text-surface font-bold text-sm px-2">
              {nameSchool || "NEXUS"}
            </div> */}
              <div className="text-surface text-sm px-2">
                {nameSede || "Software"}
              </div>
            </div>
          )}
        </div>
        <div className="row-span-6 md:row-span-5 2xl:row-span-6 flex flex-col justify-start overflow-y-auto pt-0 sm:pt-3">
          <ul className="">
            {menu &&
              Array.isArray(menu) &&
              menu.map((item, id) => {
                const IconComponent =
                  LucideIcons[item.icon] || LucideIcons.User;
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
            {/* <li
              onClick={handleExportPdf}
              className="rounded-lg  hover:bg-secondary cursor-pointer w-full px-2"
            >
              <div className="flex w-full flex-row px-4 py-1 items-center gap-2">
                <LucideIcons.FileText className="w-5 h-5 text-surface hover:text-primary text-2xl" />
                {showContent && (
                  <span className="px-2 text-md text-surface">Boleta PDF</span>
                )}
              </div>
            </li> */}
            {String(rol) === "6" && (
              <li
                onClick={() => setBoletinModalOpen(true)}
                className="rounded-lg hover:bg-secondary cursor-pointer w-full px-2"
              >
                <div className="flex w-full flex-row px-4 py-1 items-center gap-2">
                  <LucideIcons.BookOpen className=" text-surface hover:text-primary text-2xl" />
                  {showContent && (
                    <span className="px-2 text-md text-surface">Boletín</span>
                  )}
                </div>
              </li>
            )}
          </ul>
        </div>
        <div className="flex flex-col items-center row-span-1 justify-center  ">
          <div className="flex flex-row items-center">
            {showContent ? (
              <PreviewIMG
                path="https://nexusplataforma.com/storage/logosnexus/8.png"
                size="logo"
              />
            ) : null}
          </div>
        </div>
      </div>

      <Modal
        isOpen={boletinModalOpen}
        onClose={() => setBoletinModalOpen(false)}
        title="Boletín de Notas"
        size="7xl"
      >
        <BoletinSelector studentId={idEstudiante} />
      </Modal>
    </>
  );
};

export default Sidebar;
