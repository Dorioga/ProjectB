import { X } from "lucide-react";

import MoreInfoButton from "../../shared/MoreInfoButton";
import { CATEGORY_META } from "../data/periodicTable";

export default function ElementInfoContent({ element, onClose }) {
  if (!element) return null;

  const category = CATEGORY_META[element.category] ?? CATEGORY_META.desconocido;

  const facts = [
    { label: "Número atómico", value: element.number },
    { label: "Masa atómica", value: `${element.atomicMass} u` },
    { label: "Categoría", value: category.label },
    ...(element.series
      ? [
          {
            label: "Serie",
            value: element.series === "lantánido" ? "Lantánidos" : "Actínidos",
          },
        ]
      : [{ label: "Grupo", value: element.group }]),
    { label: "Período", value: element.period },
  ];

  return (
    <div className="w-full max-w-full relative">
      <div className="p-3 md:p-5">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-black/5 cursor-pointer"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        )}

        <div className="flex items-center justify-between gap-3 pr-8">
          <div className="flex-1">
            <h3 className="font-bold text-xl">{element.name}</h3>
            <p className="text-sm text-gray-500">{category.label}</p>
          </div>

          <div
            className="w-[70px] h-[70px] md:w-[84px] md:h-[84px] rounded-xl flex items-center justify-center shrink-0 shadow-inner"
            style={{ backgroundColor: category.color }}
          >
            <span className="font-bold text-2xl md:text-3xl text-gray-900">
              {element.symbol}
            </span>
          </div>
        </div>

        <hr className="my-2 border-gray-200" />

        <p className="text-sm text-gray-600 leading-relaxed text-justify">
          {element.description}
        </p>

        <hr className="my-2 border-gray-200" />

        <p className="text-[11px] font-bold tracking-widest text-gray-500">
          DATOS DEL ELEMENTO
        </p>

        <div className="mt-1 flex flex-col gap-1">
          {facts.map((fact) => (
            <div
              key={fact.label}
              className="flex items-baseline justify-between gap-2"
            >
              <span className="font-semibold leading-tight">{fact.label}</span>
              <span className="text-right text-gray-500 text-sm">
                {fact.value}
              </span>
            </div>
          ))}
        </div>

        <MoreInfoButton
          href={`https://es.wikipedia.org/wiki/${encodeURIComponent(element.name)}`}
          className="mt-2"
        />
      </div>
    </div>
  );
}
