"use client";

import Image from "next/image";
import { useState } from "react";
import { UtensilsCrossed } from "lucide-react";

/**
 * Foto do produto com dois cuidados:
 *  - item sem fotografia propria (image null) cai no selo da marca, nunca na
 *    foto de outro item;
 *  - se o arquivo falhar ao carregar, o mesmo selo entra no lugar e a tela
 *    continua inteira.
 */
export function FotoProduto({
  src,
  alt,
  sizes,
  className = "",
  priority = false,
}: {
  src: string | null;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  const [falhou, setFalhou] = useState(false);

  if (!src || falhou) {
    return (
      <div
        className={`flex items-center justify-center bg-creme ${className}`}
        role="img"
        aria-label={`${alt} — foto em breve`}
      >
        <UtensilsCrossed
          className="h-8 w-8 text-laranja/70"
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      onError={() => setFalhou(true)}
      className={`object-cover ${className}`}
    />
  );
}
