import { useEffect, useRef } from "react";

import { Map, NavigationControl, setWorkerUrl } from "maplibre-gl";

import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

import "maplibre-gl/dist/maplibre-gl.css";

setWorkerUrl(workerUrl);

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

const EMPTY_COUNTRY_FILTER = ["==", ["get", "iso_a2"], ""];

export default function MapScene({ onCountrySelect }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const onCountrySelectRef = useRef(onCountrySelect);

  useEffect(() => {
    onCountrySelectRef.current = onCountrySelect;
  }, [onCountrySelect]);

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
    });

    map.on("click", "countries-fill", (event) => {
      const features = map.queryRenderedFeatures(event.point, {
        layers: ["countries-fill"],
      });

      if (!features.length) {
        return;
      }

      const country = features[0];
      const properties = country.properties || {};

      const countryData = {
        iso: properties.iso_a2 || "",
        name:
          properties.name || properties.name_en || "País",
        properties,
      };

      map.setFilter("countries-selected", [
        "==",
        ["get", "iso_a2"],
        countryData.iso,
      ]);

      map.setFilter("countries-selected-border", [
        "==",
        ["get", "iso_a2"],
        countryData.iso,
      ]);

      onCountrySelectRef.current?.(countryData);
    });

    map.on("mouseenter", "countries-fill", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "countries-fill", () => {
      map.getCanvas().style.cursor = "";
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={mapContainer} className="absolute inset-0 h-full w-full" />;
}
