// ---------------------------------------------------------------------------
// ProjectIcons.jsx
// Small set of hand-drawn, single-color SVG glyphs used on project cards
// instead of stock screenshots/placeholders. Each draws with currentColor
// so accent color comes purely from CSS (see .pf-project-card--gold/purple).
// ---------------------------------------------------------------------------
export default function ProjectIcon({ name, className = "" }) {
  const common = {
    className: `pf-project-icon ${className}`,
    viewBox: "0 0 48 48",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
  };

  switch (name) {
    case "joystick":
      return (
        <svg {...common}>
          <circle cx="24" cy="16" r="9" stroke="currentColor" strokeWidth="2" />
          <path d="M24 25v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path
            d="M13 34h22a3 3 0 0 1 3 3v1a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3v-1a3 3 0 0 1 3-3Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="20.5" cy="14" r="1.6" fill="currentColor" />
          <circle cx="27.5" cy="18" r="1.6" fill="currentColor" />
        </svg>
      );
    case "sword":
      return (
        <svg {...common}>
          <path
            d="M30 6 13 23l-4 8 8-4 17-17-4-4Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M9 31l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M25 11l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M9 39l3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "leaf":
      return (
        <svg {...common}>
          <path
            d="M36 12C20 12 12 22 12 34c12 0 22-8 22-22 0-1 0-1 0 0Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M14 34c4-8 10-14 18-18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "chip":
      return (
        <svg {...common}>
          <rect x="14" y="14" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
          <rect x="20" y="20" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2" />
          {[12, 18, 24, 30].map((y) => (
            <g key={y}>
              <path d={`M14 ${y}H8`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d={`M34 ${y}H40`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </g>
          ))}
          {[12, 18, 24, 30].map((x) => (
            <g key={`v${x}`}>
              <path d={`M${x} 14V8`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d={`M${x} 34V40`} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </g>
          ))}
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path
            d="M24 6l14 5v11c0 11-7 17-14 20-7-3-14-9-14-20V11l14-5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M18 24l4 4 9-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
  }
}
