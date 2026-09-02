import Image from "next/image";
import Link from "next/link";

import { restaurant } from "@/data/restaurant";

/** Logo + nome da casa. Nome e caminho da marca vem de data/restaurant.ts. */
export function Marca({ compacta = false }: { compacta?: boolean }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5"
      aria-label={`${restaurant.name} — página inicial`}
    >
      <Image
        src={restaurant.logo}
        alt=""
        width={56}
        height={56}
        priority
        className={compacta ? "h-10 w-10" : "h-11 w-11 sm:h-12 sm:w-12"}
      />
      <span className="leading-none">
        <span className="fonte-titulo block text-[17px] font-extrabold text-laranja sm:text-xl">
          Comida Caseira
        </span>
        <span className="block text-[12px] font-medium text-tinta-media sm:text-[13px]">
          da Márcia Costa
        </span>
      </span>
    </Link>
  );
}
