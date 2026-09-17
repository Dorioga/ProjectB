export function DarkCard({ icon, title, children, className = "" }) {
  return (
    <div
      className={`dark-card bg-primary rounded-[18px] p-6 border border-slate-800 ${className}`}
    >
      <div className="w-10 h-10 icon-chip rounded-xl flex items-center justify-center text-secondary mb-4">
        {icon}
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <div className="text-slate-400 text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export function OrangeButton({
  children,
  className = "",
  onClick,
  type = "button",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bg-secondary hover:brightness-110 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-lg active:scale-[0.98] cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
}
