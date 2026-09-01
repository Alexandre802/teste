"use client";

/** Substitui `next/image`: sem otimização de servidor, só uma <img>. */
import type { CSSProperties } from "react";

interface Props {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
  "aria-hidden"?: boolean | "true" | "false";
}

export default function Image({ src, alt, width, height, fill, priority: _p, sizes: _s, className, style, ...resto }: Props) {
  const estilo: CSSProperties = fill
    ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style }
    : { ...style };
  return (
    // eslint-disable-next-line @next/next/no-img-element -- é o próprio substituto de next/image
    <img
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={className}
      style={estilo}
      loading="lazy"
      decoding="async"
      {...resto}
    />
  );
}
