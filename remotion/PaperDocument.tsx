import React, { useMemo } from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { BEAT } from './constants';
import { Signature } from './Signature';
import { PenProp } from './PenProp';
import {
  SIGNATURE_VIEWBOX,
  sampleSignature,
  signatureLength,
} from './signaturePath';

/**
 * O documento.
 *
 * Construído em HTML/SVG dentro da composição, não como imagem de texto: é o
 * que mantém a tipografia nítida em qualquer escala e deixa o conteúdo
 * editável por quem for personalizar a peça.
 *
 * `compact` é o modo retrato. No celular a composição 16:9 é recortada nas
 * laterais e ampliada — sem isso o corpo do texto cairia para ~6px de tela.
 * Nesse modo o documento fica estreito e alto, para caber na coluna central
 * que continua visível.
 */
export const PaperDocument: React.FC<{ compact: boolean }> = ({ compact }) => {
  const frame = useCurrentFrame();

  const LARGURA = compact ? 452 : 700;
  const ALTURA = compact ? 900 : 960;

  // sobe de dentro da pasta
  const subida = interpolate(frame, [BEAT.papel.from, BEAT.papel.to], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // câmera fecha no documento
  const aproximacao = interpolate(
    frame,
    [BEAT.aproximacao.from, BEAT.aproximacao.to],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // nos últimos frames o documento recua um pouco: sem isso a frase de
  // fecho cairia sobre o papel branco e sumiria
  const recuo = interpolate(frame, [BEAT.final.from - 4, BEAT.final.to], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const escala =
    (interpolate(subida, [0, 1], [0.3, 0.46]) +
      interpolate(aproximacao, [0, 1], [0, compact ? 0.56 : 0.54])) *
    (1 - recuo * 0.12);
  const y =
    interpolate(subida, [0, 1], [716, 548]) +
    interpolate(aproximacao, [0, 1], [0, -8]) -
    recuo * 34;
  const inclinacao = interpolate(subida, [0, 1], [-4.5, -1.2]) * (1 - aproximacao);

  // assinatura: mesma fração alimenta o traço e a posição da ponta
  const progressoAssinatura = interpolate(
    frame,
    [BEAT.assinatura.from, BEAT.assinatura.to],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const entradaCaneta = interpolate(
    frame,
    [BEAT.caneta.from, BEAT.caneta.to],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  // a ponta encosta no papel no fim da entrada e levanta ao terminar
  const apoio = interpolate(
    frame,
    [BEAT.caneta.to - 8, BEAT.caneta.to, BEAT.assinatura.to, BEAT.assinatura.to + 4],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  // levanta e sai de quadro depois de assinar
  const saidaCaneta = interpolate(
    frame,
    [BEAT.assinatura.to, BEAT.assinatura.to + 4],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  const amostras = useMemo(() => sampleSignature(), []);
  const comprimento = useMemo(() => signatureLength(), []);
  const indice = Math.min(
    amostras.length - 1,
    Math.max(0, Math.round(progressoAssinatura * (amostras.length - 1))),
  );
  const ponto = amostras[indice] ?? { x: 26, y: 116, angle: -60 };

  if (subida <= 0.001) return null;

  const t = compact
    ? { marca: 21, sub: 8.5, rotulo: 9.5, titulo: 26, corpo: 13.5, nota: 11 }
    : { marca: 27, sub: 10.5, rotulo: 11, titulo: 33, corpo: 16, nota: 13 };

  return (
    <div
      style={{
        position: 'absolute',
        left: 960,
        top: y,
        width: LARGURA,
        height: ALTURA,
        marginLeft: -LARGURA / 2,
        marginTop: -ALTURA / 2,
        transform: `scale(${escala}) rotate(${inclinacao}deg)`,
        transformOrigin: '50% 50%',
        background: 'linear-gradient(178deg, #fbfaf7 0%, #f1eee7 100%)',
        boxShadow: `0 ${34 * escala}px ${92 * escala}px rgba(0,0,0,0.62)`,
        color: '#161d24',
        display: 'flex',
        flexDirection: 'column',
        padding: compact ? '46px 40px 38px' : '62px 58px 48px',
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        willChange: 'transform',
      }}
    >
      {/* timbre */}
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: t.marca,
            fontWeight: 400,
            letterSpacing: '0.2em',
          }}
        >
          ALMEIDA &amp; COSTA
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: t.sub,
            letterSpacing: '0.26em',
            color: '#6c757d',
          }}
        >
          ADVOCACIA E CONSULTORIA JURÍDICA
        </div>
      </div>

      <div
        style={{
          height: 1,
          margin: compact ? '26px 0 24px' : '34px 0 30px',
          background: 'rgba(184,155,97,0.55)',
        }}
      />

      <div
        style={{
          fontSize: t.rotulo,
          letterSpacing: '0.24em',
          color: '#b89b61',
          fontWeight: 600,
        }}
      >
        ANÁLISE JURÍDICA
      </div>

      <div
        style={{
          marginTop: 14,
          fontFamily: '"Cormorant Garamond", Georgia, serif',
          fontSize: t.titulo,
          fontWeight: 400,
          lineHeight: 1.18,
          letterSpacing: '-0.01em',
        }}
      >
        Seu caso merece uma análise cuidadosa.
      </div>

      <div
        style={{
          marginTop: compact ? 22 : 28,
          display: 'grid',
          gap: compact ? 11 : 14,
          fontSize: t.corpo,
          lineHeight: 1.6,
          color: '#3c464e',
        }}
      >
        <p style={{ margin: 0 }}>
          Análise das circunstâncias e dos documentos apresentados.
        </p>
        <p style={{ margin: 0 }}>
          Orientação sobre os caminhos possíveis e seus efeitos.
        </p>
        <p style={{ margin: 0 }}>Acompanhamento de cada etapa seguinte.</p>
      </div>

      <div
        style={{
          marginTop: compact ? 20 : 26,
          fontSize: t.corpo,
          lineHeight: 1.6,
          color: '#161d24',
        }}
      >
        Entre em contato para uma orientação jurídica.
      </div>

      {/* área de assinatura — o traço e a caneta dividem o mesmo viewBox */}
      <div style={{ marginTop: 'auto' }}>
        {/*
          Estreita de propósito: a caneta é desenhada para fora do viewBox
          (o corpo sobe para a direita a partir da ponta), e com a assinatura
          ocupando a largura toda ela furava a borda da folha. Sobrando margem
          à direita, a peça inteira cabe no papel.
        */}
        <svg
          viewBox={`0 0 ${SIGNATURE_VIEWBOX.width} ${SIGNATURE_VIEWBOX.height}`}
          width={compact ? '70%' : '76%'}
          style={{ overflow: 'visible', display: 'block' }}
          aria-hidden
        >
          <Signature progresso={progressoAssinatura} comprimento={comprimento} />
          {entradaCaneta > 0.001 && saidaCaneta < 0.999 ? (
            <PenProp
              ponto={ponto}
              entrada={entradaCaneta}
              apoio={apoio}
              saida={saidaCaneta}
              escala={compact ? 0.44 : 0.58}
            />
          ) : null}
        </svg>

        <div style={{ height: 1, background: 'rgba(22,29,36,0.35)' }} />
        <div
          style={{
            marginTop: 10,
            fontSize: t.nota,
            letterSpacing: '0.08em',
            color: '#6c757d',
          }}
        >
          Almeida &amp; Costa — Advocacia e Consultoria Jurídica
        </div>
      </div>
    </div>
  );
};
