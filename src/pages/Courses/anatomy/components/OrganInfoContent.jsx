import MoreInfoButton from "../../shared/MoreInfoButton";

export default function OrganInfoContent({ model }) {
  if (!model) return null;

  return (
    <div className="w-full max-w-full rounded-3xl bg-white shadow-xl ">
      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-bold text-lg">{model.name}</h3>
            <p className="text-sm text-gray-500">Órgano</p>
          </div>

          <img
            src={model.image}
            alt={model.name}
            className="w-[90px] h-[90px] rounded-xl object-cover"
          />
        </div>

        <hr className="my-2 border-gray-200" />

        <p className="text-sm text-gray-600 leading-relaxed text-justify">
          {model.summary}
        </p>

        <hr className="my-2 border-gray-200" />

        <p className="text-[11px] font-bold tracking-widest text-gray-500">
          DATOS GENERALES
        </p>

        <div className="mt-1 flex flex-col gap-1">
          {model.facts.map((fact) => (
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

        <MoreInfoButton href={model.wikipedia} className="mt-2" />
      </div>
    </div>
  );
}
