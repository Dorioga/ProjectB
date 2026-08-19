import { useEffect, useRef } from "react";

import {
  Map,
  NavigationControl,
  Marker,
  Popup,
  setWorkerUrl,
} from "maplibre-gl";

import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

import "maplibre-gl/dist/maplibre-gl.css";

setWorkerUrl(workerUrl);

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;

export default function HistoryScene({
  historyData = [],
  onHistorySelect,
  selectedHistory = null,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    if (!MAPTILER_KEY) {
      console.error("VITE_MAPTILER_KEY no está configurada");
      return;
    }

    const map = new Map({
      container: mapContainerRef.current,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`,
      center: [-74.2973, 4.5709],
      zoom: 4,
      minZoom: 1,
      maxZoom: 18,
      attributionControl: true,
    });

    mapRef.current = map;

    map.addControl(
      new NavigationControl({ visualizePitch: true }),
      "top-right",
    );

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (!Array.isArray(historyData) || historyData.length === 0) {
      return;
    }

    historyData.forEach((item) => {
      const latitude = Number(item.latitude);
      const longitude = Number(item.longitude);

      if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        return;
      }

      const markerElement = document.createElement("div");

      Object.assign(markerElement.style, {
        width: "44px",
        height: "44px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        userSelect: "none",
        transformOrigin: "center bottom",
        pointerEvents: "auto",
      });

      const markerVisual = document.createElement("div");

      Object.assign(markerVisual.style, {
        width: "38px",
        height: "38px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        background: "#bbbbbbe1",
        border: "3px solid white",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.30)",
        fontSize: "21px",
        lineHeight: "1",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        transform: "scale(1)",
        transformOrigin: "center center",
        pointerEvents: "auto",
        willChange: "transform",
      });

      markerVisual.textContent = item.icon || "📍";

      markerElement.appendChild(markerVisual);

      markerVisual.addEventListener("mouseenter", () => {
        markerVisual.style.transform = "scale(1.15)";
        markerVisual.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.40)";
      });

      markerVisual.addEventListener("mouseleave", () => {
        markerVisual.style.transform = "scale(1)";
        markerVisual.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.30)";
      });

      const popupContent = document.createElement("div");

      Object.assign(popupContent.style, {
        minWidth: "240px",
        maxWidth: "320px",
        fontFamily: "Arial, Helvetica, sans-serif",
      });

      const title = document.createElement("h3");

      title.textContent = item.title || item.name || "Acontecimiento histórico";

      Object.assign(title.style, {
        margin: "0 0 8px",
        fontSize: "18px",
        color: "#111827",
      });

      popupContent.appendChild(title);

      if (item.date) {
        const date = document.createElement("div");

        date.textContent = `📅 ${item.date}`;

        Object.assign(date.style, {
          marginBottom: "8px",
          fontSize: "13px",
          fontWeight: "600",
          color: "#7c3aed",
        });

        popupContent.appendChild(date);
      }

      if (item.description) {
        const description = document.createElement("p");

        description.textContent = item.description;

        Object.assign(description.style, {
          margin: "0 0 12px",
          fontSize: "14px",
          lineHeight: "1.5",
          color: "#4b5563",
        });

        popupContent.appendChild(description);
      }

      if (item.location) {
        const location = document.createElement("div");

        location.textContent = `📍 ${item.location}`;

        Object.assign(location.style, {
          fontSize: "13px",
          color: "#6b7280",
          marginBottom: "8px",
        });

        popupContent.appendChild(location);
      }

      const button = document.createElement("button");

      button.textContent = "Ver información";

      Object.assign(button.style, {
        width: "100%",
        border: "none",
        borderRadius: "8px",
        padding: "9px 12px",
        background: "#7c3aed",
        color: "white",
        fontSize: "13px",
        fontWeight: "700",
        cursor: "pointer",
      });

      button.addEventListener("click", (event) => {
        event.stopPropagation();

        if (typeof onHistorySelect === "function") {
          onHistorySelect(item);
        }
      });

      popupContent.appendChild(button);

      const popup = new Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        maxWidth: "340px",
      }).setDOMContent(popupContent);

      const marker = new Marker({
        element: markerElement,
        anchor: "bottom",
      })
        .setLngLat([longitude, latitude])
        .setPopup(popup)
        .addTo(map);

      markerElement.addEventListener("click", (event) => {
        event.stopPropagation();

        if (typeof onHistorySelect === "function") {
          onHistorySelect(item);
        }
      });

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [historyData, onHistorySelect]);

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !selectedHistory) {
      return;
    }

    const latitude = Number(selectedHistory.latitude);
    const longitude = Number(selectedHistory.longitude);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return;
    }

    map.flyTo({
      center: [longitude, latitude],
      zoom: 7,
      duration: 1200,
      essential: true,
    });
  }, [selectedHistory]);

  return (
    <div
      ref={mapContainerRef}
      className="absolute inset-0 h-full w-full overflow-hidden"
    />
  );
}
