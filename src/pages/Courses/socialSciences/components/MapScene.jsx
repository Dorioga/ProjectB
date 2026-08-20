import { useEffect, useRef, useState } from "react";

import { Map, NavigationControl, setWorkerUrl } from "maplibre-gl";

import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

import "maplibre-gl/dist/maplibre-gl.css";

import {
  getWikidataFromFeature,
  getWikidataInfo,
} from "../wikidataService";

setWorkerUrl(workerUrl);

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

const EMPTY_COUNTRY_FILTER = ["==", ["get", "iso_a2"], ""];
const EMPTY_WIKIDATA_FILTER = ["==", ["get", "wikidata"], ""];
const EMPTY_CITY_FILTER = [
  "all",
  ["==", ["get", "class"], "city"],
  ["==", ["get", "id"], ""],
];

function formatClaim(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    if (value.amount) return value.amount;
    if (value.text) return value.text;
    if (value.id) return value.id;

    if (value.latitude !== undefined && value.longitude !== undefined) {
      return `${value.latitude}, ${value.longitude}`;
    }

    return JSON.stringify(value);
  }

  return String(value);
}

function InfoRow({ label, value }) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return (
    <div className="mb-3">
      <strong className="block text-[13px] text-[#111827]">{label}</strong>
      <div className="mt-[3px] text-sm text-[#4b5563]">{value}</div>
    </div>
  );
}

export default function MapScene({
  activeLayer,
  onCountrySelect,
  onCitySelect,
}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  const onCountrySelectRef = useRef(onCountrySelect);
  const onCitySelectRef = useRef(onCitySelect);

  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [wikidataLoading, setWikidataLoading] = useState(false);

  useEffect(() => {
    onCountrySelectRef.current = onCountrySelect;
  }, [onCountrySelect]);

  useEffect(() => {
    onCitySelectRef.current = onCitySelect;
  }, [onCitySelect]);

  const loadWikidata = async (feature) => {
    try {
      setWikidataLoading(true);

      const qid = getWikidataFromFeature(feature);

      if (!qid) {
        return null;
      }

      const data = await getWikidataInfo(qid);

      return data;
    } catch (error) {
      console.error("Error Wikidata:", error);
      return null;
    } finally {
      setWikidataLoading(false);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) {
      return;
    }

    if (!MAPTILER_KEY) {
      console.error("VITE_MAPTILER_KEY no está configurada");
      return;
    }

    const map = new Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/topo-v4/style.json?key=${MAPTILER_KEY}`,
      center: [-74, 4],
      zoom: 4,
      minZoom: 1,
      maxZoom: 18,
    });

    mapRef.current = map;

    map.addControl(new NavigationControl(), "top-right");

    map.on("load", () => {
      map.addSource("countries", {
        type: "vector",
        url: `https://api.maptiler.com/tiles/countries/tiles.json?key=${MAPTILER_KEY}`,
      });

      map.addSource("v3lite", {
        type: "vector",
        url: `https://api.maptiler.com/tiles/v3-lite/tiles.json?key=${MAPTILER_KEY}`,
      });

      map.addLayer({
        id: "countries-fill",
        type: "fill",
        source: "countries",
        "source-layer": "administrative",
        filter: ["==", ["get", "level"], 0],
        paint: {
          "fill-color": "#dbeafe",
          "fill-opacity": 0.15,
        },
      });

      map.addLayer({
        id: "countries-selected",
        type: "fill",
        source: "countries",
        "source-layer": "administrative",
        filter: EMPTY_COUNTRY_FILTER,
        paint: {
          "fill-color": "#f59e0b",
          "fill-opacity": 0.55,
        },
      });

      map.addLayer({
        id: "countries-border",
        type: "line",
        source: "countries",
        "source-layer": "administrative",
        filter: ["==", ["get", "level"], 0],
        paint: {
          "line-color": "#111827",
          "line-width": 1,
          "line-opacity": 0.9,
        },
      });

      map.addLayer({
        id: "countries-selected-border",
        type: "line",
        source: "countries",
        "source-layer": "administrative",
        filter: EMPTY_COUNTRY_FILTER,
        paint: {
          "line-color": "#b45309",
          "line-width": 3,
          "line-opacity": 1,
        },
      });

      map.addLayer({
        id: "departments-fill",
        type: "fill",
        source: "countries",
        "source-layer": "administrative",
        filter: ["==", ["get", "level"], 1],
        paint: {
          "fill-color": "#60a5fa",
          "fill-opacity": 0.08,
        },
      });

      map.addLayer({
        id: "departments-selected",
        type: "fill",
        source: "countries",
        "source-layer": "administrative",
        filter: EMPTY_WIKIDATA_FILTER,
        paint: {
          "fill-color": "#ef4444",
          "fill-opacity": 0.55,
        },
      });

      map.addLayer({
        id: "departments-border",
        type: "line",
        source: "countries",
        "source-layer": "administrative",
        filter: ["==", ["get", "level"], 1],
        paint: {
          "line-color": "#2563eb",
          "line-width": 1,
          "line-opacity": 0.35,
        },
      });

      map.addLayer({
        id: "departments-selected-border",
        type: "line",
        source: "countries",
        "source-layer": "administrative",
        filter: EMPTY_WIKIDATA_FILTER,
        paint: {
          "line-color": "#b91c1c",
          "line-width": 3,
          "line-opacity": 1,
        },
      });

      map.addLayer({
        id: "cities-boundaries",
        type: "fill",
        source: "countries",
        "source-layer": "administrative",
        filter: ["==", ["get", "level"], 3],
        minzoom: 4,
        paint: {
          "fill-color": "#60a5fa",
          "fill-opacity": 0.08,
        },
      });

      map.addLayer({
        id: "cities-boundaries-border",
        type: "line",
        source: "countries",
        "source-layer": "administrative",
        filter: ["==", ["get", "level"], 3],
        minzoom: 4,
        paint: {
          "line-color": "#2563eb",
          "line-width": 1,
          "line-opacity": 0.25,
        },
      });

      map.addLayer({
        id: "cities-selected-boundary",
        type: "fill",
        source: "countries",
        "source-layer": "administrative",
        filter: EMPTY_WIKIDATA_FILTER,
        minzoom: 3,
        paint: {
          "fill-color": "#8b5cf6",
          "fill-opacity": 0.45,
        },
      });

      map.addLayer({
        id: "cities-selected-boundary-border",
        type: "line",
        source: "countries",
        "source-layer": "administrative",
        filter: EMPTY_WIKIDATA_FILTER,
        minzoom: 3,
        paint: {
          "line-color": "#6d28d9",
          "line-width": 3,
          "line-opacity": 1,
        },
      });

      map.addLayer({
        id: "cities-points",
        type: "circle",
        source: "v3lite",
        "source-layer": "place",
        filter: [
          "all",
          ["==", ["get", "class"], "city"],
          ["<=", ["get", "rank"], 7],
        ],
        minzoom: 3,
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            3,
            3,
            5,
            4,
            8,
            5,
            12,
            7,
          ],
          "circle-color": "#111827",
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
          "circle-opacity": 0.95,
        },
      });

      map.addLayer({
        id: "cities-selected",
        type: "circle",
        source: "v3lite",
        "source-layer": "place",
        filter: EMPTY_CITY_FILTER,
        minzoom: 3,
        paint: {
          "circle-radius": 10,
          "circle-color": "#dc2626",
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 3,
          "circle-opacity": 1,
        },
      });

      map.addLayer({
        id: "cities-labels",
        type: "symbol",
        source: "v3lite",
        "source-layer": "place",
        filter: [
          "all",
          ["==", ["get", "class"], "city"],
          ["<=", ["get", "rank"], 7],
        ],
        minzoom: 3,
        layout: {
          "text-field": ["coalesce", ["get", "name"], ["get", "name_en"]],
          "text-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            3,
            10,
            5,
            11,
            8,
            13,
            12,
            15,
          ],
          "text-anchor": "top",
          "text-offset": [0, 0.8],
          "text-allow-overlap": false,
          "text-ignore-placement": false,
        },
        paint: {
          "text-color": "#111827",
          "text-halo-color": "#ffffff",
          "text-halo-width": 2,
        },
      });

      map.resize();
    });

    map.on("click", "countries-fill", async (event) => {
      const features = map.queryRenderedFeatures(event.point, {
        layers: ["countries-fill"],
      });

      if (!features.length) {
        return;
      }

      const country = features[0];
      const properties = country.properties || {};

      const iso = properties.iso_a2 || "";
      const name = properties.name || properties.name_en || "País";

      const countryData = {
        iso,
        name,
        properties,
        wikidata: null,
      };

      setSelectedDepartment(null);
      setSelectedCity(null);

      map.setFilter("departments-selected", EMPTY_WIKIDATA_FILTER);
      map.setFilter("departments-selected-border", EMPTY_WIKIDATA_FILTER);
      map.setFilter("cities-selected", EMPTY_CITY_FILTER);
      map.setFilter("cities-selected-boundary", EMPTY_WIKIDATA_FILTER);
      map.setFilter("cities-selected-boundary-border", EMPTY_WIKIDATA_FILTER);

      map.setFilter("countries-selected", ["==", ["get", "iso_a2"], iso]);
      map.setFilter("countries-selected-border", ["==", ["get", "iso_a2"], iso]);

      setSelectedCountry(countryData);

      const wikidata = await loadWikidata(country);

      setSelectedCountry((previous) => ({
        ...previous,
        wikidata,
      }));

      onCountrySelectRef.current?.({
        ...countryData,
        wikidata,
      });
    });

    map.on("click", "departments-fill", async (event) => {
      const features = map.queryRenderedFeatures(event.point, {
        layers: ["departments-fill"],
      });

      if (!features.length) {
        return;
      }

      const department = features[0];
      const properties = department.properties || {};

      const wikidata = properties.wikidata || "";
      const name = properties.name || properties.name_en || "Departamento";

      map.setFilter("departments-selected", ["==", ["get", "wikidata"], wikidata]);
      map.setFilter("departments-selected-border", [
        "==",
        ["get", "wikidata"],
        wikidata,
      ]);

      setSelectedCity(null);
      map.setFilter("cities-selected", EMPTY_CITY_FILTER);
      map.setFilter("cities-selected-boundary", EMPTY_WIKIDATA_FILTER);
      map.setFilter("cities-selected-boundary-border", EMPTY_WIKIDATA_FILTER);

      const departmentData = {
        name,
        nameEn: properties.name_en || "",
        wikidata,
        iso: properties.iso_a2 || "",
        properties,
        wikidataData: null,
      };

      setSelectedDepartment(departmentData);

      const wikidataData = await loadWikidata(department);

      setSelectedDepartment((previous) => ({
        ...previous,
        wikidataData,
      }));
    });

    map.on("click", "cities-points", async (event) => {
      const features = map.queryRenderedFeatures(event.point, {
        layers: ["cities-points"],
      });

      if (!features.length) {
        return;
      }

      const city = features[0];
      const properties = city.properties || {};

      const id = properties.id || "";
      const name = properties.name || properties.name_en || "Ciudad";

      const cityData = {
        id,
        name,
        nameEn: properties.name_en || "",
        rank: properties.rank,
        capital: properties.capital,
        iso: properties.iso_a2 || "",
        properties,
        wikidata: null,
      };

      map.setFilter("cities-selected", [
        "all",
        ["==", ["get", "class"], "city"],
        ["==", ["get", "id"], id],
      ]);
      map.setFilter("cities-selected-boundary", ["==", ["get", "wikidata"], id]);
      map.setFilter("cities-selected-boundary-border", [
        "==",
        ["get", "wikidata"],
        id,
      ]);

      setSelectedDepartment(null);
      map.setFilter("departments-selected", EMPTY_WIKIDATA_FILTER);
      map.setFilter("departments-selected-border", EMPTY_WIKIDATA_FILTER);

      setSelectedCity(cityData);

      const wikidata = await loadWikidata(city);

      setSelectedCity((previous) => ({
        ...previous,
        wikidata,
      }));

      onCitySelectRef.current?.({
        ...cityData,
        wikidata,
      });
    });

    const pointerLayers = ["countries-fill", "departments-fill", "cities-points"];

    pointerLayers.forEach((layerId) => {
      map.on("mouseenter", layerId, () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", layerId, () => {
        map.getCanvas().style.cursor = "";
      });
    });

    map.on("error", (event) => {
      console.error("Error del mapa:", event.error || event);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    setSelectedDepartment(null);
    setSelectedCity(null);

    const map = mapRef.current;

    if (!map) {
      return;
    }

    const countriesVisible = activeLayer === "countries";
    const citiesVisible = activeLayer === "cities";

    [
      "countries-fill",
      "countries-border",
      "countries-selected",
      "countries-selected-border",
    ].forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(
          layerId,
          "visibility",
          countriesVisible ? "visible" : "none",
        );
      }
    });

    [
      "departments-fill",
      "departments-border",
      "departments-selected",
      "departments-selected-border",
    ].forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(
          layerId,
          "visibility",
          citiesVisible ? "visible" : "none",
        );
      }
    });

    [
      "cities-boundaries",
      "cities-boundaries-border",
      "cities-selected-boundary",
      "cities-selected-boundary-border",
      "cities-points",
      "cities-selected",
      "cities-labels",
    ].forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(
          layerId,
          "visibility",
          citiesVisible ? "visible" : "none",
        );
      }
    });
  }, [activeLayer]);

  return (
    <>
      <div ref={mapContainer} className="absolute inset-0 h-full w-full" />

      {selectedDepartment && (
        <div className="hidden md:flex flex-col absolute z-[1000] top-3 right-3 w-[320px] max-h-[calc(100%-24px)] rounded-2xl bg-white/95 shadow-2xl overflow-hidden">
          <div className="overflow-y-auto flex-1 min-h-0 p-5">
            <h2 className="m-0 text-xl font-bold text-[#111827]">
              🏛️ {selectedDepartment.name}
            </h2>

            <InfoRow label="Nombre" value={selectedDepartment.name} />
            <InfoRow
              label="Nombre internacional"
              value={selectedDepartment.nameEn}
            />
            <InfoRow label="Wikidata" value={selectedDepartment.wikidata} />
            <InfoRow label="País" value={selectedCountry?.name} />

            {selectedDepartment.wikidataData && (
              <>
                <InfoRow
                  label="Descripción"
                  value={selectedDepartment.wikidataData.description}
                />
                <InfoRow
                  label="Población"
                  value={formatClaim(selectedDepartment.wikidataData.population)}
                />
                <InfoRow
                  label="Área"
                  value={formatClaim(selectedDepartment.wikidataData.area)}
                />
                <InfoRow
                  label="Ubicado en"
                  value={selectedDepartment.wikidataData.locatedInQid}
                />
              </>
            )}

            {wikidataLoading && (
              <div className="mt-4 text-sm text-[#2563eb]">
                Consultando Wikidata...
              </div>
            )}
          </div>
        </div>
      )}

      {selectedCity && (
        <div className="hidden md:flex flex-col absolute z-[1000] bottom-3 left-1/2 -translate-x-1/2 w-[380px] max-h-[calc(100%-24px)] rounded-2xl bg-white/95 shadow-2xl overflow-hidden">
          <div className="overflow-y-auto flex-1 min-h-0 p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="m-0 text-[23px] font-bold text-[#111827]">
                🏙️ {selectedCity.name}
              </h2>
            </div>

            {selectedCity.wikidata?.description && (
              <div className="bg-[#f9fafb] rounded-[10px] p-3 mb-4 text-[#4b5563] text-sm leading-[1.5]">
                {selectedCity.wikidata.description}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <InfoRow
                label="🌍 País"
                value={selectedCountry?.name || selectedCity.wikidata?.label}
              />
              <InfoRow label="🔗 Wikidata" value={selectedCity.wikidata?.qid} />
              <InfoRow
                label="🏷️ Tipo"
                value={selectedCity.wikidata?.instanceOf}
              />
              <InfoRow
                label="👥 Población"
                value={formatClaim(selectedCity.wikidata?.population)}
              />
              <InfoRow
                label="⛰️ Elevación"
                value={formatClaim(selectedCity.wikidata?.elevation)}
              />
              <InfoRow
                label="📍 Coordenadas"
                value={selectedCity.wikidata?.coordinates}
              />
              <InfoRow
                label="📅 Fundación"
                value={formatClaim(selectedCity.wikidata?.inception)}
              />
              <InfoRow
                label="🌐 Sitio web"
                value={selectedCity.wikidata?.website}
              />
            </div>

            {wikidataLoading && (
              <div className="mt-4 text-sm text-[#2563eb]">
                Consultando Wikidata...
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
