import { ImageResponse } from 'next/og'
import { BRAND_BACKGROUND, brandIconDataUri } from '@/lib/brand-icon'

/**
 * Ícones do PWA em PNG de verdade, gerados a partir do mesmo SVG da marca.
 *
 * As variantes `maskable-*` deixam a margem que o Android recorta — sem ela,
 * o launcher come as pontas do calendário.
 */
const VARIANTS: Record<string, { size: number; padding: number }> = {
  '192': { size: 192, padding: 0.18 },
  '512': { size: 512, padding: 0.18 },
  'maskable-192': { size: 192, padding: 0.3 },
  'maskable-512': { size: 512, padding: 0.3 },
}

export function generateStaticParams() {
  return Object.keys(VARIANTS).map((variant) => ({ variant }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ variant: string }> },
) {
  const { variant } = await params
  const config = VARIANTS[variant]
  if (!config) return new Response('Ícone não encontrado.', { status: 404 })

  const glyph = Math.round(config.size * (1 - config.padding * 2))

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: BRAND_BACKGROUND,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={brandIconDataUri(glyph)} width={glyph} height={glyph} alt="" />
      </div>
    ),
    {
      width: config.size,
      height: config.size,
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
    },
  )
}
