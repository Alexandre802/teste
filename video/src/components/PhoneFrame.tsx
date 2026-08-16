/**
 * Aparelho: moldura de titânio, bisel, ilha dinâmica, reflexos de borda
 * e brilho roxo por baixo (como na referência 430F957D).
 * O conteúdo da tela entra por `children`.
 */
import React from "react";

type Props = {
  width: number;
  children: React.ReactNode;
  /** Reflexo que percorre o vidro, 0→1. */
  glass?: number;
  glow?: number;
  style?: React.CSSProperties;
};

export const PhoneFrame: React.FC<Props> = ({
  width,
  children,
  glass = 0,
  glow = 0.6,
  style,
}) => {
  const height = width * 2.05;
  const bezel = width * 0.028;
  const radius = width * 0.135;

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        borderRadius: radius,
        padding: bezel,
        boxSizing: "border-box",
        background:
          "linear-gradient(150deg, #C9C4D6 0%, #6E6880 18%, #2A2635 42%, #6E6880 70%, #B9B4C8 100%)",
        boxShadow: [
          `0 ${width * 0.07}px ${width * 0.16}px rgba(0,0,0,0.62)`,
          `0 ${width * 0.02}px ${width * 0.05}px rgba(0,0,0,0.5)`,
          glow ? `0 ${width * 0.06}px ${width * 0.3}px rgba(140,52,220,${0.55 * glow})` : "",
          "inset 0 0 0 1px rgba(255,255,255,0.28)",
        ]
          .filter(Boolean)
          .join(", "),
        ...style,
      }}
    >
      {/* tela */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: radius - bezel,
          overflow: "hidden",
          background: "#000",
        }}
      >
        {children}

        {/* ilha dinâmica */}
        <div
          style={{
            position: "absolute",
            top: width * 0.028,
            left: "50%",
            transform: "translateX(-50%)",
            width: width * 0.26,
            height: width * 0.075,
            borderRadius: width * 0.05,
            background: "#000",
            zIndex: 10,
          }}
        />

        {/* reflexo do vidro */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(104deg, rgba(255,255,255,0) 38%, rgba(255,255,255,0.16) 48%, rgba(255,255,255,0.03) 56%, rgba(255,255,255,0) 64%)",
            transform: `translateX(${(glass - 0.5) * width * 2.4}px)`,
            opacity: glass > 0 && glass < 1 ? 1 : 0,
            pointerEvents: "none",
            zIndex: 11,
          }}
        />

        {/* barra de gesto */}
        <div
          style={{
            position: "absolute",
            bottom: width * 0.022,
            left: "50%",
            transform: "translateX(-50%)",
            width: width * 0.34,
            height: width * 0.011,
            borderRadius: 99,
            background: "rgba(0,0,0,0.32)",
            zIndex: 10,
          }}
        />
      </div>

      {/* botões laterais */}
      <div
        style={{
          position: "absolute",
          left: -width * 0.008,
          top: height * 0.19,
          width: width * 0.008,
          height: height * 0.045,
          borderRadius: 3,
          background: "linear-gradient(90deg,#8A8496,#4A4557)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -width * 0.008,
          top: height * 0.26,
          width: width * 0.008,
          height: height * 0.075,
          borderRadius: 3,
          background: "linear-gradient(90deg,#8A8496,#4A4557)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -width * 0.008,
          top: height * 0.24,
          width: width * 0.008,
          height: height * 0.09,
          borderRadius: 3,
          background: "linear-gradient(270deg,#8A8496,#4A4557)",
        }}
      />
    </div>
  );
};
