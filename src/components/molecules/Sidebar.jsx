import React, { useState } from "react";
import useAuth from "../../lib/hooks/useAuth";
import { Link } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import * as LucideIcons from "lucide-react";
import PreviewIMG from "../atoms/PreviewIMG";
const Sidebar = () => {
  const { nameSchool, id_School, imgSchool, menu, nameRole, logout } =
    useAuth();
  const [isOpen, setIsOpen] = useState(true);
  console.log("Sidebar - imgSchool:", imgSchool);
  console.log("Sidebar - menu:", menu);
  console.log("Sidebar - Tipo de imgSchool:", typeof imgSchool);
  const toggleIsOpen = () => {
    setIsOpen(!isOpen);
  };
  return (
    <div
      className={`  fixed left-0 top-0  z-50 h-screen grid grid-rows-12 border  bg-primary transition-all duration-300 ease-in-out${
        isOpen ? "md:w-1/3 xl:w-2/12 bg-primary" : " w-15"
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
          <div className="flex flex-col items-center justify-center text-center gap-4 p-4 transition-all duration-300 ease-in-out">
            {imgSchool && <PreviewIMG path={imgSchool} size={"logo"} />}
            <div className="text-white font-bold text-lg ml-2">
              {nameSchool}
            </div>
          </div>
        )}
      </div>
      <div className="row-span-7">
        <ul className="">
          {menu &&
            menu.map((item) => {
              const IconComponent = LucideIcons[item.icon] || LucideIcons.User;
              return (
                <Link
                  key={item.id}
                  to={item.link}
                  className="flex flex-row px-4 py-2 items-center gap-2 hover:bg-secondary rounded"
                >
                  <IconComponent className="text-white text-2xl" />
                  {isOpen ? (
                    <li className=" px-2 hover:bg-secondary rounded text-xl text-white">
                      {item.option}
                    </li>
                  ) : null}
                </Link>
              );
            })}
        </ul>
      </div>
      <div className="flex flex-col items-center  py-10 gap-2">
        <div className="flex flex-row items-center gap-2  p-2 rounded">
          <User className="text-white text-2xl" />
          {isOpen ? (
            <h2 className="text-white font-bold text-xl">{nameRole}</h2>
          ) : null}
        </div>
        <button
          className="flex flex-row items-center gap-2 px-4 py-2 rounded-md  hover:bg-error hover:text-white text-error transition-colors duration-200 font-semibold cursor-pointer"
          onClick={logout}
        >
          <LogOut className="text-xl" />
          {isOpen ? <h2 className="text-lg">Cerrar Sesión</h2> : null}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
