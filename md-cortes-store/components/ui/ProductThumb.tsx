import Image from "next/image";
import { Shirt } from "lucide-react";

/**
 * Foto do produto. Peça sem foto confirmada cai no monograma da marca —
 * nunca na foto de outro item.
 */
export function ProductThumb({
  src,
  alt,
  size = 72,
  rounded = "rounded-suave",
}: {
  src: string | null;
  alt: string;
  size?: number;
  rounded?: string;
}) {
  if (!src) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center border border-borda bg-areia text-ouro-claro ${rounded}`}
        style={{ width: size, height: size }}
        aria-hidden
      >
        <Shirt size={Math.round(size * 0.42)} strokeWidth={1.5} />
      </span>
    );
  }
  return (
    <span
      className={`relative block shrink-0 overflow-hidden border border-borda bg-areia ${rounded}`}
      style={{ width: size, height: size }}
    >
      <Image src={src} alt={alt} fill sizes={`${size}px`} className="object-cover" />
    </span>
  );
}

export function ColorDot({ hex, size = 14 }: { hex: string; size?: number }) {
  return (
    <span
      className="inline-block shrink-0 rounded-full border border-borda-forte"
      style={{ width: size, height: size, background: hex }}
      aria-hidden
    />
  );
}
