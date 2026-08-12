import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Camera, CameraMove } from '../components/Camera';
import { Cursor, CursorKey, cursorAt } from '../components/app/Cursor';
import { APP } from '../components/app/AppKit';
import {
  AgendaScreen,
  ConversasScreen,
  HomeScreen,
  InteressesScreen,
} from '../components/app/Screens';
import { Logo } from '../components/Logo';
import { Sfx } from '../components/Sfx';
import { COLORS, SHADOW } from '../theme';
import { EASE, float, iv, s, SPRING } from '../lib/anim';
import { useSceneFrame } from '../lib/timing';

/**
 * Take de demonstração do aplicativo (product walkthrough).
 *
 * Ocupa a primeira metade da janela que antes era só tipografia. O cursor
 * percorre o app, clica no menu inferior e a câmera acompanha, aproximando do
 * que importa em cada seção. As quatro telas foram remontadas em camadas a
 * partir das capturas de referência — layout, textos, cores e hierarquia
 * preservados, adaptados ao viewport vertical.
 */

/** O app vive num "device" centrado, com o fundo da marca em volta. */
const DEV = { left: 40, top: 262, width: 1000, height: 1400, radius: 46 };
const NAV_H = 168;

/** Centro de cada item do menu inferior, em coordenadas do quadro. */
const navX = (i: number) => DEV.left + (DEV.width / 6) * (i + 0.5);
const NAV_Y = DEV.top + DEV.height - NAV_H / 2 - 14;

/** Frame em que cada tela assume (frames de projeto). */
const SCREEN_AT = [0, 30, 54, 80];
const SCREENS = [HomeScreen, ConversasScreen, InteressesScreen, AgendaScreen];
const CLICKS = [30, 54, 80];

/** Percurso do cursor, em coordenadas do quadro. */
const CURSOR: CursorKey[] = [
  { at: 0, x: 1020, y: 1800 },
  { at: 9, x: 313, y: 817 },      // "8 Novos interessados"
  { at: 17, x: 767, y: 817 },     // "37 Conversas abertas"
  { at: 24, x: 340, y: 1017 },    // "Interessados recentes"
  { at: 30, x: navX(1), y: NAV_Y },
  { at: 40, x: 430, y: 687 },     // campo de busca
  { at: 47, x: 330, y: 799 },     // abas
  { at: 51, x: 440, y: 927 },    // lista de conversas
  { at: 54, x: navX(2), y: NAV_Y },
  { at: 64, x: 350, y: 757 },     // tag "agendamento" (após a rolagem)
  { at: 73, x: 540, y: 986 },     // botão "Ver conversa"
  { at: 77, x: 660, y: 1056 },    // "Convertido"
  { at: 80, x: navX(3), y: NAV_Y },
  { at: 91, x: 880, y: 672 },     // status "Confirmado"
  { at: 101, x: 330, y: 782 },    // serviço e data
  { at: 110, x: 300, y: 857 },    // "Abrir conversa"
  { at: 122, x: 860, y: 1420 },
  { at: 134, x: 1000, y: 1760 },
];

/**
 * Câmera. O centro vertical precisa ficar em [960/s, 1920-960/s]; fora disso o
 * quadro não é coberto e o `Camera` limitaria o alvo de qualquer forma.
 */
const CAM: CameraMove[] = [
  { at: 0, scale: 1.0, y: 960 },
  { at: 10, scale: 1.24, y: 820 },
  { at: 24, scale: 1.22, y: 1000 },
  { at: 32, scale: 1.14, y: 1000 },
  { at: 42, scale: 1.24, y: 790 },
  { at: 50, scale: 1.2, y: 920 },
  { at: 56, scale: 1.14, y: 1000 },
  { at: 65, scale: 1.24, y: 790 },
  { at: 75, scale: 1.24, y: 1000 },
  { at: 82, scale: 1.14, y: 1000 },
  { at: 92, scale: 1.24, y: 790 },
  { at: 106, scale: 1.2, y: 900 },
  { at: 120, scale: 1.06, y: 960 },
  { at: 134, scale: 1.0, y: 960 },
];

const TRANSITION = 7;

export const SceneApp: React.FC = () => {
  const frame = useSceneFrame();

  let idx = 0;
  while (idx < SCREEN_AT.length - 1 && frame >= SCREEN_AT[idx + 1]) idx += 1;
  const at = SCREEN_AT[idx];
  const swap = iv(frame, [at, at + TRANSITION], [0, 1], EASE.out);

  const Current = SCREENS[idx];
  const Previous = idx > 0 ? SCREENS[idx - 1] : null;

  const cur = cursorAt(frame, CURSOR);
  const navPress = CLICKS.includes(at) ? at : null;

  const deviceIn = s(frame, { config: SPRING.pop, durationInFrames: 16 });
  const drift = float(frame, 5, 150);

  const brand = s(frame, { delay: 106, config: SPRING.pop });
  const scrim = iv(frame, [104, 115], [0, 0.92]);

  return (
    <AbsoluteFill style={{ background: COLORS.pageBg, overflow: 'hidden' }}>
      {/* fundo da marca, para o take conversar com o resto do vídeo */}
      <div
        style={{
          position: 'absolute',
          left: 1040 - 150,
          top: 30 - 150,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: COLORS.primarySoft,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 20 - 170,
          top: 1880 - 170,
          width: 340,
          height: 340,
          borderRadius: '50%',
          background: COLORS.primary,
        }}
      />

      <Camera moves={CAM} drift={3}>
        {/* o aparelho */}
        <div
          style={{
            position: 'absolute',
            left: DEV.left,
            top: DEV.top,
            width: DEV.width,
            height: DEV.height,
            borderRadius: DEV.radius,
            background: APP.bg,
            overflow: 'hidden',
            boxShadow: SHADOW.sheet,
            transform: `translateY(${((1 - deviceIn) * 40 + drift).toFixed(2)}px) scale(${(0.965 + 0.035 * deviceIn).toFixed(4)})`,
            opacity: iv(frame, [0, 8], [0, 1]),
          }}
        >
          {/* tela que sai */}
          {Previous && swap < 1 ? (
            <AbsoluteFill
              style={{
                opacity: 1 - swap,
                transform: `scale(${(1 - 0.03 * swap).toFixed(4)})`,
              }}
            >
              <Previous base={SCREEN_AT[idx - 1]} navPress={null} />
            </AbsoluteFill>
          ) : null}

          {/* tela que entra */}
          <AbsoluteFill
            style={{
              opacity: idx === 0 ? 1 : swap,
              transform: `translate3d(0, ${((1 - swap) * 44).toFixed(2)}px, 0)`,
            }}
          >
            <Current base={at} navPress={navPress} />
          </AbsoluteFill>
        </div>

        <Cursor x={cur.x} y={cur.y} frame={frame} clicks={CLICKS} appearAt={0} />
      </Camera>

      {/* Fecho de marca */}
      <AbsoluteFill style={{ background: '#FFFFFF', opacity: scrim, pointerEvents: 'none' }} />
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          opacity: iv(frame, [105, 113], [0, 1]),
          transform: `scale(${(0.84 + 0.16 * brand).toFixed(4)})`,
        }}
      >
        <Logo size={124} delay={106} fontSize={104} gap={28} />
      </AbsoluteFill>

      {/* --------------------------------------------------------- efeitos */}
      <Sfx name="whoosh_short" at={0} gain={0.45} />
      <Sfx name="soft_pop" at={10} gain={0.7} />
      <Sfx name="tick" at={18} gain={0.5} />
      <Sfx name="tick" at={24} gain={0.5} />
      <Sfx name="soft_pop" at={26} gain={0.6} />

      <Sfx name="digital_click" at={30} gain={0.75} />
      <Sfx name="tap" at={30} gain={0.5} />
      <Sfx name="whoosh_short" at={32} gain={0.5} />
      <Sfx name="soft_pop" at={41} gain={0.6} />
      <Sfx name="tick" at={47} gain={0.5} />

      <Sfx name="digital_click" at={54} gain={0.75} />
      <Sfx name="tap" at={54} gain={0.5} />
      <Sfx name="whoosh_short" at={56} gain={0.5} />
      <Sfx name="bubble_pop" at={65} gain={0.5} />
      <Sfx name="pop_ui" at={74} gain={0.5} />

      <Sfx name="digital_click" at={80} gain={0.75} />
      <Sfx name="tap" at={80} gain={0.5} />
      <Sfx name="whoosh_short" at={82} gain={0.5} />
      <Sfx name="notification_pop" at={92} gain={0.5} />
      <Sfx name="soft_pop" at={102} gain={0.5} />
      <Sfx name="tick" at={110} gain={0.45} />

      <Sfx name="whoosh_transition" at={104} gain={0.4} />
      <Sfx name="logo_sting" at={106} gain={0.4} />
      <Sfx name="sparkle" at={110} gain={0.4} />
    </AbsoluteFill>
  );
};
