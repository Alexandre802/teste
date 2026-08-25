import Image from 'next/image';
import { business } from '@/lib/business';

/**
 * Logo oficial da casa — o mesmo emblema circular usado no perfil da
 * lanchonete. Fica sobre um disco branco porque o vermelho do "FOOD HOUSE"
 * não tem contraste suficiente direto no laranja.
 */
export function Logo({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <Image
      src="/marca/logo-512.png"
      alt={`Logo da ${business.name}`}
      width={size}
      height={size}
      priority
      className={`shrink-0 rounded-full shadow-[0_4px_14px_-4px_rgba(90,32,5,0.6)] ${className}`}
    />
  );
}
