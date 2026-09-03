import React from 'react';
import { useCurrentFrame } from 'remotion';

/**
 * Escala de tempo da cena.
 *
 * A coreografia de cada cena é escrita em "frames de projeto" (o ritmo em que
 * ela foi desenhada). Como a decupagem agora segue as pausas reais da
 * narração, um bloco pode receber mais ou menos tempo que o previsto — em vez
 * de cortar a animação no meio, a cena inteira roda mais rápido ou mais devagar.
 *
 * Componentes de cena usam `useSceneFrame()` no lugar de `useCurrentFrame()`.
 */
const ScaleContext = React.createContext(1);
const VariantContext = React.createContext(0);

export const SceneTiming: React.FC<{
  scale: number;
  variant?: number;
  children: React.ReactNode;
}> = ({ scale, variant = 0, children }) => (
  <ScaleContext.Provider value={scale}>
    <VariantContext.Provider value={variant}>{children}</VariantContext.Provider>
  </ScaleContext.Provider>
);

export const useTimeScale = () => React.useContext(ScaleContext);

/** Variante visual pedida pela timeline (0 = padrão). */
export const useVariant = () => React.useContext(VariantContext);

/** Frame da cena já convertido para o ritmo de projeto. */
export const useSceneFrame = () => {
  const frame = useCurrentFrame();
  const scale = useTimeScale();
  return frame / scale;
};
