import { useState } from "react";

import CourseViewer from "../shared/CourseViewer";
import chemistryTopics from "./data/chemistryTopics";
import PeriodicTable from "./components/PeriodicTable";
import ElementInfoContent from "./components/ElementInfoContent";
import ElectronDistribution from "./components/ElectronDistribution";

export default function ChemistryPage() {
  const [topic, setTopic] = useState(chemistryTopics[0].id);
  const [selectedElement, setSelectedElement] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);

  const handleElementClick = (element) => {
    setSelectedElement(element);
  };

  return (
    <CourseViewer
      title="Química"
      scene={false}
      open={panelOpen}
      onOpenChange={setPanelOpen}
      desktopOpen={desktopOpen}
      onDesktopOpenChange={setDesktopOpen}
      panel={
        <>
          <label className="block">
            <span className="text-xs font-medium text-gray-500">Tema</span>

            <select
              value={topic}
              onChange={(event) => {
                setTopic(event.target.value);
                setSelectedElement(null);
              }}
              className="mt-1 w-full rounded-[14px] border border-[#d0d7de] bg-white px-3 py-2 text-sm focus:border-[#1976d2] focus:ring-2 focus:ring-[#1976d2]/30 outline-none cursor-pointer"
            >
              {chemistryTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          <hr className="my-3 border-gray-200" />

          <div className="w-full max-w-full rounded-3xl bg-white shadow-xl">
            <div className="p-3">
              <h3 className="font-bold text-lg">Explora los elementos</h3>
              <p className="mt-1 text-sm text-gray-600 leading-relaxed text-justify">
                Haz clic sobre un elemento de la tabla periódica para ver su
                nombre, símbolo, número atómico, masa atómica y una breve
                descripción.
              </p>
            </div>
          </div>
        </>
      }
      overlays={
        selectedElement && (
          <>
            {/* Datos del elemento — escritorio (derecha) */}
            <div className="hidden md:flex flex-col absolute z-[1000] top-3 right-3 w-[380px] max-h-[calc(100%-24px)] rounded-2xl bg-white shadow-2xl overflow-hidden">
              <div className="overflow-y-auto flex-1 min-h-0">
                <ElementInfoContent
                  element={selectedElement}
                  onClose={() => setSelectedElement(null)}
                />
              </div>
            </div>

            {/* Datos del elemento — móvil (overlay centrado) */}
            <div
              className="md:hidden absolute inset-0 z-[1500] bg-black/40 flex items-center justify-center p-4"
              onClick={() => setSelectedElement(null)}
            >
              <div
                className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="overflow-y-auto flex-1 min-h-0">
                  <ElementInfoContent
                    element={selectedElement}
                    onClose={() => setSelectedElement(null)}
                  />
                </div>
              </div>
            </div>
          </>
        )
      }
    >
      {topic === "periodic-table" && (
        <PeriodicTable onElementClick={handleElementClick} />
      )}
      {topic === "electron-distribution" && <ElectronDistribution />}
    </CourseViewer>
  );
}
