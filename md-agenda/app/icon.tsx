import { ImageResponse } from 'next/og'
import { BRAND_BACKGROUND, brandIconDataUri } from '@/lib/brand-icon'

export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

export default function Icon() {
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
        <img src={brandIconDataUri(52)} width={52} height={52} alt="" />
      </div>
    ),
    size,
  )
}
