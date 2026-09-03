import { beat } from './beat';

export type SceneId = 's1' | 's2' | 's3' | 's4' | 's5' | 's6' | 's7';

export type SceneDef = {
  id: SceneId;
  from: number;
  duration: number;
};

/** 30s a 30fps = 900 quadros = 60 tempos de 0,5s. */
export const TOTAL_FRAMES = 900;

/**
 * Os tempos saem das marcações da copy: ESCALA em 8–12s, A GRANDE PROMESSA
 * em 16–20s e a ASSINATURA em 27–30s. O resto se encaixa entre elas, sempre
 * em múltiplos da grade de 15 quadros.
 */
export const scenes: SceneDef[] = [
  { id: 's1', from: beat(0),  duration: beat(10) }, //  0–5s   3 marketplaces girando + notificações
  { id: 's2', from: beat(10), duration: beat(6)  }, //  5–8s   os pedidos se afastam: caminhões e CD
  { id: 's3', from: beat(16), duration: beat(8)  }, //  8–12s  ESCALA: +100.000 volumes
  { id: 's4', from: beat(24), duration: beat(8)  }, // 12–16s  rastreio: quem vende mais não pode esperar
  { id: 's5', from: beat(32), duration: beat(8)  }, // 16–20s  A GRANDE PROMESSA: Goiânia → São Paulo
  { id: 's6', from: beat(40), duration: beat(14) }, // 20–27s  confiança: caixa protegida, status, estrelas
  { id: 's7', from: beat(54), duration: beat(6)  }, // 27–30s  ASSINATURA sem final, emenda no início
];
