/**
 * Formas das ilustrações de produto, em SVG.
 *
 * São desenhos da própria casa: nenhum reproduz embalagem, logotipo ou
 * identidade de fabricante. O objetivo é que o card não fique vazio enquanto
 * a foto oficial do produto não chega — e que fique óbvio que é ilustração,
 * não a foto do item.
 *
 * Cada forma desenha dentro de uma caixa de 0 0 400 400, centralizada.
 */

export const CORES = {
  fundo: '#F7F9FC',
  escuro: '#002950',
  medio: '#034782',
  acao: '#04559D',
  claro: '#1D6BAD',
  palido: '#DCEAF7',
  branco: '#FFFFFF',
  quente: '#C98A3E',
  quenteClaro: '#E8B872',
  cinza: '#B9C6D4',
};

const C = CORES;

/* ── saco de ração, alpiste, feno, areia, substrato ── */
function saco() {
  return `
    <path d="M120 110 h160 l14 40 v170 a16 16 0 0 1-16 16 H122 a16 16 0 0 1-16-16 V150 Z"
          fill="${C.acao}"/>
    <path d="M120 110 h160 l14 40 H106 Z" fill="${C.medio}"/>
    <path d="M120 110 q80-26 160 0 l-16-22 q-64-18-128 0 Z" fill="${C.escuro}"/>
    <rect x="140" y="182" width="120" height="86" rx="10" fill="${C.branco}" opacity="0.94"/>
    <g fill="${C.quente}">
      <ellipse cx="166" cy="212" rx="11" ry="8"/><ellipse cx="196" cy="206" rx="10" ry="7.5"/>
      <ellipse cx="228" cy="214" rx="11" ry="8"/><ellipse cx="180" cy="234" rx="10" ry="7.5"/>
      <ellipse cx="214" cy="236" rx="11" ry="8"/><ellipse cx="166" cy="252" rx="9" ry="7"/>
      <ellipse cx="200" cy="254" rx="10" ry="7.5"/><ellipse cx="232" cy="248" rx="9" ry="7"/>
    </g>
    <rect x="140" y="288" width="76" height="12" rx="6" fill="${C.branco}" opacity="0.55"/>
    <rect x="140" y="308" width="50" height="10" rx="5" fill="${C.branco}" opacity="0.35"/>`;
}

/* ── sachê ── */
function sache() {
  const dentes = Array.from({ length: 14 }, (_, i) =>
    `<path d="M${104 + i * 14} 150 l7-12 7 12 Z" fill="${C.fundo}"/>`).join('');
  return `
    <path d="M100 146 h200 v122 a18 18 0 0 1-18 18 H118 a18 18 0 0 1-18-18 Z" fill="${C.acao}"/>
    <path d="M100 114 h200 v34 H100 Z" fill="${C.escuro}"/>
    ${dentes}
    <rect x="132" y="176" width="136" height="76" rx="10" fill="${C.branco}" opacity="0.93"/>
    <ellipse cx="200" cy="212" rx="48" ry="24" fill="${C.quenteClaro}"/>
    <ellipse cx="182" cy="206" rx="13" ry="8" fill="${C.quente}"/>
    <ellipse cx="214" cy="216" rx="11" ry="7" fill="${C.quente}"/>
    <rect x="132" y="264" width="76" height="11" rx="5.5" fill="${C.branco}" opacity="0.5"/>`;
}

/* ── pote / tubo com tampa ── */
function pote() {
  return `
    <rect x="132" y="140" width="136" height="170" rx="20" fill="${C.acao}"/>
    <rect x="124" y="112" width="152" height="36" rx="14" fill="${C.escuro}"/>
    <rect x="152" y="184" width="96" height="76" rx="10" fill="${C.branco}" opacity="0.93"/>
    <g fill="${C.quente}">
      <circle cx="176" cy="208" r="9"/><circle cx="202" cy="202" r="8"/><circle cx="226" cy="210" r="9"/>
      <circle cx="188" cy="232" r="8"/><circle cx="216" cy="234" r="9"/>
    </g>
    <rect x="152" y="278" width="60" height="11" rx="5.5" fill="${C.branco}" opacity="0.5"/>`;
}

/* ── frasco de shampoo / solução ── */
function frasco() {
  return `
    <path d="M154 158 h92 a20 20 0 0 1 20 20 v122 a16 16 0 0 1-16 16 H150 a16 16 0 0 1-16-16 V178 a20 20 0 0 1 20-20 Z" fill="${C.acao}"/>
    <rect x="176" y="112" width="48" height="50" rx="8" fill="${C.medio}"/>
    <rect x="168" y="96" width="64" height="26" rx="10" fill="${C.escuro}"/>
    <rect x="156" y="196" width="88" height="72" rx="9" fill="${C.branco}" opacity="0.93"/>
    <rect x="170" y="216" width="60" height="10" rx="5" fill="${C.claro}"/>
    <rect x="170" y="236" width="44" height="8" rx="4" fill="${C.cinza}"/>
    <path d="M186 122 v-14" stroke="${C.escuro}" stroke-width="7" stroke-linecap="round"/>`;
}

/* ── caixa (tapete higiênico, transporte) ── */
function caixa() {
  return `
    <path d="M104 168 l96-42 96 42 v128 l-96 42 -96-42 Z" fill="${C.acao}"/>
    <path d="M104 168 l96 42 96-42 -96-42 Z" fill="${C.claro}"/>
    <path d="M200 210 v128 l96-42 V168 Z" fill="${C.medio}"/>
    <rect x="132" y="212" width="104" height="62" rx="8" fill="${C.branco}" opacity="0.9"
          transform="skewY(6)"/>
    <rect x="146" y="236" width="70" height="10" rx="5" fill="${C.claro}" transform="skewY(6)"/>`;
}

/* ── osso ── */
function osso() {
  return `
    <g transform="rotate(-18 200 200)">
      <path d="M138 172 a30 30 0 1 1 22 50 h80 a30 30 0 1 1 22-50 30 30 0 1 1-22 50 h-80 a30 30 0 1 1-22-50 Z"
            fill="${C.quenteClaro}"/>
      <path d="M160 200 h80" stroke="${C.quente}" stroke-width="10" stroke-linecap="round" opacity="0.55"/>
    </g>`;
}

/* ── bifinho / tiras ── */
function bifinho() {
  return `
    <g transform="rotate(-12 200 200)">
      <rect x="118" y="150" width="164" height="34" rx="17" fill="${C.quente}"/>
      <rect x="106" y="196" width="188" height="34" rx="17" fill="${C.quenteClaro}"/>
      <rect x="126" y="242" width="152" height="34" rx="17" fill="${C.quente}"/>
      <g stroke="${C.branco}" stroke-width="4" stroke-linecap="round" opacity="0.45">
        <path d="M146 158 v18"/><path d="M186 158 v18"/><path d="M226 158 v18"/>
        <path d="M138 204 v18"/><path d="M182 204 v18"/><path d="M226 204 v18"/>
        <path d="M156 250 v18"/><path d="M200 250 v18"/><path d="M244 250 v18"/>
      </g>
    </g>`;
}

/* ── biscoito ── */
function biscoito() {
  return `
    <g fill="${C.quenteClaro}">
      <circle cx="160" cy="168" r="42"/><circle cx="246" cy="186" r="38"/>
      <circle cx="188" cy="252" r="44"/>
    </g>
    <g fill="${C.quente}" opacity="0.6">
      <circle cx="150" cy="160" r="6"/><circle cx="172" cy="180" r="5"/>
      <circle cx="240" cy="178" r="5"/><circle cx="256" cy="196" r="6"/>
      <circle cx="178" cy="244" r="6"/><circle cx="200" cy="264" r="5"/>
    </g>`;
}

/* ── bola ── */
function bola() {
  return `
    <circle cx="200" cy="204" r="86" fill="${C.acao}"/>
    <path d="M114 204 a86 86 0 0 1 172 0" fill="${C.claro}"/>
    <path d="M200 118 q34 86 0 172" stroke="${C.branco}" stroke-width="9" fill="none" opacity="0.75"/>
    <path d="M200 118 q-34 86 0 172" stroke="${C.branco}" stroke-width="9" fill="none" opacity="0.75"/>
    <ellipse cx="172" cy="166" rx="22" ry="14" fill="${C.branco}" opacity="0.28"/>`;
}

/* ── corda com nós ── */
function corda() {
  return `
    <g transform="rotate(-14 200 200)">
      <rect x="130" y="184" width="140" height="34" rx="17" fill="${C.palido}"/>
      <g stroke="${C.cinza}" stroke-width="5" stroke-linecap="round" opacity="0.9">
        ${Array.from({ length: 8 }, (_, i) => `<path d="M${142 + i * 16} 188 l10 26"/>`).join('')}
      </g>
      <circle cx="122" cy="201" r="34" fill="${C.acao}"/>
      <circle cx="278" cy="201" r="34" fill="${C.medio}"/>
      <g stroke="${C.branco}" stroke-width="5" opacity="0.5" fill="none">
        <path d="M104 190 q18 12 36 0"/><path d="M104 212 q18-12 36 0"/>
        <path d="M260 190 q18 12 36 0"/><path d="M260 212 q18-12 36 0"/>
      </g>
    </g>`;
}

/* ── pelúcia / ratinho ── */
function pelucia() {
  return `
    <ellipse cx="196" cy="228" rx="80" ry="62" fill="${C.claro}"/>
    <circle cx="252" cy="188" r="46" fill="${C.acao}"/>
    <circle cx="238" cy="152" r="17" fill="${C.palido}"/>
    <circle cx="272" cy="150" r="17" fill="${C.palido}"/>
    <circle cx="264" cy="182" r="5.5" fill="${C.escuro}"/>
    <circle cx="286" cy="188" r="4.5" fill="${C.escuro}"/>
    <path d="M292 196 q6 6 0 12" stroke="${C.escuro}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M118 240 q-28 18-16 44" stroke="${C.claro}" stroke-width="13" fill="none" stroke-linecap="round"/>`;
}

/* ── arranhador ── */
function arranhador() {
  return `
    <ellipse cx="200" cy="316" rx="96" ry="20" fill="${C.medio}"/>
    <rect x="104" y="290" width="192" height="26" rx="12" fill="${C.acao}"/>
    <rect x="168" y="128" width="64" height="168" fill="${C.quenteClaro}"/>
    <g stroke="${C.quente}" stroke-width="4" opacity="0.6">
      ${Array.from({ length: 16 }, (_, i) => `<path d="M168 ${136 + i * 10} h64"/>`).join('')}
    </g>
    <rect x="140" y="104" width="120" height="30" rx="14" fill="${C.medio}"/>
    <circle cx="272" cy="150" r="20" fill="${C.claro}"/>
    <path d="M262 134 v-26" stroke="${C.cinza}" stroke-width="5" stroke-linecap="round"/>`;
}

/* ── coleira ── */
function coleira() {
  return `
    <circle cx="200" cy="196" r="82" fill="none" stroke="${C.acao}" stroke-width="30"/>
    <circle cx="200" cy="196" r="82" fill="none" stroke="${C.claro}" stroke-width="8" opacity="0.6"/>
    <rect x="176" y="102" width="48" height="30" rx="7" fill="${C.escuro}"/>
    <path d="M200 278 v22" stroke="${C.cinza}" stroke-width="7" stroke-linecap="round"/>
    <circle cx="200" cy="314" r="24" fill="${C.quenteClaro}"/>
    <circle cx="200" cy="314" r="24" fill="none" stroke="${C.quente}" stroke-width="4"/>`;
}

/* ── guia / peitoral ── */
function guia() {
  return `
    <path d="M120 300 q-14-96 60-132 t100 40" fill="none" stroke="${C.acao}" stroke-width="26" stroke-linecap="round"/>
    <path d="M120 300 q-14-96 60-132 t100 40" fill="none" stroke="${C.claro}" stroke-width="7" opacity="0.55" stroke-linecap="round"/>
    <rect x="152" y="196" width="42" height="26" rx="6" fill="${C.escuro}"/>
    <path d="M282 210 q26 10 22 40" fill="none" stroke="${C.cinza}" stroke-width="12" stroke-linecap="round"/>
    <rect x="286" y="248" width="26" height="46" rx="12" fill="${C.cinza}"/>`;
}

/* ── cama ── */
function cama() {
  return `
    <ellipse cx="200" cy="272" rx="122" ry="52" fill="${C.medio}"/>
    <ellipse cx="200" cy="256" rx="122" ry="52" fill="${C.acao}"/>
    <ellipse cx="200" cy="254" rx="88" ry="34" fill="${C.palido}"/>
    <path d="M118 246 q82-52 164 0" fill="none" stroke="${C.claro}" stroke-width="9" opacity="0.5"/>
    <ellipse cx="200" cy="196" rx="70" ry="26" fill="${C.acao}"/>
    <ellipse cx="200" cy="192" rx="70" ry="26" fill="${C.claro}"/>`;
}

/* ── tigela ── */
function tigela() {
  return `
    <path d="M112 208 h176 l-24 92 a20 20 0 0 1-19 15 H155 a20 20 0 0 1-19-15 Z" fill="${C.acao}"/>
    <ellipse cx="200" cy="208" rx="88" ry="26" fill="${C.claro}"/>
    <ellipse cx="200" cy="208" rx="66" ry="18" fill="${C.quenteClaro}"/>
    <g fill="${C.quente}">
      <ellipse cx="178" cy="204" rx="11" ry="7"/><ellipse cx="208" cy="200" rx="10" ry="6.5"/>
      <ellipse cx="228" cy="210" rx="10" ry="6.5"/><ellipse cx="192" cy="214" rx="9" ry="6"/>
    </g>`;
}

/* ── aquário / terrário ── */
function aquario() {
  return `
    <rect x="94" y="132" width="212" height="164" rx="12" fill="${C.palido}"/>
    <rect x="94" y="132" width="212" height="164" rx="12" fill="none" stroke="${C.acao}" stroke-width="14"/>
    <path d="M104 262 q40-22 96-6 t96-4 v34 a12 12 0 0 1-12 12 H116 a12 12 0 0 1-12-12 Z" fill="${C.quenteClaro}"/>
    <ellipse cx="196" cy="204" rx="42" ry="26" fill="${C.acao}"/>
    <path d="M154 204 l-26-20 v40 Z" fill="${C.acao}"/>
    <circle cx="216" cy="196" r="5" fill="${C.branco}"/>
    <g fill="${C.branco}" opacity="0.6">
      <circle cx="250" cy="176" r="7"/><circle cx="264" cy="200" r="5"/><circle cx="252" cy="220" r="4"/>
    </g>`;
}

/* ── gaiola ── */
function gaiola() {
  return `
    <path d="M110 296 V186 a90 90 0 0 1 180 0 v110 Z" fill="${C.palido}"/>
    <g stroke="${C.acao}" stroke-width="8" fill="none" stroke-linecap="round">
      <path d="M110 296 V186 a90 90 0 0 1 180 0 v110"/>
      ${Array.from({ length: 5 }, (_, i) => `<path d="M${140 + i * 30} 296 V${132 + Math.abs(2 - i) * 16}"/>`).join('')}
      <path d="M110 240 h180"/>
    </g>
    <rect x="96" y="292" width="208" height="26" rx="10" fill="${C.medio}"/>
    <path d="M200 96 v-16" stroke="${C.acao}" stroke-width="8" stroke-linecap="round"/>
    <circle cx="200" cy="72" r="14" fill="none" stroke="${C.acao}" stroke-width="8"/>`;
}

/* ── lâmpada ── */
function lampada() {
  return `
    <path d="M200 96 a72 72 0 0 1 44 129 v21 h-88 v-21 A72 72 0 0 1 200 96 Z" fill="${C.quenteClaro}"/>
    <path d="M200 96 a72 72 0 0 0-44 129 v21 h20 v-21 A72 72 0 0 1 200 96 Z" fill="${C.branco}" opacity="0.45"/>
    <rect x="156" y="248" width="88" height="18" rx="6" fill="${C.cinza}"/>
    <rect x="164" y="270" width="72" height="16" rx="6" fill="${C.medio}"/>
    <rect x="172" y="290" width="56" height="16" rx="6" fill="${C.acao}"/>
    <g stroke="${C.quente}" stroke-width="7" stroke-linecap="round" opacity="0.7">
      <path d="M96 140 h-26"/><path d="M304 140 h26"/><path d="M120 78 l-18-18"/><path d="M280 78 l18-18"/>
    </g>`;
}

/* ── cartela de comprimidos ── */
function cartela() {
  const bolhas = [0, 1, 2]
    .flatMap((linha) => [0, 1, 2].map((coluna) => ({ linha, coluna })))
    .map(({ linha, coluna }) => {
      const cx = 152 + coluna * 48;
      const cy = 172 + linha * 38;
      return `<ellipse cx="${cx}" cy="${cy}" rx="17" ry="14" fill="${C.branco}"/>
              <ellipse cx="${cx}" cy="${cy - 2}" rx="11" ry="8" fill="${C.palido}"/>`;
    })
    .join('');
  return `
    <rect x="112" y="140" width="176" height="126" rx="14" fill="${C.acao}"/>
    <rect x="112" y="140" width="176" height="126" rx="14" fill="none" stroke="${C.medio}" stroke-width="6"/>
    ${bolhas}`;
}

/* ── pipeta ── */
function pipeta() {
  return `
    <path d="M186 118 h28 l10 44 v128 a22 22 0 0 1-22 22 h-4 a22 22 0 0 1-22-22 V162 Z" fill="${C.acao}"/>
    <path d="M186 118 h28 v-18 h-28 Z" fill="${C.escuro}"/>
    <rect x="182" y="200" width="36" height="76" rx="10" fill="${C.branco}" opacity="0.85"/>
    <path d="M120 200 q40 24 52 0" fill="none" stroke="${C.claro}" stroke-width="8" stroke-linecap="round" opacity="0.7"/>
    <path d="M280 200 q-40 24-52 0" fill="none" stroke="${C.claro}" stroke-width="8" stroke-linecap="round" opacity="0.7"/>`;
}

/* ── escova ── */
function escova() {
  return `
    <rect x="132" y="150" width="136" height="86" rx="20" fill="${C.acao}"/>
    <g stroke="${C.cinza}" stroke-width="6" stroke-linecap="round">
      ${Array.from({ length: 9 }, (_, i) => `<path d="M${148 + i * 13} 236 v34"/>`).join('')}
    </g>
    <rect x="180" y="102" width="40" height="54" rx="16" fill="${C.medio}"/>
    <rect x="152" y="172" width="96" height="14" rx="7" fill="${C.branco}" opacity="0.45"/>`;
}

/* ── tapete ── */
function tapete() {
  return `
    <rect x="92" y="164" width="216" height="140" rx="14" fill="${C.branco}"/>
    <rect x="92" y="164" width="216" height="140" rx="14" fill="none" stroke="${C.claro}" stroke-width="8"/>
    <rect x="118" y="190" width="164" height="88" rx="8" fill="${C.palido}"/>
    <g fill="${C.claro}" opacity="0.75">
      <ellipse cx="186" cy="222" rx="7" ry="9"/><ellipse cx="200" cy="216" rx="7" ry="9"/>
      <ellipse cx="214" cy="222" rx="7" ry="9"/>
      <path d="M200 230 c11 0 19 8 19 16 0 6-5 10-11 10h-16c-6 0-11-4-11-10 0-8 8-16 19-16Z"/>
    </g>`;
}

export const formas = {
  saco, sache, pote, frasco, caixa, osso, bifinho, biscoito, bola, corda,
  pelucia, arranhador, coleira, guia, cama, tigela, aquario, gaiola,
  lampada, cartela, pipeta, escova, tapete,
};
