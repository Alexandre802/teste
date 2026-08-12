import React from 'react';
import { COLORS } from '../theme';

type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
};

const wrap =
  (
    viewBox: string,
    render: (c: string, sw: number) => React.ReactNode,
  ): React.FC<IconProps> =>
  ({ size = 48, color = COLORS.primary, strokeWidth = 6, style }) => (
    <svg width={size} height={size} viewBox={viewBox} style={style}>
      {render(color, strokeWidth)}
    </svg>
  );

export const ScissorsIcon = wrap('0 0 100 100', (c, sw) => (
  <g
    stroke={c}
    strokeWidth={sw}
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    transform="rotate(-28 50 50)"
  >
    <circle cx="24" cy="76" r="12" />
    <circle cx="70" cy="76" r="12" />
    <path d="M 32 68 L 76 14" />
    <path d="M 62 68 L 18 14" />
  </g>
));

export const CombIcon = wrap('0 0 100 100', (c) => (
  <g fill={c}>
    <rect x="14" y="14" width="72" height="16" rx="8" />
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x={18 + i * 15} y="30" width="10" height="52" rx="5" />
    ))}
  </g>
));

export const CrossIcon = wrap('0 0 100 100', (c) => (
  <g fill={c}>
    <rect x="40" y="18" width="20" height="64" rx="9" />
    <rect x="18" y="40" width="64" height="20" rx="9" />
  </g>
));

export const BarberIcon = wrap('0 0 100 100', (c, sw) => (
  <g>
    <defs>
      <clipPath id="barber-pole-clip">
        <rect x="33" y="20" width="34" height="60" rx="16" />
      </clipPath>
    </defs>
    <rect x="28" y="8" width="44" height="13" rx="6.5" fill={c} />
    <rect x="28" y="79" width="44" height="13" rx="6.5" fill={c} />
    <rect x="33" y="20" width="34" height="60" rx="16" fill={c} />
    <g clipPath="url(#barber-pole-clip)">
      {[0, 1, 2, 3].map((i) => (
        <path
          key={i}
          d={`M ${18 + i * 17} 84 L ${34 + i * 17} 16`}
          stroke="#FFF"
          strokeWidth="8"
        />
      ))}
    </g>
    <rect
      x="33"
      y="20"
      width="34"
      height="60"
      rx="16"
      fill="none"
      stroke={c}
      strokeWidth={sw * 0.6}
    />
  </g>
));

export const BellIcon = wrap('0 0 100 100', (c) => (
  <g fill={c}>
    <path d="M 50 12 C 34 12 24 24 24 40 L 24 58 L 14 72 L 86 72 L 76 58 L 76 40 C 76 24 66 12 50 12 Z" />
    <path d="M 40 78 C 42 86 46 90 50 90 C 54 90 58 86 60 78 Z" />
  </g>
));

export const AlarmIcon = wrap('0 0 100 100', (c, sw) => (
  <g stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round">
    <circle cx="50" cy="55" r="30" />
    <path d="M 50 38 L 50 55 L 63 62" />
    <path d="M 22 20 L 34 30" />
    <path d="M 78 20 L 66 30" />
    <path d="M 30 84 L 24 92" />
    <path d="M 70 84 L 76 92" />
  </g>
));

export const PersonIcon = wrap('0 0 100 100', (c) => (
  <g fill={c}>
    <circle cx="50" cy="34" r="17" />
    <path d="M 18 84 C 18 66 32 56 50 56 C 68 56 82 66 82 84 Z" />
  </g>
));

export const CheckIcon = wrap('0 0 100 100', (c, sw) => (
  <path
    d="M 24 52 L 43 70 L 78 32"
    stroke={c}
    strokeWidth={sw + 3}
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
));

export const CalendarIcon = wrap('0 0 100 100', (c, sw) => (
  <g stroke={c} strokeWidth={sw} fill="none">
    <rect x="14" y="22" width="72" height="66" rx="12" />
    <path d="M 14 42 L 86 42" />
    <path d="M 32 12 L 32 30" strokeLinecap="round" />
    <path d="M 68 12 L 68 30" strokeLinecap="round" />
    <g fill={c} stroke="none">
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((k) => (
          <rect key={`${r}${k}`} x={28 + k * 16} y={52 + r * 12} width="8" height="8" rx="2" />
        )),
      )}
    </g>
  </g>
));

export const ClockIcon = wrap('0 0 100 100', (c, sw) => (
  <g stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round">
    <circle cx="50" cy="50" r="34" />
    <path d="M 50 28 L 50 52 L 66 60" />
  </g>
));

/** Robô do avatar da IA — corpo e detalhes em cores separadas. */
export const RobotIcon: React.FC<
  IconProps & { accent?: string }
> = ({ size = 48, color = COLORS.white, accent = COLORS.primary, style }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
    <g fill={color}>
      <circle cx="50" cy="11" r="6" />
      <rect x="47" y="15" width="6" height="12" />
      <rect x="18" y="26" width="64" height="50" rx="18" />
      <rect x="6" y="40" width="9" height="22" rx="4.5" />
      <rect x="85" y="40" width="9" height="22" rx="4.5" />
    </g>
    <g fill={accent}>
      <circle cx="36" cy="46" r="8" />
      <circle cx="64" cy="46" r="8" />
      <rect x="37" y="61" width="26" height="7" rx="3.5" />
    </g>
  </svg>
);

export const StoreIcon = wrap('0 0 100 100', (c) => (
  <g fill={c}>
    <path d="M 16 22 L 84 22 L 90 44 C 90 52 82 58 74 58 C 68 58 63 54 61 49 C 59 54 55 58 50 58 C 45 58 41 54 39 49 C 37 54 32 58 26 58 C 18 58 10 52 10 44 Z" />
    <path d="M 20 60 L 20 86 L 80 86 L 80 60 C 76 62 70 62 66 60 L 66 78 L 34 78 L 34 60 C 30 62 24 62 20 60 Z" />
  </g>
));

export const WarningIcon = wrap('0 0 100 100', (c) => (
  <g>
    <path d="M 50 12 L 92 84 L 8 84 Z" fill={c} />
    <rect x="45" y="36" width="10" height="26" rx="5" fill="#FFF" />
    <circle cx="50" cy="72" r="5.5" fill="#FFF" />
  </g>
));

export const BellOutlineIcon = wrap('0 0 100 100', (c, sw) => (
  <g stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M 26 68 L 26 44 C 26 30 37 18 50 18 C 63 18 74 30 74 44 L 74 68 L 84 78 L 16 78 Z" />
    <path d="M 41 84 C 43 89 46 92 50 92 C 54 92 57 89 59 84" />
  </g>
));

export const PhoneCallIcon = wrap('0 0 100 100', (c) => (
  <path
    d="M 26 14 C 20 14 12 22 12 32 C 12 58 42 88 68 88 C 78 88 86 80 86 74 L 68 62 L 58 72 C 48 66 34 52 28 42 L 38 32 Z"
    fill={c}
  />
));

export const VideoIcon = wrap('0 0 100 100', (c) => (
  <g fill={c}>
    <rect x="10" y="28" width="56" height="44" rx="10" />
    <path d="M 70 46 L 92 32 L 92 68 L 70 54 Z" />
  </g>
));

export const DotsIcon = wrap('0 0 100 100', (c) => (
  <g fill={c}>
    <circle cx="50" cy="20" r="7" />
    <circle cx="50" cy="50" r="7" />
    <circle cx="50" cy="80" r="7" />
  </g>
));

export const ArrowLeftIcon = wrap('0 0 100 100', (c, sw) => (
  <g stroke={c} strokeWidth={sw + 1} fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M 62 22 L 34 50 L 62 78" />
  </g>
));

export const PaperclipIcon = wrap('0 0 100 100', (c, sw) => (
  <path
    d="M 68 40 L 40 68 C 33 75 22 75 16 68 C 9 62 9 51 16 44 L 50 10 C 55 5 63 5 68 10 C 73 15 73 23 68 28 L 36 60 C 34 62 31 62 29 60 C 27 58 27 55 29 53 L 57 25"
    stroke={c}
    strokeWidth={sw}
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
));

export const MicIcon = wrap('0 0 100 100', (c, sw) => (
  <g fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round">
    <rect x="38" y="10" width="24" height="46" rx="12" fill={c} stroke="none" />
    <path d="M 24 48 C 24 66 36 76 50 76 C 64 76 76 66 76 48" />
    <path d="M 50 76 L 50 90" />
  </g>
));

export const SmileyIcon = wrap('0 0 100 100', (c, sw) => (
  <g stroke={c} strokeWidth={sw} fill="none" strokeLinecap="round">
    <circle cx="50" cy="50" r="36" />
    <circle cx="37" cy="42" r="4" fill={c} />
    <circle cx="63" cy="42" r="4" fill={c} />
    <path d="M 34 62 C 40 70 60 70 66 62" />
  </g>
));

export const WhatsappIcon: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="50" fill={COLORS.green} />
    <path
      d="M 30 72 L 33 60 C 30 55 29 50 29 45 C 29 33 39 24 51 24 C 63 24 73 33 73 45 C 73 57 63 66 51 66 C 47 66 43 65 40 63 Z"
      fill="#FFF"
    />
    <path
      d="M 41 39 C 40 37 39 37 38 37 C 37 37 36 38 36 39 C 35 41 36 44 38 47 C 41 51 45 54 50 56 C 53 57 55 56 56 55 C 57 54 58 52 57 51 L 53 48 C 52 48 51 49 50 50 C 48 49 45 46 44 44 C 45 43 46 42 46 41 Z"
      fill={COLORS.green}
    />
  </svg>
);

export const DoubleCheck: React.FC<{ size?: number; color?: string; progress?: number }> = ({
  size = 34,
  color = COLORS.primary,
  progress = 1,
}) => (
  <svg width={size} height={size * 0.62} viewBox="0 0 100 62">
    <g
      stroke={color}
      strokeWidth="11"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="70"
      strokeDashoffset={70 * (1 - progress)}
    >
      <path d="M 6 34 L 24 52 L 58 12" />
      <path d="M 40 34 L 58 52 L 92 12" />
    </g>
  </svg>
);

export const ICONS = {
  scissors: ScissorsIcon,
  comb: CombIcon,
  cross: CrossIcon,
  barber: BarberIcon,
  bell: BellIcon,
  alarm: AlarmIcon,
  person: PersonIcon,
  check: CheckIcon,
  calendar: CalendarIcon,
  clock: ClockIcon,
  robot: RobotIcon,
  store: StoreIcon,
  warning: WarningIcon,
} as const;

export type IconName = keyof typeof ICONS;
