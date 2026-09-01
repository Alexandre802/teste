import { ImageResponse } from 'next/og'
import { BRAND_BACKGROUND, brandIconDataUri } from '@/lib/brand-icon'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
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
        <img src={brandIconDataUri(120)} width={120} height={120} alt="" />
      </div>
    ),
    size,
  )
}
