import { ExternalLink } from "lucide-react";

export default function MoreInfoButton({
  href,
  label = "Más información",
  className = "",
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-center gap-2 w-full py-2 rounded-2xl bg-[#1976d2] text-white font-semibold text-sm hover:opacity-90 cursor-pointer ${className}`}
    >
      {label}
      <ExternalLink size={16} />
    </a>
  );
}
