import React from 'react';
import Svg, { Path } from 'react-native-svg';

// Simple original line icons on a 24×24 grid.
const PATHS = {
  check: 'M5 12.5l4.5 4.5L19 7',
  x: 'M6 6l12 12M18 6L6 18',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  back: 'M15 5l-7 7 7 7',
  next: 'M9 5l7 7-7 7',
  play: 'M8 5v14l11-7z',
  stop: 'M7 7h10v10H7z',
  speaker: 'M4 9v6h4l5 4V5L8 9H4z M16 9a4 4 0 0 1 0 6 M18.5 6.5a7.5 7.5 0 0 1 0 11',
  flame: 'M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5 .3 1.7 1.2 2.6 2.2 3C12 9 11 6 12 3z',
  star: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z',
  map: 'M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z M9 4v14 M15 6v14',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z M4 19V5 M8 7h7',
  sheet: 'M6 3h9l4 4v14H6z M14 3v5h5 M9 12h7 M9 16h7',
  gear: 'M12 8.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 1 0 0-7z M12 2v3 M12 19v3 M2 12h3 M19 12h3 M4.9 4.9l2.1 2.1 M17 17l2.1 2.1 M4.9 19.1L7 17 M17 7l2.1-2.1',
  snow: 'M12 2v20 M3.5 7l17 10 M3.5 17l17-10',
  lock: 'M6 11h12v10H6z M8.5 11V8a3.5 3.5 0 0 1 7 0v3',
  moon: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',
  trophy: 'M8 4h8v5a4 4 0 0 1-8 0z M8 6H5a3 3 0 0 0 3 4 M16 6h3a3 3 0 0 1-3 4 M12 13v4 M8 21h8 M9.5 17h5',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
  refresh: 'M20 11a8 8 0 1 0-2.3 5.7 M20 4v7h-7',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7z',
  bug: 'M9 8a3 3 0 0 1 6 0 M8 9h8v5a4 4 0 0 1-8 0z M4 13h4 M16 13h4 M5 8l3 2 M19 8l-3 2 M5 19l3-2 M19 19l-3-2 M12 9v9',
  help: 'M12 21a9 9 0 1 0 0-18a9 9 0 1 0 0 18z M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.5V14 M12 17.5v.01',
  flask: 'M9 3h6 M10 3v6l-5 9a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3 M7.5 15h9',
  bulb: 'M9 18h6 M10 21h4 M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z M12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6z',
  save: 'M12 3v12 M7 10l5 5 5-5 M4 17v3h16v-3',
  down: 'M12 5v14 M6 13l6 6 6-6',
  up: 'M12 19V5 M6 11l6-6 6 6',
  erase: 'M9 5h11v14H9l-6-7z M12 9l5 6 M17 9l-5 6',
  chart: 'M4 20V10 M10 20V4 M16 20v-7 M3 20h18',
  home: 'M3 11l9-7 9 7 M5 10v10h14V10',
  clock: 'M12 21a9 9 0 1 0 0-18a9 9 0 1 0 0 18z M12 7v5l3 2',
  pencil: 'M4 20h4L19 9l-4-4L4 16z',
  coffee: 'M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z M16 10h2a2.5 2.5 0 0 1 0 5h-2 M8 3v3 M12 3v3',
  text: 'M4 7V5h16v2 M12 5v14 M9 19h6',
  palette: 'M12 3a9 9 0 1 0 0 18c1 0 1.5-.7 1.5-1.5 0-1.2-1-1.5-1-2.5 0-.8.7-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-4.1-4-7.5-9-7.5z',
  bell: 'M6 16V11a6 6 0 1 1 12 0v5l2 2H4z M10 21h4',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  code: 'M8 7l-5 5 5 5 M16 7l5 5-5 5',
  fish: 'M3 12c3-5 9-6 13-3l5-3v12l-5-3c-4 3-10 2-13-3z M8.5 11v.01',
  bowl: 'M3 11h18a9 7 0 0 1-18 0z M8 8c.7-1.4 2.3-1.4 3 0 M13 8c.7-1.4 2.3-1.4 3 0',
  can: 'M6 5h12v15H6z M6 8.5h12 M9 13h6 M9 16h4',
  yarn: 'M12 21a9 9 0 1 0 0-18a9 9 0 1 0 0 18z M5 8c4 1 9 5 11 12 M8 4c3 3 6 8 7 15 M3.5 13c4-1 9 1 12 6',
  feather: 'M20 4c-8 0-14 6-14 14v2 M6 18L18 6 M10 14h5 M12 10h5',
  box: 'M3 8l9-4 9 4v9l-9 4-9-4z M3 8l9 4 9-4 M12 12v9',
  heart: 'M12 20s-7-4.5-9-9c-1.3-3 1-6.5 4.5-6.5 2 0 3.5 1.5 4.5 3 1-1.5 2.5-3 4.5-3 3.5 0 5.8 3.5 4.5 6.5-2 4.5-9 9-9 9z',
  mouse: 'M4 15c0-4 3-7 7-7s7 3 7 7H4z M14 9.5a2.5 2.5 0 1 1 3-3 M18 15c2 0 3 1.5 3 3',
  paw: 'M4.4 10.2a1.9 2.3 0 1 0 3.8 0a1.9 2.3 0 1 0 -3.8 0z M7.9 6.6a1.9 2.3 0 1 0 3.8 0a1.9 2.3 0 1 0 -3.8 0z M12.299999999999999 6.6a1.9 2.3 0 1 0 3.8 0a1.9 2.3 0 1 0 -3.8 0z M15.799999999999999 10.2a1.9 2.3 0 1 0 3.8 0a1.9 2.3 0 1 0 -3.8 0z M12 12.5c-3 0-5.2 2.6-5.2 4.8 0 1.6 1.5 2.6 3.1 2.1 1.4-.4 2.8-.4 4.2 0 1.6.5 3.1-.5 3.1-2.1 0-2.2-2.2-4.8-5.2-4.8z',
  crown: 'M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z M5 19h14',
  user: 'M12 12a4 4 0 1 0 0-8a4 4 0 1 0 0 8z M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5',
  database: 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6 M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
} as const;

export type IconName = keyof typeof PATHS;
const FILLED: IconName[] = ['play', 'stop', 'star', 'flame', 'sparkle', 'bolt', 'paw'];

export function Icon({ name, size = 24, color, filled }: { name: IconName; size?: number; color: string; filled?: boolean }) {
  const fill = filled ?? FILLED.includes(name);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no">
      <Path
        d={PATHS[name]}
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={fill ? color : 'none'}
      />
    </Svg>
  );
}

export const isIconName = (s: string): s is IconName => s in PATHS;
