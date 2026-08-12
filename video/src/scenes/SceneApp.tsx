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
const SCREEN_AT = [0, 54, 102, 152];
const SCREENS = [HomeScreen, ConversasScreen, InteressesScreen, AgendaScreen];
const CLICKS = [54, 102, 152];

/**
 * Percurso do cursor, em coordenadas do quadro.
 *
 * O ritmo é deliberadamente lento: o cursor chega ao alvo, PARA nele por uns
 * 10 frames e só então segue. É a pausa que dá tempo de ler o que ele aponta.
 */
const CURSOR: CursorKey[] = [
  { at: 0, x: 1020, y: 1800 },
  { at: 14, x: 313, y: 817 },     // "8 Novos interessados"
  { at: 26, x: 313, y: 817 },
  { at: 34, x: 767, y: 817 },     // "37 Conversas abertas"
  { at: 44, x: 767, y: 817 },
  { at: 50, x: 340, y: 1017 },    // "Interessados recentes"
  { at: 54, x: navX(1), y: NAV_Y },

  { at: 68, x: 430, y: 687 },     // campo de busca
  { at: 78, x: 430, y: 687 },
  { at: 86, x: 330, y: 799 },     // abas
  { at: 94, x: 440, y: 927 },     // lista de conversas
  { at: 102, x: navX(2), y: NAV_Y },

  { at: 120, x: 350, y: 757 },    // tag "agendamento"
  { at: 130, x: 350, y: 757 },
  { at: 138, x: 540, y: 986 },    // botão "Ver conversa"
  { at: 146, x: 660, y: 1056 },   // "Convertido"
  { at: 152, x: navX(3), y: NAV_Y },

  { at: 168, x: 880, y: 672 },    // status "Confirmado"
  { at: 178, x: 880, y: 672 },
  { at: 186, x: 330, y: 782 },    // serviço e data
  { at: 196, x: 300, y: 857 },    // "Abrir conversa"
  { at: 206, x: 860, y: 1420 },
  { at: 217, x: 1010, y: 1780 },
];

/**
 * Câmera. O centro vertical precisa ficar em [960/s, 1920-960/s]; fora disso o
 * quadro não é coberto e o `Camera` limitaria o alvo de qualquer forma.
 */
const CAM: CameraMove[] = [
  { at: 0, scale: 1.0, y: 960 },
  { at: 18, scale: 1.24, y: 820 },
  { at: 46, scale: 1.22, y: 1000 },
  { at: 56, scale: 1.14, y: 1000 },

  { at: 72, scale: 1.24, y: 790 },
  { at: 94, scale: 1.2, y: 940 },
  { at: 104, scale: 1.14, y: 1000 },

  { at: 122, scale: 1.24, y: 790 },
  { at: 140, scale: 1.24, y: 1000 },
  { at: 154, scale: 1.14, y: 1000 },

  { at: 170, scale: 1.24, y: 790 },
  { at: 192, scale: 1.2, y: 900 },
  { at: 204, scale: 1.06, y: 960 },
  { at: 217, scale: 1.0, y: 960 },
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

  const brand = s(frame, { delay: 182, config: SPRING.pop });
  const scrim = iv(frame, [180, 192], [0, 0.92]);

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
          opacity: iv(frame, [181, 190], [0, 1]),
          transform: `scale(${(0.84 + 0.16 * brand).toFixed(4)})`,
        }}
      >
        <Logo size={124} delay={182} fontSize={104} gap={28} />
      </AbsoluteFill>

      {/* --------------------------------------------------------- efeitos */}
      <Sfx name="whoosh_short" at={0} gain={0.45} />
      <Sfx name="soft_pop" at={16} gain={0.7} />
      <Sfx name="tick" at={26} gain={0.5} />
      <Sfx name="tick" at={38} gain={0.5} />
      <Sfx name="soft_pop" at={50} gain={0.6} />

      <Sfx name="digital_click" at={54} gain={0.75} />
      <Sfx name="tap" at={54} gain={0.5} />
      <Sfx name="whoosh_short" at={57} gain={0.5} />
      <Sfx name="soft_pop" at={70} gain={0.6} />
      <Sfx name="tick" at={86} gain={0.5} />
      <Sfx name="soft_pop" at={94} gain={0.45} />

      <Sfx name="digital_click" at={102} gain={0.75} />
      <Sfx name="tap" at={102} gain={0.5} />
      <Sfx name="whoosh_short" at={105} gain={0.5} />
      <Sfx name="bubble_pop" at={122} gain={0.5} />
      <Sfx name="pop_ui" at={138} gain={0.5} />
      <Sfx name="tick" at={146} gain={0.45} />

      <Sfx name="digital_click" at={152} gain={0.75} />
      <Sfx name="tap" at={152} gain={0.5} />
      <Sfx name="whoosh_short" at={155} gain={0.5} />
      <Sfx name="notification_pop" at={168} gain={0.5} />
      <Sfx name="soft_pop" at={186} gain={0.5} />
      <Sfx name="tick" at={196} gain={0.45} />

      <Sfx name="whoosh_transition" at={180} gain={0.4} />
      <Sfx name="logo_sting" at={182} gain={0.45} />
      <Sfx name="sparkle" at={186} gain={0.4} />
    </AbsoluteFill>
  );
};
