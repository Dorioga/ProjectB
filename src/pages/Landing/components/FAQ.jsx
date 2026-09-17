import { useState } from "react";
import { faqData } from "../data";
import { Icon } from "./Icons";

function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <section id="preguntas-frecuentes" className="bg-bg py-24">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="text-secondary font-bold text-xs tracking-widest uppercase mb-3 block">
            FAQ
          </span>
          <h2 className="text-4xl font-extrabold text-primary">
            Preguntas frecuentes.
          </h2>
        </div>

        <div className="space-y-3">
          {faqData.map(({ q, a }, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm"
            >
              <button
                type="button"
                className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-semibold text-primary pr-4">{q}</span>
                <span
                  className={`text-slate-400 shrink-0 transition-transform duration-200 ${
                    open === i ? "rotate-180" : ""
                  }`}
                >
                  <Icon.ChevronDown />
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  open === i ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <p className="px-6 pb-5 text-muted text-sm leading-relaxed">
                  {a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
