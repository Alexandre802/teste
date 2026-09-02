import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { z } from "zod";

/**
 * Peça de avaliações da Comida Caseira da Márcia Costa.
 *
 * Regra do Remotion que vale para tudo aqui: cada valor animado sai de
 * `useCurrentFrame()`. Nada de setTimeout, transition do CSS ou Framer Motion —
 * o render não roda em tempo real, ele salta de frame em frame, e qualquer
 * relógio próprio sairia congelado no vídeo.
 */

export const avaliacaoSchema = z.object({
  nome: z.string(),
  nota: z.number().min(1).max(5),
  texto: z.string(),
  origem: z.string(),
});

export const avaliacoesReelSchema = z.object({
  avaliacoes: z.array(avaliacaoSchema),
  /** Quantos frames cada depoimento fica na tela. */
  framesPorCartao: z.number().default(110),
});

export type AvaliacoesReelProps = z.infer<typeof avaliacoesReelSchema>;

const LARANJA = "#e75c16";
const LARANJA_CLARO = "#f0742e";
const TINTA = "#1b1512";
const CREME = "#fdf0e7";

export const AvaliacoesReel: React.FC<AvaliacoesReelProps> = ({
  avaliacoes,
  framesPorCartao = 110,
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: CREME, fontFamily: "system-ui, sans-serif" }}>
      <FundoQuente />

      {avaliacoes.length === 0 ? (
        <CartaoDaMarca />
      ) : (
        avaliacoes.map((avaliacao, indice) => (
          <Sequence
            key={`${avaliacao.nome}-${indice}`}
            from={indice * framesPorCartao}
            durationInFrames={framesPorCartao}
          >
            <CartaoAvaliacao {...avaliacao} duracao={framesPorCartao} />
          </Sequence>
        ))
      )}
    </AbsoluteFill>
  );
};

/** Brilho que atravessa o fundo devagar, só com transform e opacidade. */
const FundoQuente: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width } = useVideoConfig();

  const deslocamento = interpolate(
    frame,
    [0, durationInFrames],
    [-width * 0.3, width * 0.3],
  );

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          inset: "-20%",
          transform: `translateX(${deslocamento}px)`,
          background: `radial-gradient(circle at 30% 40%, ${LARANJA_CLARO}22, transparent 55%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Cinco estrelas que preenchem uma a uma, conforme a nota. */
const Estrelas: React.FC<{ nota: number; atraso: number }> = ({ nota, atraso }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ display: "flex", gap: 10 }}>
      {[0, 1, 2, 3, 4].map((indice) => {
        const preenchida = indice < Math.round(nota);
        const escala = spring({
          frame: frame - atraso - indice * 4,
          fps,
          config: { damping: 12, stiffness: 140 },
        });
        return (
          <svg
            key={indice}
            width={44}
            height={44}
            viewBox="0 0 24 24"
            style={{ transform: `scale(${preenchida ? escala : 1})` }}
            aria-hidden="true"
          >
            <path
              d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"
              fill={preenchida ? LARANJA : "transparent"}
              stroke={LARANJA}
              strokeWidth={1.6}
              strokeLinejoin="round"
            />
          </svg>
        );
      })}
    </div>
  );
};

const CartaoAvaliacao: React.FC<
  AvaliacoesReelProps["avaliacoes"][number] & { duracao: number }
> = ({ nome, nota, texto, origem, duracao }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrada = spring({ frame, fps, config: { damping: 18, stiffness: 90 } });
  // Entra por baixo e sai por cima, sempre em função do frame da sequência.
  const saida = interpolate(frame, [duracao - 14, duracao], [0, -40], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacidade = interpolate(
    frame,
    [0, 10, duracao - 14, duracao],
    [0.55, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: 90,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1180,
          backgroundColor: "#ffffff",
          borderRadius: 44,
          padding: 72,
          boxShadow: "0 30px 80px -40px rgba(27,21,18,0.35)",
          opacity: opacidade,
          transform: `translateY(${(1 - entrada) * 60 + saida}px)`,
        }}
      >
        <Estrelas nota={nota} atraso={6} />

        <p
          style={{
            marginTop: 34,
            fontSize: 46,
            lineHeight: 1.35,
            color: TINTA,
            fontWeight: 600,
          }}
        >
          “{texto}”
        </p>

        <p style={{ marginTop: 34, fontSize: 32, fontWeight: 800, color: LARANJA }}>
          {nome}
        </p>
        <p style={{ marginTop: 4, fontSize: 26, color: "#857c76" }}>
          avaliação publicada no {origem}
        </p>
      </div>
    </AbsoluteFill>
  );
};

/**
 * O que aparece enquanto a casa ainda não tem avaliação publicada.
 * Mostra a marca e um convite — nunca um depoimento inventado.
 */
const CartaoDaMarca: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrada = spring({ frame, fps, config: { damping: 20, stiffness: 80 } });
  const respiro = interpolate(frame % 120, [0, 60, 120], [1, 1.03, 1]);

  // A opacidade não parte de zero: o frame 0 é o que o Player pinta antes de
  // começar a tocar, e um primeiro quadro em branco parece tela quebrada.
  const opacidade = interpolate(entrada, [0, 1], [0.55, 1]);

  return (
    <AbsoluteFill
      style={{ justifyContent: "center", alignItems: "center", padding: 90 }}
    >
      <div
        style={{
          textAlign: "center",
          opacity: opacidade,
          transform: `translateY(${(1 - entrada) * 40}px)`,
        }}
      >
        {/* O arquivo do logo tem fundo branco quadrado; o recorte circular
            faz ele assentar no creme sem virar um quadrado solto. */}
        <Img
          src={staticFile("images/brand/logo.png")}
          style={{
            width: 260,
            height: 260,
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            transform: `scale(${respiro})`,
          }}
        />
        <p
          style={{
            marginTop: 40,
            fontSize: 62,
            fontWeight: 800,
            color: TINTA,
            letterSpacing: "-0.02em",
          }}
        >
          Comida caseira de verdade
        </p>
        <p style={{ marginTop: 20, fontSize: 36, color: "#57504b" }}>
          Feita todos os dias, com ingredientes fresquinhos
        </p>
      </div>
    </AbsoluteFill>
  );
};
