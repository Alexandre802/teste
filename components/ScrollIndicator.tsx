/**
 * Convite para rolar, no primeiro quadro do hero: texto em serifada creme,
 * uma linha fina que desce e uma seta discreta — como na referência.
 *
 * A opacidade é escrita direto no DOM pelo `HeroScrollExperience` durante o
 * scroll, então este componente não guarda estado nenhum.
 */
export const ScrollIndicator = () => (
  <div className="pointer-events-none flex h-full translate-y-[3%] flex-col items-center justify-center px-6 text-center">
    <p className="font-serif text-[1.7rem] font-light tracking-wide text-creme drop-shadow-[0_2px_14px_rgba(0,0,0,0.6)] sm:text-[2rem]">
      Role para continuar
    </p>

    <span
      aria-hidden="true"
      className="mt-5 block h-[86px] w-px bg-gradient-to-b from-transparent via-creme/55 to-creme/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)] sm:mt-6 sm:h-[104px]"
    />

    <svg
      viewBox="0 0 24 14"
      className="seta-pulsando -mt-px h-3.5 w-6 text-creme drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <polyline
        points="5,2 12,12 19,2"
        stroke="currentColor"
        strokeOpacity="0.9"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);
