import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

const base = (size = 20): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
});

export const ArrowRight = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const ArrowLeft = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);
export const Check = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
export const Close = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
export const Play = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M8 5.5v13l10.5-6.5L8 5.5z" fill="currentColor" stroke="none" />
  </svg>
);
export const Pause = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M8.5 5.5v13M15.5 5.5v13" strokeWidth={2.4} />
  </svg>
);
export const Settings = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="10" cy="17" r="2" />
  </svg>
);
export const Clock = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);
export const Sun = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
  </svg>
);
export const Moon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z" />
  </svg>
);
export const Leaf = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15" />
    <path d="M5 19c3-4 6-6.5 10-8.5" />
  </svg>
);
export const Spark = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.5 2.5M15.2 15.2l2.5 2.5M6.3 17.7l2.5-2.5M15.2 8.8l2.5-2.5" />
  </svg>
);
export const Chart = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5H12V3.5z" />
    <path d="M15 3.9A8.5 8.5 0 0 1 20.1 9H15V3.9z" />
  </svg>
);
export const Cards = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <rect x="6.5" y="4" width="11" height="15" rx="2.5" />
    <path d="M4 7.5v10A2.5 2.5 0 0 0 6.5 20M20 7.5v10a2.5 2.5 0 0 1-2.5 2.5" opacity=".55" />
  </svg>
);
export const Undo = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M9 14L4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
  </svg>
);
export const Lock = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
  </svg>
);
export const Info = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5M12 7.8v.2" />
  </svg>
);
export const Book = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 6.5C10.2 5.2 7.7 4.6 4.5 4.8v13c3.2-.2 5.7.4 7.5 1.7 1.8-1.3 4.3-1.9 7.5-1.7v-13c-3.2-.2-5.7.4-7.5 1.7z" />
    <path d="M12 6.5v13" />
  </svg>
);
