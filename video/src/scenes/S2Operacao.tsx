import React from 'react';
import { AbsoluteFill, staticFile, useCurrentFrame } from 'remotion';
import { Bg } from '../components/Bg';
import { VehicleSwiper } from '../components/Carousel';
import { Sub } from '../components/Type';
import { beat, fadeOut } from '../config/beat';
import { theme } from '../config/theme';

/**
 * 5–8s — Da copy: "Os pedidos se afastam e revelam caminhões e CD da Três
 * Estrelas 3D". A revelação vira um seletor: a frota passa de lado, um
 * veículo por vez.
 *
 * O fundo aqui é construído em código, não a arte de operação: rebaixada, ela
 * deixava a frase "VOCÊ VENDE" legível atrás dos cartões.
 */
export const S2Operacao: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const out = fadeOut(frame, duration, 0.6);

  const frota = [
    { src: staticFile('vehicles/scania_verde.png'), label: 'Carreta baú', sub: 'Frota própria' },
    { src: staticFile('vehicles/scania_vermelho.png'), label: 'Cavalo Scania', sub: 'Carga urgente' },
    { src: staticFile('vehicles/duas_operacoes.png'), label: 'Duas operações', sub: 'Transporte e turismo' },
    { src: staticFile('vehicles/scania_verde.png'), label: 'Carreta baú', sub: 'Frota própria' },
  ];

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Bg duration={duration} drift={26} trails={34} glowAt={[50, 52]} />

      <div style={{ position: 'absolute', top: 130, left: 0, right: 0, zIndex: 10 }}>
        <VehicleSwiper items={frota} start={0} width={780} height={940} gap={70} everyBeats={2} />
      </div>

      <div
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 210,
          display: 'flex', justifyContent: 'center', zIndex: 25,
        }}
      >
        <Sub start={beat(3)} align="center" size={44} color={theme.cyan}>
          Frota própria. Centro de distribuição. Operação diária.
        </Sub>
      </div>
    </AbsoluteFill>
  );
};
