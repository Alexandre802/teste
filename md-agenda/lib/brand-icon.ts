/**
 * O símbolo da marca em SVG, para gerar os ícones do PWA.
 *
 * Mesmo traço do componente `LogoMark` — a aba do navegador, a tela de
 * instalação e o cabeçalho mostram exatamente o mesmo desenho.
 */
export function brandIconSvg(size: number, stroke = '#d89b32'): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
<rect x="4.25" y="6.75" width="23.5" height="21" rx="4" stroke="${stroke}" stroke-width="1.6"/>
<path d="M10.5 3.5v6M21.5 3.5v6" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round"/>
<path d="M4.25 13.25h23.5" stroke="${stroke}" stroke-width="1.3" opacity="0.55"/>
<path d="M10.6 16.4 21 24.2M21.4 16.4 11 24.2" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round"/>
<circle cx="10.1" cy="24.4" r="1.7" stroke="${stroke}" stroke-width="1.4"/>
<circle cx="21.9" cy="24.4" r="1.7" stroke="${stroke}" stroke-width="1.4"/>
</svg>`
}

export function brandIconDataUri(size: number, stroke?: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(brandIconSvg(size, stroke)).toString('base64')}`
}

export const BRAND_BACKGROUND = '#070d14'
