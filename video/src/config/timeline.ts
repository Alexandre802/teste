import { beat } from './beat';

export type SceneId =
  | 's1' | 's2' | 's3' | 's4' | 's5' | 's6' | 's7';

export type SceneDef = {
  id: SceneId;
  /** Início em quadros, sempre múltiplo da grade de 15. */
  from: number;
  /** Duração em quadros. */
  duration: number;
};

/** 30s a 30fps = 900 quadros = 60 tempos de 0,5s. */
export const TOTAL_FRAMES = 900;

export const scenes: SceneDef[] = [
  { id: 's1', from: beat(0),  duration: beat(8)  }, //  0–4s   VOCÊ VENDE (3 celulares)
  { id: 's2', from: beat(8),  duration: beat(8)  }, //  4–8s   operação: CD e frota
  { id: 's3', from: beat(16), duration: beat(8)  }, //  8–12s  escala: +100.000
  { id: 's4', from: beat(24), duration: beat(8)  }, // 12–16s  urgência: rastreio
  { id: 's5', from: beat(32), duration: beat(8)  }, // 16–20s  promessa: Goiânia→SP
  { id: 's6', from: beat(40), duration: beat(12) }, // 20–26s  confiança: caixa protegida
  { id: 's7', from: beat(52), duration: beat(8)  }, // 26–30s  assinatura, emenda no início
];
