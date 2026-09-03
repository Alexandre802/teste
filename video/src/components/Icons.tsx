import type { FC } from "react";

export type IconName =
  | "trendUp"
  | "target"
  | "share"
  | "calculator"
  | "calendar"
  | "calendarCheck"
  | "bank"
  | "card"
  | "sheet"
  | "note"
  | "arrowIn"
  | "arrowOut"
  | "equals"
  | "check"
  | "flag"
  | "bars"
  | "bulb"
  | "shield"
  | "gear"
  | "refresh"
  | "chartDots"
  | "question"
  | "chevronDown"
  | "sparkle"
  | "arrowUpRight"
  | "arrowDownRight";

const P: Record<IconName, string> = {
  trendUp: "M3 17.5 9.2 10.8l3.6 3.3L21 6M21 6h-5.4M21 6v5.2",
  target: "M12 3.6a8.4 8.4 0 1 0 0 16.8 8.4 8.4 0 0 0 0-16.8Zm0 4.2a4.2 4.2 0 1 0 0 8.4 4.2 4.2 0 0 0 0-8.4Zm0 3.1a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Z",
  share: "M17.5 8.4a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Zm-11 6.2a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Zm11 6.2a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2ZM8.8 10.8l6.4-3.2m0 8.8-6.4-3.2",
  calculator:
    "M6.4 2.8h11.2a1.6 1.6 0 0 1 1.6 1.6v15.2a1.6 1.6 0 0 1-1.6 1.6H6.4a1.6 1.6 0 0 1-1.6-1.6V4.4a1.6 1.6 0 0 1 1.6-1.6Zm1.4 3.4h8.4v3.2H7.8V6.2Zm.4 6.6h.02m3.4 0h.02m3.4 0h.02M8.2 16.6h.02m3.4 0h.02m3.4 0h.02",
  calendar:
    "M5.6 5.2h12.8a1.4 1.4 0 0 1 1.4 1.4v12a1.4 1.4 0 0 1-1.4 1.4H5.6a1.4 1.4 0 0 1-1.4-1.4v-12a1.4 1.4 0 0 1 1.4-1.4Zm2.4-2.4v4m8-4v4M4.2 10h15.6",
  calendarCheck:
    "M5.6 5.2h12.8a1.4 1.4 0 0 1 1.4 1.4v12a1.4 1.4 0 0 1-1.4 1.4H5.6a1.4 1.4 0 0 1-1.4-1.4v-12a1.4 1.4 0 0 1 1.4-1.4Zm2.4-2.4v4m8-4v4M4.2 10h15.6m-6.6 4.4-2.6 3-1.6-1.6",
  bank: "M12 3 3.2 7.6h17.6L12 3ZM5.4 10.4v7.2m4.4-7.2v7.2m4.4-7.2v7.2m4.4-7.2v7.2M3.2 20.6h17.6",
  card: "M4 6.2h16a1.6 1.6 0 0 1 1.6 1.6v8.4a1.6 1.6 0 0 1-1.6 1.6H4a1.6 1.6 0 0 1-1.6-1.6V7.8A1.6 1.6 0 0 1 4 6.2Zm-1.6 4h19.2M5.6 14.4h3.2",
  sheet:
    "M5.8 3h12.4A1.4 1.4 0 0 1 19.6 4.4v15.2a1.4 1.4 0 0 1-1.4 1.4H5.8a1.4 1.4 0 0 1-1.4-1.4V4.4A1.4 1.4 0 0 1 5.8 3Zm-1.4 6.2h15.2M4.4 14.4h15.2M9.8 9.2v11.8",
  note: "M6 3.4h12a1.4 1.4 0 0 1 1.4 1.4v14.4a1.4 1.4 0 0 1-1.4 1.4H6a1.4 1.4 0 0 1-1.4-1.4V4.8A1.4 1.4 0 0 1 6 3.4Zm2.2 4.4h7.6m-7.6 4h7.6m-7.6 4h4.4",
  arrowIn: "M12 4v14m0 0-5.2-5.2M12 18l5.2-5.2",
  arrowOut: "M12 20V6m0 0L6.8 11.2M12 6l5.2 5.2",
  equals: "M5 9.4h14M5 14.6h14",
  check: "M5.5 12.6 10 17l8.5-9",
  flag: "M6 21V4.2m0 0h10.8l-2 3.4 2 3.4H6",
  bars: "M5 20V12.5M12 20V4.6M19 20V9",
  bulb: "M12 3.2a5.6 5.6 0 0 0-3.4 10.1c.7.6 1.1 1.4 1.1 2.3v.6h4.6v-.6c0-.9.4-1.7 1.1-2.3A5.6 5.6 0 0 0 12 3.2ZM9.7 19.4h4.6m-3.8 2.2h3",
  shield: "M12 2.8 4.6 5.9v5.4c0 4.5 3.1 8.6 7.4 9.9 4.3-1.3 7.4-5.4 7.4-9.9V5.9L12 2.8Zm-3.2 9.3 2.3 2.3 4.3-4.6",
  gear: "M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8Zm7.6 3.4c0 .5 0 1-.1 1.4l2 1.6-1.9 3.3-2.4-1a7.6 7.6 0 0 1-2.4 1.4l-.4 2.5h-3.8l-.4-2.5a7.6 7.6 0 0 1-2.4-1.4l-2.4 1L3.5 15l2-1.6a8 8 0 0 1 0-2.8l-2-1.6 1.9-3.3 2.4 1a7.6 7.6 0 0 1 2.4-1.4l.4-2.5h3.8l.4 2.5c.9.3 1.7.8 2.4 1.4l2.4-1L21.5 9l-2 1.6c.1.4.1.9.1 1.4Z",
  refresh: "M20.2 12a8.2 8.2 0 1 1-2.6-6m2.6-2.4V8h-4.6",
  chartDots: "M3.4 17.6 9 12l3.4 3 7.2-8.4M4.6 20.4h15.8",
  question: "M9.2 9a2.9 2.9 0 1 1 3.9 2.7c-.7.3-1.1 1-1.1 1.7v.8m0 3.2h.02",
  chevronDown: "m6.5 9.5 5.5 5.5 5.5-5.5",
  sparkle: "M12 3.2 13.7 9l5.8 1.7-5.8 1.7L12 18.2l-1.7-5.8L4.5 10.7 10.3 9 12 3.2Z",
  arrowUpRight: "M7 17 17 7m0 0H9.4M17 7v7.6",
  arrowDownRight: "M7 7l10 10m0 0V9.4M17 17H9.4",
};

/** Icone SVG traçado, herdando a cor do container. */
export const Icon: FC<{
  name: IconName;
  size?: number;
  color?: string;
  width?: number;
  fill?: string;
}> = ({ name, size = 24, color = "currentColor", width = 1.9, fill = "none" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={{ display: "block", flexShrink: 0 }}
  >
    <path
      d={P[name]}
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={fill}
    />
  </svg>
);
