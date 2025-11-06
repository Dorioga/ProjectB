// SVG como string para usar en img src con data URL
export const schoolLogoSVG = `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="#f0f4f8" />
  <circle cx="100" cy="100" r="80" fill="#2c3e50" />
  <path d="M100 50 L140 80 L100 110 L60 80 Z" fill="#ecf0f1" stroke="#bdc3c7" stroke-width="2" />
  <rect x="85" y="110" width="30" height="40" fill="#ecf0f1" stroke="#bdc3c7" stroke-width="2" />
  <text x="100" y="170" font-family="Arial, sans-serif" font-size="16" fill="#2c3e50" text-anchor="middle">Escuela Genérica</text>
</svg>`;

// Convertir SVG a Data URL para usar en <img src={...}>
export const schoolLogoDataURL = `data:image/svg+xml;base64,${btoa(
  schoolLogoSVG
)}`;

// También exportar como componente React si lo prefieres
export const SchoolLogoComponent = () => (
  <svg
    width="200"
    height="200"
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="200" height="200" fill="#f0f4f8" />
    <circle cx="100" cy="100" r="80" fill="#2c3e50" />
    <path
      d="M100 50 L140 80 L100 110 L60 80 Z"
      fill="#ecf0f1"
      stroke="#bdc3c7"
      strokeWidth="2"
    />
    <rect
      x="85"
      y="110"
      width="30"
      height="40"
      fill="#ecf0f1"
      stroke="#bdc3c7"
      strokeWidth="2"
    />
    <text
      x="100"
      y="170"
      fontFamily="Arial, sans-serif"
      fontSize="16"
      fill="#2c3e50"
      textAnchor="middle"
    ></text>
  </svg>
);
