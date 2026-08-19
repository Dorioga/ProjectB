import { useState } from "react";

import CourseViewer from "../shared/CourseViewer";
import MapScene from "./components/MapScene";
import HistoryGroup from "./components/HistoryGroup";
import { countriesData } from "./data/countries";

export default function SocialSciencesPage() {
  const [layer, setLayer] = useState("countries");
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);

  const handleCountrySelect = (country) => {
    setSelectedCountry(countriesData[country.iso] ?? null);
  };

  if (layer === "history") {
    return <HistoryGroup onBack={() => setLayer("countries")} />;
  }

  const countrySections = selectedCountry
    ? Object.values(selectedCountry).filter(
        (item) =>
          item &&
          typeof item === "object" &&
          item.icon &&
          item.title &&
          item.value,
      )
    : [];

  return (
    <CourseViewer
      title="Ciencias Sociales"
      scene={false}
      open={panelOpen}
      onOpenChange={setPanelOpen}
      desktopOpen={desktopOpen}
      onDesktopOpenChange={setDesktopOpen}
      panel={
        <>
          <label className="block">
            <span className="text-xs font-medium text-gray-500">
              Explorar mapa
            </span>

            <select
              value={layer}
              onChange={(event) => {
                setLayer(event.target.value);
                setSelectedCountry(null);
              }}
              className="mt-1 w-full rounded-[14px] border border-[#d0d7de] bg-white px-3 py-2 text-sm focus:border-[#1976d2] focus:ring-2 focus:ring-[#1976d2]/30 outline-none cursor-pointer"
            >
              <option value="countries">Países</option>
              <option value="history">Historia</option>
            </select>
          </label>

          <hr className="my-3 border-gray-200" />

          {!selectedCountry && (
            <>
              <h2 className="text-lg font-bold text-gray-800">Países</h2>

              <p className="mt-1 text-sm text-gray-600 leading-relaxed text-justify">
                Explora los países del mundo y conoce información sobre su
                ubicación, población, economía, cultura, geografía y
                naturaleza.
              </p>

              <div className="mt-4 rounded-xl bg-[#eff6ff] text-[#1e40af] text-sm p-4 leading-relaxed">
                Haz clic sobre un país en el mapa para conocer más información.
              </div>
            </>
          )}

          {selectedCountry && (
            <>
              <button
                onClick={() => setSelectedCountry(null)}
                className="mb-3 text-sm font-semibold text-[#1976d2] hover:underline cursor-pointer"
              >
                ← Volver a Países
              </button>

              <div className="flex items-center gap-3 mb-3">
                {selectedCountry.flag && (
                  <span className="text-3xl leading-none">
                    {selectedCountry.flag}
                  </span>
                )}

                <h2 className="text-xl font-bold text-gray-800">
                  {selectedCountry.name}
                </h2>
              </div>

              {selectedCountry.description && (
                <p className="mb-4 text-sm text-gray-600 leading-relaxed">
                  {selectedCountry.description}
                </p>
              )}

              <hr className="mb-4 border-gray-200" />

              <div>
                {countrySections.map((section) => (
                  <div
                    key={section.title}
                    className="flex gap-3 mb-4 pb-4 border-b border-gray-100"
                  >
                    <div className="w-[38px] h-[38px] min-w-[38px] rounded-[10px] bg-[#eff6ff] flex items-center justify-center text-[21px]">
                      {section.icon}
                    </div>

                    <div className="flex-1">
                      <div className="mb-1 text-sm font-bold text-gray-800">
                        {section.title}
                      </div>

                      <div className="text-sm text-gray-600 leading-relaxed">
                        {section.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      }
    >
      <MapScene onCountrySelect={handleCountrySelect} />
    </CourseViewer>
  );
}
