export type ThemeName = 'dark' | 'light';

export type Palette = {
  bg: string;
  surface: string;
  surfaceHi: string;
  text: string;
  textMuted: string;
  accent: string; // text, borders, highlights
  brand: string; // filled areas: primary buttons, progress bars
  onBrand: string; // text on brand fills
  good: string;
  bad: string;
  border: string;
  brandSoft: string; // tinted hero backgrounds
  warm: string; // apricot from the cats' fur: treats and streaks only
};

// Signature color: #E5A2F2 (her favorite lavender-pink).
// Every text/background pair is >= 7:1 contrast.
export const BRAND = '#E5A2F2';

export const palettes: Record<ThemeName, Palette> = {
  dark: {
    bg: '#1B1420',
    surface: '#2A2030',
    surfaceHi: '#3A2C42',
    text: '#FBF6FF',
    textMuted: '#E6DCEB',
    accent: BRAND,
    brand: BRAND,
    onBrand: '#1B1420',
    good: '#8FE3A6',
    bad: '#FFAB9C',
    border: '#7A6584',
    brandSoft: '#3A2646',
    warm: '#F6AE68',
  },
  light: {
    bg: '#FFF8FE',
    surface: '#FFFFFF',
    surfaceHi: '#F6E6FA',
    text: '#1B1420',
    textMuted: '#3E3245',
    accent: '#7A2E8C', // deep version of the brand color so text stays readable
    brand: BRAND,
    onBrand: '#1B1420',
    good: '#1D6B34',
    bad: '#A3271A',
    border: '#A58BAE',
    brandSoft: '#F6E3FA',
    warm: '#6E370A',
  },
};

// Base sizes in sp. Multiplied by the in-app text size, and Android's
// own font scale is applied on top automatically.
export const type = {
  h1: 32,
  h2: 26,
  body: 21,
  small: 18,
};

export const space = { xs: 6, sm: 12, md: 18, lg: 26, xl: 36 };
export const radius = 22;
/** Corner radius follows importance: the hero card is the roundest, chips the tightest. */
export const radii = { hero: 32, card: 22, chip: 16 };
export const maxWidth = 560;
export const TEXT_SCALES = [1, 1.15, 1.3, 1.5, 1.75];

// Fonts (loaded in App.tsx). Headings: Nunito ExtraBold. Body: Atkinson Hyperlegible.
export const fonts = {
  heading: 'Nunito_800ExtraBold',
  body: 'AtkinsonHyperlegible_400Regular',
  bold: 'AtkinsonHyperlegible_700Bold',
};
