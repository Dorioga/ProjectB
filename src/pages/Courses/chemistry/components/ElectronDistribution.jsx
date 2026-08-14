import { useState } from "react";

import periodicTable from "../data/periodicTable";
import { getElectronConfiguration } from "../utils/electronDistribution";
import ElementSelect from "./ElementSelect";

const DOT_SIZE = 6;

export default function ElectronDistribution() {
  const [selectedNumber, setSelectedNumber] = useState(1);

  const element = periodicTable.find((e) => e.number === Number(selectedNumber));
  const { config, shells } = getElectronConfiguration(Number(selectedNumber));

  const ringSizes = shells.map((_, i) => {
    if (shells.length === 1) return 120;
    return 70 + (i * (250 - 70)) / (shells.length - 1);
  });

  return (
    <div className="min-h-full flex flex-col items-center justify-center gap-6 p-4 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center">
        Distribución Electrónica
      </h2>

      <div className="w-full max-w-xl">
        <label className="block">
          <span className="text-xs font-medium text-gray-500">Elemento</span>

          <ElementSelect
            value={selectedNumber}
            onChange={setSelectedNumber}
          />
        </label>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Diagrama de capas */}
        <div className="relative w-[260px] h-[260px] shrink-0">
          {shells.map((shell, i) => {
            const size = ringSizes[i];
            const radius = size / 2;

            return (
              <div
                key={shell.label}
                className="absolute"
                style={{
                  width: size,
                  height: size,
                  top: `calc(50% - ${size / 2}px)`,
                  left: `calc(50% - ${size / 2}px)`,
                }}
              >
                <div
                  className="absolute inset-0 rounded-full border-2"
                  style={{ borderColor: shell.color }}
                />

                {Array.from({ length: shell.electrons }).map((_, j) => {
                  const angle = -Math.PI / 2 + (2 * Math.PI * j) / shell.electrons;
                  const x = radius * Math.cos(angle);
                  const y = radius * Math.sin(angle);

                  return (
                    <span
                      key={j}
                      className="absolute rounded-full"
                      style={{
                        width: DOT_SIZE,
                        height: DOT_SIZE,
                        backgroundColor: shell.color,
                        left: `calc(50% + ${x}px - ${DOT_SIZE / 2}px)`,
                        top: `calc(50% + ${y}px - ${DOT_SIZE / 2}px)`,
                      }}
                    />
                  );
                })}
              </div>
            );
          })}

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-[#1976d2] text-white flex flex-col items-center justify-center shadow">
            <span className="font-bold text-lg leading-none">
              {element.symbol}
            </span>
            <span className="text-[9px]">{element.number}</span>
          </div>
        </div>

        {/* Información */}
        <div className="flex flex-col gap-4 min-w-[220px] max-w-sm">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800">
              {element.symbol}
            </div>
            <div className="text-gray-600">{element.name}</div>
            <div className="text-xs text-gray-400">Z = {element.number}</div>
          </div>

          <div className="text-center">
            <p className="text-[11px] font-bold tracking-widest text-gray-500 mb-1">
              CONFIGURACIÓN ELECTRÓNICA
            </p>
            <p className="text-sm text-gray-700 leading-relaxed break-words">
              {config.map((c, i) => (
                <span key={c.subshell}>
                  {i > 0 && " "}
                  {c.subshell}
                  <sup>{c.electrons}</sup>
                </span>
              ))}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-bold tracking-widest text-gray-500 mb-1">
              DISTRIBUCIÓN POR CAPAS
            </p>
            <div className="flex flex-col gap-1">
              {shells.map((shell) => (
                <div
                  key={shell.label}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2 font-semibold text-gray-800">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: shell.color }}
                    />
                    Capa {shell.label}
                  </span>
                  <span className="text-gray-600">{shell.electrons} e⁻</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
