import { ADVOGADO_GRAVATA_A } from '@/remotion/advogadoGravataDataA';
import { ADVOGADO_GRAVATA_B } from '@/remotion/advogadoGravataDataB';

export const dynamic = 'force-static';

export async function GET() {
  const bytes = Buffer.from(`${ADVOGADO_GRAVATA_A}${ADVOGADO_GRAVATA_B}`, 'base64');

  return new Response(bytes, {
    headers: {
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
