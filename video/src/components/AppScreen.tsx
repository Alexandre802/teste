/**
 * Tela do app reconstruída como DOM (referência 430F957D).
 *
 * Cada bloco é uma camada própria: header, saldo, atalhos, cartões,
 * crédito, Pix e transferências. Isso permite rolar a tela, destacar
 * seções e animar botão por botão — o que uma captura de tela não faria.
 */
import React from "react";
import { COLORS } from "../config/theme";
import { BODY } from "../lib/fonts";
import {
  BarcodeIcon,
  CardIcon,
  ChevronIcon,
  DepositIcon,
  EyeIcon,
  HelpIcon,
  MailIcon,
  PixIcon,
  StatusBar,
  TransferIcon,
  UserIcon,
} from "./Icons";

export type Section = "conta" | "credito" | "pix";

type Props = {
  /** Largura útil da tela em px (o conteúdo escala a partir dela). */
  width: number;
  height: number;
  /** Deslocamento vertical do conteúdo rolável. */
  scrollY?: number;
  /** 0→1 por atalho, para o stagger de entrada dos botões. */
  actionReveal?: number[];
  /** Seção com realce (halo roxo). */
  highlight?: Section | null;
  /** 0→1 intensidade do realce. */
  highlightAmount?: number;
  /** Botão pressionado no momento (índice do atalho). */
  pressed?: number | null;
  balance?: string;
};

const ACTIONS = [
  { label: "Pix", Icon: PixIcon },
  { label: "Pagar", Icon: BarcodeIcon },
  { label: "Transferir", Icon: TransferIcon },
  { label: "Depositar", Icon: DepositIcon },
  { label: "Recarga", Icon: CardIcon },
];

export const AppScreen: React.FC<Props> = ({
  width,
  height,
  scrollY = 0,
  actionReveal,
  highlight = null,
  highlightAmount = 0,
  pressed = null,
  balance = "R$ 1.356,98",
}) => {
  const s = width / 390; // fator de escala a partir da largura de referência
  const halo = (section: Section): React.CSSProperties =>
    highlight === section && highlightAmount > 0
      ? {
          boxShadow: `0 0 ${28 * s * highlightAmount}px rgba(130,10,209,${
            0.55 * highlightAmount
          })`,
          background: `rgba(130,10,209,${0.05 * highlightAmount})`,
          borderRadius: 14 * s,
        }
      : {};

  return (
    <div
      style={{
        width,
        height,
        background: COLORS.white,
        overflow: "hidden",
        position: "relative",
        fontFamily: BODY,
      }}
    >
      {/* ── header roxo (fixo) ───────────────────────────────── */}
      <div
        style={{
          background: `linear-gradient(168deg, ${COLORS.brandLight} 0%, ${COLORS.brand} 55%, ${COLORS.brandDeep} 100%)`,
          paddingBottom: 22 * s,
          position: "relative",
          zIndex: 3,
        }}
      >
        <StatusBar width={width} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: `${14 * s}px ${22 * s}px 0`,
          }}
        >
          <div
            style={{
              width: 44 * s,
              height: 44 * s,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.22)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <UserIcon size={24 * s} />
          </div>
          <div style={{ display: "flex", gap: 20 * s }}>
            <EyeIcon size={25 * s} />
            <HelpIcon size={25 * s} />
            <MailIcon size={25 * s} />
          </div>
        </div>
        <div
          style={{
            padding: `${26 * s}px ${22 * s}px 0`,
            color: COLORS.white,
            fontSize: 22 * s,
            fontWeight: 500,
          }}
        >
          Olá, Gabriela
        </div>
      </div>

      {/* ── conteúdo rolável ─────────────────────────────────── */}
      <div style={{ transform: `translateY(${-scrollY}px)`, willChange: "transform" }}>
        {/* Conta + saldo */}
        <div style={{ padding: `${24 * s}px ${22 * s}px 0`, ...halo("conta") }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 23 * s, fontWeight: 700, color: COLORS.ink }}>Conta</span>
            <ChevronIcon size={20 * s} color={COLORS.inkSoft} />
          </div>
          <div
            style={{
              fontSize: 30 * s,
              fontWeight: 700,
              color: COLORS.ink,
              marginTop: 10 * s,
              letterSpacing: "-0.01em",
            }}
          >
            {balance}
          </div>
        </div>

        {/* atalhos circulares */}
        <div
          style={{
            display: "flex",
            gap: 14 * s,
            padding: `${22 * s}px 0 ${8 * s}px ${22 * s}px`,
          }}
        >
          {ACTIONS.map(({ label, Icon }, i) => {
            const r = actionReveal ? actionReveal[i] ?? 0 : 1;
            const isPressed = pressed === i;
            return (
              <div
                key={label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 9 * s,
                  opacity: r,
                  transform: `translateY(${(1 - r) * 22 * s}px) scale(${
                    (0.82 + r * 0.18) * (isPressed ? 0.9 : 1)
                  })`,
                  flex: "0 0 auto",
                }}
              >
                <div
                  style={{
                    width: 62 * s,
                    height: 62 * s,
                    borderRadius: "50%",
                    background: isPressed ? "#E2D4F5" : COLORS.offWhite,
                    display: "grid",
                    placeItems: "center",
                    transition: "none",
                    boxShadow: isPressed
                      ? `0 0 ${18 * s}px rgba(130,10,209,0.5)`
                      : "none",
                  }}
                >
                  <Icon size={26 * s} color={isPressed ? COLORS.brand : COLORS.ink} />
                </div>
                <span style={{ fontSize: 13.5 * s, color: COLORS.ink, fontWeight: 500 }}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* pílula Meus cartões */}
        <div style={{ padding: `${12 * s}px ${22 * s}px 0` }}>
          <div
            style={{
              background: COLORS.offWhite,
              borderRadius: 12 * s,
              padding: `${16 * s}px ${18 * s}px`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 * s }}>
              <CardIcon size={22 * s} />
              <span style={{ fontSize: 16 * s, color: COLORS.ink, fontWeight: 500 }}>
                Meus cartões
              </span>
            </div>
            <ChevronIcon size={18 * s} color={COLORS.inkSoft} />
          </div>
        </div>

        <div
          style={{
            height: 1,
            background: COLORS.divider,
            margin: `${24 * s}px 0`,
          }}
        />

        {/* Cartão de crédito */}
        <div style={{ padding: `0 ${22 * s}px`, ...halo("credito") }}>
          <CardIcon size={26 * s} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 14 * s,
            }}
          >
            <span style={{ fontSize: 23 * s, fontWeight: 700, color: COLORS.ink }}>
              Cartão de crédito
            </span>
            <ChevronIcon size={20 * s} color={COLORS.inkSoft} />
          </div>
          <div style={{ fontSize: 15 * s, color: COLORS.inkSoft, marginTop: 12 * s }}>
            Fatura atual
          </div>
          <div
            style={{
              fontSize: 28 * s,
              fontWeight: 700,
              color: COLORS.ink,
              marginTop: 4 * s,
            }}
          >
            R$ 1.094,80
          </div>
          <div style={{ fontSize: 14 * s, color: COLORS.inkSoft, marginTop: 8 * s }}>
            Limite disponível: R$ 730,00
          </div>
        </div>

        <div
          style={{
            height: 1,
            background: COLORS.divider,
            margin: `${24 * s}px 0`,
          }}
        />

        {/* Pix e transferências */}
        <div style={{ padding: `0 ${22 * s}px ${30 * s}px`, ...halo("pix") }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 * s }}>
            <PixIcon size={26 * s} color={COLORS.brand} />
            <span style={{ fontSize: 23 * s, fontWeight: 700, color: COLORS.ink }}>
              Área Pix
            </span>
          </div>
          <div style={{ fontSize: 15 * s, color: COLORS.inkSoft, marginTop: 10 * s }}>
            Transfira em segundos, 24 h por dia
          </div>

          {[
            { label: "Pix", value: "Chave cadastrada", Icon: PixIcon },
            { label: "Transferir", value: "Para qualquer banco", Icon: TransferIcon },
            { label: "Depositar", value: "Boleto ou Pix", Icon: DepositIcon },
          ].map(({ label, value, Icon }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14 * s,
                background: COLORS.offWhite,
                borderRadius: 12 * s,
                padding: `${14 * s}px ${16 * s}px`,
                marginTop: 12 * s,
              }}
            >
              <div
                style={{
                  width: 42 * s,
                  height: 42 * s,
                  borderRadius: "50%",
                  background: "#EDE3FA",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Icon size={20 * s} color={COLORS.brand} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16 * s, fontWeight: 600, color: COLORS.ink }}>
                  {label}
                </div>
                <div style={{ fontSize: 13 * s, color: COLORS.inkSoft }}>{value}</div>
              </div>
              <ChevronIcon size={16 * s} color={COLORS.inkSoft} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
