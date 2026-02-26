import { useState } from "react";
import useAuth from "../../lib/hooks/useAuth";
import { LogOut, User } from "lucide-react";
import ChangePasswordModal from "./ChangePasswordModal";
import SignatureModal from "./SignatureModal";

// Simple side profile component placeholder
export const SideProfile = () => {
  const { userName, nameRole, logout, registerSignature, nameSchool } =
    useAuth();
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [signatureOpen, setSignatureOpen] = useState(false);

  return (
    <aside className="rounded flex flex-row items-center justify-between gap-2 w-full px-4 ">
      <h2 className="text-surface font-semibold ">{nameSchool}</h2>
      <div className="flex flex-row justify-end items-center gap-6">
        {" "}
        <button
          className="flex flex-col items-center cursor-pointer rounded-lg px-2 py-1 bg-secondary transition-colors gap-2"
          onClick={() => setSignatureOpen(true)}
        >
          <p className="text-surface font-semibold ">Registrar firma</p>
        </button>
        <button
          type="button"
          title="Cambiar contraseña"
          onClick={() => setChangePasswordOpen(true)}
          className="flex flex-col items-center cursor-pointer rounded-lg px-2 py-1 bg-secondary transition-colors gap-2"
        >
          <div className="flex flex-row gap-2 ">
            <p className="text-surface font-semibold ">Cambiar Contraseña</p>
          </div>
        </button>
        <div className="flex flex-row h-full items-center gap-2">
          <User className="text-surface " />
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold  text-surface">{userName}</h2>
            <p className="text-sm text-end text-surface">{nameRole}</p>
          </div>
        </div>
        <button
          className="flex flex-row items-center gap-2 px-4 py-2 rounded-md  hover:bg-error hover:text-surface text-error transition-colors duration-200 font-semibold cursor-pointer"
          onClick={logout}
        >
          <LogOut className="text-xl" />
          {/* <h2 className="text-lg">Cerrar sesión</h2> */}
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
