import { useState } from "react";

import anatomyModels from "./data/anatomyModels";
import OrganInfoContent from "./components/OrganInfoContent";
import MarkerInfoContent from "./components/markers/MarkerInfoContent";
import CourseViewer from "../shared/CourseViewer";

export default function AnatomyPage() {
  const [selectedModel, setSelectedModel] = useState(anatomyModels[0]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);

  const Scene = selectedModel.scene;

  const handleModelChange = (event) => {
    const model = anatomyModels.find((m) => m.id === event.target.value);

    if (model) {
      setSelectedModel(model);
      setSelectedMarker(null);
    }
  };

  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
    setPanelOpen(true);
    setDesktopOpen(true);
  };

  return (
    <CourseViewer
      title="Ciencias Naturales"
      camera={[0, 2, 2.5]}
      controls={{ target: [0, 1, 0], minDistance: 1.5, maxDistance: 8 }}
      gizmo
      ground
      open={panelOpen}
      onOpenChange={setPanelOpen}
      desktopOpen={desktopOpen}
      onDesktopOpenChange={setDesktopOpen}
      panel={
        <>
          <label className="block">
            <span className="text-xs font-medium text-gray-500">Modelo</span>

            <select
              value={selectedModel.id}
              onChange={handleModelChange}
              className="mt-1 w-full rounded-[14px] border border-[#d0d7de] bg-white px-3 py-2 text-sm focus:border-[#1976d2] focus:ring-2 focus:ring-[#1976d2]/30 outline-none cursor-pointer"
            >
              {anatomyModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </label>

          <hr className="my-3 border-gray-200" />

          {selectedMarker ? (
            <MarkerInfoContent
              marker={selectedMarker}
              onClose={() => setSelectedMarker(null)}
            />
          ) : (
            <OrganInfoContent model={selectedModel.model} />
          )}
        </>
      }
    >
      <Scene
        key={selectedModel.id}
        model={selectedModel.model}
        onMarkerClick={handleMarkerClick}
        selectedMarker={selectedMarker}
      />
    </CourseViewer>
  );
}