// Paleta amostrada diretamente das artes de referência.
export const theme = {
  navy: '#00014a',
  navyDeep: '#000261',
  blue: '#020a7e',
  blueMid: '#0427ad',
  blueBright: '#1e6bff',
  cyan: '#39c5ff',
  cyanSoft: '#7fd8ff',
  white: '#ffffff',
  ink: '#0b1020',
  amber: '#ffc21a',
  green: '#22c55e',
  red: '#e8232a',
} as const;

export const font = {
  // Display: condensada bold em itálico, como nas artes.
  display: '"Anton", "Archivo", system-ui, sans-serif',
  // Apoio: geométrica, para subtítulos e UI.
  body: '"Archivo", system-ui, sans-serif',
} as const;

// O display das artes é inclinado; sem o arquivo da marca, aproximamos
// com Anton + inclinação. Trocar por `skewX(0)` quando a fonte oficial chegar.
export const DISPLAY_SKEW = -8;
