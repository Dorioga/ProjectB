import { useState, useRef, useEffect } from "react";
import useAuth from "../../lib/hooks/useAuth";
import { LogOut, User, ChevronDown, ChevronUp } from "lucide-react";
import ChangePasswordModal from "./ChangePasswordModal";
import SignatureModal from "./SignatureModal";

// Simple side profile component placeholder
export const SideProfile = () => {
  const {
    userName,
    nameRole,
    logout,
    registerSignature,
    nameSchool,
    rol,
    director,
    gradoAcargo,
  } = useAuth();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside className="rounded flex flex-row items-center justify-between gap-2 w-full px-4">
      <h2 className="text-surface font-semibold">{nameSchool}</h2>

      <div className="flex flex-row justify-end items-center gap-4">
        {/* Botón toggle de perfil */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex flex-row items-center gap-2 cursor-pointer hover:rounded-lg px-3 py-1.5 hover:bg-secondary transition-colors  hover:opacity-90"
          >
            <User className="text-surface" size={18} />
            <div className="flex flex-col text-left">
              <span className="text-surface font-semibold text-sm leading-tight">
                {userName}
              </span>
              <span className="text-surface text-xs leading-tight opacity-80">
                {nameRole}
              </span>
            </div>
            {profileOpen ? (
              <ChevronUp className="text-surface" size={16} />
            ) : (
              <ChevronDown className="text-surface" size={16} />
            )}
          </button>

          {/* Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 top-full  z-50 min-w-54 rounded-b-xl shadow-lg bg-primary  p-3 flex flex-col gap-2">
              {/* Acciones */}
              {([5, 2, "5", "2"].includes(rol) ||
                (["7", 7].includes(rol) &&
                  director != null &&
                  gradoAcargo != null)) && (
                <button
                  className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg hover:bg-secondary transition-colors text-sm font-medium text-surface cursor-pointer"
                  onClick={() => {
                    setSignatureOpen(true);
                    setProfileOpen(false);
                  }}
                >
                  Registrar firma
                </button>
              )}
              <button
                type="button"
                className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg hover:bg-secondary transition-colors text-sm font-medium text-surface cursor-pointer"
                onClick={() => {
                  setChangePasswordOpen(true);
                  setProfileOpen(false);
                }}
              >
                Cambiar contraseña
              </button>
            </div>
          )}
        </div>

        {/* Cerrar sesión */}
        <button
          className="flex flex-row items-center gap-2 px-4 py-2 rounded-md hover:bg-error hover:text-surface text-error transition-colors duration-200 font-semibold cursor-pointer"
          onClick={logout}
        >
          <LogOut className="text-xl" />
        </button>
      </div>

      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
      <SignatureModal
        isOpen={signatureOpen}
        onClose={() => setSignatureOpen(false)}
      />
    </aside>
  );
};
