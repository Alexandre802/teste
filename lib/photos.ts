/**
 * Fotos de ambiente da casa.
 *
 * As URLs vêm do perfil do Google Maps da Michel Food House. Elas funcionam,
 * mas são links do Google e podem expirar sem aviso — o caminho recomendado é
 * baixar cada arquivo, colocar em /public/galeria/ e trocar o `src` pelo
 * caminho local. Enquanto forem remotas, o hostname precisa continuar
 * liberado em `next.config.ts` → images.remotePatterns.
 *
 * O sufixo `=w1600` pede a versão maior ao servidor do Google; trocar por
 * `=w800` reduz o peso se necessário.
 */

const G = 'https://lh3.googleusercontent.com/gps-cs-s';

export interface Photo {
  src: string;
  alt: string;
}

export const galleryPhotos: Photo[] = [
  {
    src: `${G}/AHRPTWnh356zOhsrvaccsDc9Du6Ht_UnhYDaDSQK50wU_Oy5m-gmhqsUMjoDzQxIh_GfhgvMtT_S62XdXxAPGFNTzFwpJgbmE18mGWUSM0FiYkj8UUBh2dNVd9S5VD71K7QvoEfWraID=w1600`,
    alt: 'Lanche da Michel Food House servido na casa, em Jacareí',
  },
  {
    src: `${G}/AHRPTWlfRb-WmdQuijooUJoAxTbT_L08s7NtLkjELwqIXICL-KZJfOby141_oaWv6BrtMqvNN6xWg25qJSoYqmYMglxUfppxsP4qBiwF3kpH6uURKC6s1FmBFoqyI2Taoshj6bolk3NR=w1200`,
    alt: 'Lanches da Michel Food House, lanchonete no Bandeira Branca I',
  },
  {
    src: `${G}/AHRPTWk2SNhojnHVNZ3RsAb7Nl4rQFNOGS9Ivyw48qtOrc-3WWX9qMEW4s5U5jj_fH9m3nx823p6O1sCnd6Oq5mcyQRQGBrghx_MqEen5eMoDssg_w0Vt2_PxjDlI7axa7l23GSAk_brYQ=w1200`,
    alt: 'Pedido montado na Michel Food House, lanches em Jacareí',
  },
  {
    src: `${G}/AHRPTWncAKxVHwvHQjvigCyFyS58xxgQuXw0mXs3FJXr6-snaPiWRp3tzsyGWtjmRXATipJ8-gtzMk15zr77fQaPsKSGEcprLMvtO3cS-X4z6jd7ww6svdpR_7dpnJCqrBaUL-MMq2A=w1200`,
    alt: 'Lanche caprichado da Michel Food House pronto para entrega',
  },
  {
    src: `${G}/AHRPTWn2iRA3bxvoniy87hFjqRbTVPkiL1O208-vFtsaymma80PjE20_G-bag5Mks-DYtL2dyFiwpjntmYzti0p5qXSCgpIM-dKyp5tQzqjPDrw4qmjb6xqOCIU3Kx2DOMExfIeA7ESR=w1200`,
    alt: 'Bacon Cheddar, destaque citado nas avaliações da Michel Food House',
  },
];
