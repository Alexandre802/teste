import React from 'react';
import { FONT } from '../../theme';
import { iv, pulse, s, SPRING } from '../../lib/anim';
import { useSceneFrame } from '../../lib/timing';
import { Logo } from '../Logo';
import {
  APP,
  AlertBanner,
  ArrowUpRightIco,
  BellIco,
  BottomNav,
  BriefcaseIco,
  CalendarIco,
  Card,
  ChatIco,
  CheckIco,
  DownloadIco,
  MicIco,
  PAD,
  Pill,
  PlusIco,
  RefreshIco,
  Reveal,
  ScreenHeader,
  SearchField,
  TEXT,
  TabRow,
  TrashIco,
} from './AppKit';

/** Avatar circular com iniciais — substitui as fotos das telas de referência. */
const Ava: React.FC<{ size: number; initials?: string; dark?: boolean; delay?: number; hue?: number }> = ({
  size,
  initials,
  dark = false,
  delay = 0,
  hue = 250,
}) => {
  const frame = useSceneFrame();
  const g = s(frame, { delay, config: SPRING.bouncy });
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${g})`,
        background: dark
          ? 'linear-gradient(145deg, #2A2D3E, #15161F)'
          : `linear-gradient(145deg, hsl(${hue} 55% 72%), hsl(${hue + 18} 48% 55%))`,
        ...TEXT(FONT.bold, size * 0.36, '#FFFFFF'),
      }}
    >
      {dark ? null : initials}
    </div>
  );
};

/**
 * Viewport da tela. `scroll` desliza o conteúdo para cima no meio do take —
 * é o que revela a parte de baixo dos cartões mais altos, como uma rolagem.
 */
const Screen: React.FC<{
  children: React.ReactNode;
  scroll?: number;
  nav?: React.ReactNode;
}> = ({ children, scroll = 0, nav }) => (
  <div style={{ position: 'absolute', inset: 0, background: APP.bg, overflow: 'hidden' }}>
    {/* o conteúdo rola; o menu inferior fica fixo, como no app */}
    <div style={{ transform: `translate3d(0, ${(-scroll).toFixed(2)}px, 0)` }}>{children}</div>
    {nav}
  </div>
);

/** Curva da rolagem automática de uma tela. */
const useScroll = (base: number, px: number, from = 12, to = 30) => {
  const frame = useSceneFrame();
  return px === 0 ? 0 : iv(frame, [base + from, base + to], [0, px]);
};

// ------------------------------------------------------------------ INÍCIO ---

export const HomeScreen: React.FC<{ base?: number; navPress?: number | null }> = ({
  base = 0,
  navPress = null,
}) => {
  const frame = useSceneFrame();
  const n1 = Math.round(iv(frame, [base + 8, base + 26], [0, 8]));
  const n2 = Math.round(iv(frame, [base + 10, base + 30], [0, 37]));
  const beat1 = pulse(frame, base + 26, 0.09, 16);
  const beat2 = pulse(frame, base + 30, 0.09, 16);

  return (
    <Screen nav={<BottomNav active={0} pressAt={navPress} />}>
      <Reveal delay={base} y={-12}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: `26px ${PAD}px 22px`,
            background: APP.surface,
            borderBottom: `2px solid ${APP.border}`,
          }}
        >
          <Logo size={54} delay={base} fontSize={44} gap={14} />
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            <BellIco size={32} color={APP.muted} strokeWidth={2} />
            <Pill bg={APP.blueSoft} color={APP.blueText} delay={base + 3} size={23}>
              Pro
            </Pill>
          </div>
        </div>
      </Reveal>

      <div style={{ padding: `32px ${PAD}px 0`, display: 'flex', flexDirection: 'column', gap: 34 }}>
        <AlertBanner
          delay={base + 2}
          title="Sua IA está pausada"
          body="Nenhum WhatsApp conectado. Conecte um número para gerar o QR Code."
          button="Conectar WhatsApp →"
        />

        {/* métricas */}
        <div style={{ display: 'flex', gap: 24 }}>
          {[
            { v: n1, beat: beat1, label: 'Novos interessados', accent: true, d: base + 6 },
            { v: n2, beat: beat2, label: 'Conversas abertas', accent: false, d: base + 8 },
          ].map((st) => (
            <Card key={st.label} delay={st.d} padding="44px 20px 40px" style={{ flex: 1, textAlign: 'center' }}>
              <div
                style={{
                  ...TEXT(FONT.black, 82, st.accent ? APP.blueText : APP.text),
                  letterSpacing: '-0.04em',
                  transform: `scale(${1 + st.beat})`,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {st.v}
              </div>
              <div style={{ ...TEXT(FONT.regular, 26, APP.muted), marginTop: 8 }}>{st.label}</div>
            </Card>
          ))}
        </div>

        {/* interessados recentes */}
        <Card delay={base + 12} padding="34px 32px 20px">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 22 }}>
            <span style={{ ...TEXT(FONT.bold, 30, APP.text), flex: 1 }}>Interessados recentes</span>
            <span style={TEXT(FONT.semi, 25, APP.blueText)}>Ver todos →</span>
          </div>
          {[
            { name: '+55 (35) 8468-4605', sub: 'agendamento', dark: true },
            { name: 'Otávio Guedes', sub: 'agendamento de limpeza de pele', initials: 'OG', hue: 24 },
            { name: 'Lucas Andrade', sub: 'orçamento para depilação a laser', initials: 'LA', hue: 152 },
          ].map((r, i) => (
            <Reveal key={r.name} delay={base + 16 + i * 3}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 22, padding: '20px 0' }}>
                <Ava size={64} dark={r.dark} initials={r.initials} hue={r.hue} delay={base + 17 + i * 3} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={TEXT(FONT.semi, 28, APP.text)}>{r.name}</div>
                  <div style={{ ...TEXT(FONT.regular, 24, APP.muted), marginTop: 4 }}>{r.sub}</div>
                </div>
                <Pill bg={APP.blueSoft} color={APP.blueText} delay={base + 19 + i * 3} size={21}>
                  Novo
                </Pill>
              </div>
            </Reveal>
          ))}
        </Card>
      </div>
    </Screen>
  );
};

// --------------------------------------------------------------- CONVERSAS ---

const CONVERSAS = [
  { name: '+55 (35) 8468-4605', msg: 'Áudio', date: '04/08', dark: true, audio: true, hot: true },
  {
    name: 'Fernanda Souza',
    msg: 'Combinado, Fernanda! Quinta às 15h30, com o desconto de aniversário aplicado 🎉',
    date: '28/07',
    initials: 'FS',
    hue: 12,
  },
  { name: 'Fábio Cunha', msg: 'Perfeito, até quinta!', date: '28/07', initials: 'FC', hue: 38 },
  { name: 'Priscila Gomes', msg: 'Topo sim!', date: '27/07', initials: 'PG', hue: 320 },
  { name: 'Carolina Mendes', msg: 'Show, tudo certo! Até lá 🙂', date: '26/07', initials: 'CM', hue: 268 },
];

export const ConversasScreen: React.FC<{ base?: number; navPress?: number | null }> = ({
  base = 0,
  navPress = null,
}) => {
  const scroll = useScroll(base, 130, 14, 30);
  return (
  <Screen scroll={scroll} nav={<BottomNav active={1} pressAt={navPress} />}>
    <ScreenHeader
      title="Conversas"
      delay={base}
      right={<DownloadIco size={32} color={APP.muted} strokeWidth={2} />}
    />
    <div style={{ padding: `30px ${PAD}px 0`, display: 'flex', flexDirection: 'column', gap: 26 }}>
      <AlertBanner
        delay={base + 2}
        title="IA pausada — sem WhatsApp conectado"
        body="Conversas existentes visíveis, mas novos clientes não serão atendidos."
        action="Conectar →"
      />
      <SearchField placeholder="Buscar por nome, telefone ou mensagem..." delay={base + 5} caret />
      <TabRow
        delay={base + 8}
        tabs={[
          { label: 'Todas', tone: 'active' },
          { label: 'Aguardando', count: 6, tone: 'amber' },
          { label: 'Manual', count: 5, tone: 'teal' },
          { label: 'Arquivadas' },
        ]}
      />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {CONVERSAS.map((c, i) => (
          <Reveal key={c.name} delay={base + 12 + i * 3} y={16}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 22,
                padding: '30px 24px',
                background: c.hot ? '#FEF8EC' : APP.surface,
                borderLeft: c.hot ? `6px solid ${APP.amber}` : '6px solid transparent',
                borderBottom: `2px solid ${APP.borderSoft}`,
                borderRadius: i === 0 ? '16px 16px 0 0' : 0,
              }}
            >
              <Ava size={64} dark={c.dark} initials={c.initials} hue={c.hue} delay={base + 13 + i * 3} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={TEXT(FONT.bold, 28, APP.text)}>{c.name}</div>
                <div
                  style={{
                    ...TEXT(FONT.regular, 24, c.hot ? APP.amberText : APP.muted),
                    marginTop: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {c.audio ? <MicIco size={22} color={APP.amberText} strokeWidth={2} /> : null}
                  {c.msg}
                </div>
              </div>
              <span style={TEXT(FONT.medium, 23, APP.faint)}>{c.date}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </div>

  </Screen>
  );
};

// -------------------------------------------------------------- INTERESSES ---

export const InteressesScreen: React.FC<{ base?: number; navPress?: number | null }> = ({
  base = 0,
  navPress = null,
}) => {
  const frame = useSceneFrame();
  const btn = s(frame, { delay: base + 11, config: SPRING.bouncy });
  const btnPulse = 1 + pulse(frame, base + 22, 0.03, 30);
  const scroll = useScroll(base, 340, 6, 18);

  return (
    <Screen scroll={scroll} nav={<BottomNav active={2} pressAt={navPress} />}>
      <ScreenHeader
        title="Interesses"
        delay={base}
        right={
          <div style={{ display: 'flex', gap: 14 }}>
            <Pill bg={APP.surface} color={APP.muted} border={APP.border} delay={base + 2} size={22}>
              Interessados 26
            </Pill>
            <Pill bg={APP.surface} color={APP.muted} border={APP.border} delay={base + 3} size={22}>
              Contatos
            </Pill>
          </div>
        }
      />
      <div style={{ padding: `30px ${PAD}px 0`, display: 'flex', flexDirection: 'column', gap: 26 }}>
        <AlertBanner
          delay={base + 2}
          title="IA pausada — novos interessados não serão identificados"
          action="Conectar →"
        />
        <SearchField placeholder="Buscar por nome, telefone, interesse..." delay={base + 5} />
        <TabRow
          delay={base + 7}
          gap={10}
          tabs={[
            { label: 'Novos', count: 8, tone: 'active' },
            { label: 'Contatados', count: 6 },
            { label: 'Convertidos', count: 6 },
            { label: 'Perdidos', count: 3 },
            { label: 'Descartados', count: 3 },
          ]}
        />

        <Card delay={base + 10} padding="30px" highlight={base + 18}>
          <div style={{ display: 'flex', gap: 22 }}>
            <Ava size={72} dark delay={base + 12} />
            <div style={{ flex: 1 }}>
              <div style={TEXT(FONT.bold, 30, APP.text)}>Cliente</div>
              <div style={{ ...TEXT(FONT.regular, 24, APP.muted), marginTop: 5 }}>
                +55 (35) 8468-4605 · <span style={{ color: APP.red }}>04/08/2026</span>
              </div>
              <div style={{ marginTop: 14 }}>
                <Pill bg="#FDF1DF" color={APP.amberText} delay={base + 15} size={23}>
                  agendamento
                </Pill>
              </div>
            </div>
            <TrashIco size={28} color={APP.faint} strokeWidth={2} />
          </div>

          <div style={{ ...TEXT(FONT.regular, 25, APP.muted), marginTop: 18, lineHeight: 1.4 }}>
            cliente está pronto para agendar, mas ainda precisa informar o serviço e preferência de
            data/horário
          </div>

          <div style={{ borderTop: `2px solid ${APP.borderSoft}`, marginTop: 20, paddingTop: 16 }}>
            <span style={TEXT(FONT.regular, 24, APP.faint)}>+ Adicionar nota</span>
          </div>
          <div style={{ borderTop: `2px solid ${APP.borderSoft}`, marginTop: 14, paddingTop: 16 }}>
            <span style={{ ...TEXT(FONT.regular, 24, APP.faint), display: 'flex', gap: 10 }}>
              <BellIco size={22} color={APP.faint} strokeWidth={2} /> Me lembre
            </span>
          </div>

          <div
            style={{
              marginTop: 22,
              background: APP.blue,
              borderRadius: 14,
              padding: '22px 0',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              transform: `scale(${(btn * btnPulse).toFixed(4)})`,
              ...TEXT(FONT.bold, 28, '#FFFFFF'),
            }}
          >
            <ChatIco size={26} color="#FFFFFF" strokeWidth={2} />
            Ver conversa
          </div>

          <div style={{ display: 'flex', gap: 14, marginTop: 16 }}>
            {[
              { label: 'Contatei', color: APP.muted, border: APP.border },
              { label: '✓ Convertido', color: APP.blueText, border: '#C7C9FA' },
              { label: 'Perdido', color: APP.red, border: '#F5C7C8' },
            ].map((b, i) => {
              const g = s(frame, { delay: base + 15 + i * 2, config: SPRING.bouncy });
              return (
                <div
                  key={b.label}
                  style={{
                    flex: 1,
                    border: `2px solid ${b.border}`,
                    borderRadius: 12,
                    padding: '16px 0',
                    textAlign: 'center',
                    transform: `scale(${g})`,
                    ...TEXT(FONT.semi, 24, b.color),
                  }}
                >
                  {b.label}
                </div>
              );
            })}
          </div>
        </Card>

        {/* espiada no próximo lead */}
        <Card delay={base + 16} padding="26px 30px">
          <div style={{ display: 'flex', gap: 22, alignItems: 'center' }}>
            <Ava size={64} initials="OG" hue={24} delay={base + 17} />
            <div>
              <div style={TEXT(FONT.bold, 28, APP.text)}>Otávio Guedes</div>
              <div style={{ ...TEXT(FONT.regular, 24, APP.muted), marginTop: 4 }}>
                +55 (11) 9700-0048 · <span style={{ color: APP.red }}>28/07/2026</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

    </Screen>
  );
};

// ------------------------------------------------------------------ AGENDA ---

const AGENDAMENTOS = [
  { date: 'qua, 19/08/2026 às 08h00', next: true },
  { date: 'qua, 26/08/2026 às 08h00', next: false },
  { date: 'qua, 02/09/2026 às 08h00', next: false },
];

export const AgendaScreen: React.FC<{ base?: number; navPress?: number | null }> = ({
  base = 0,
  navPress = null,
}) => {
  const scroll = useScroll(base, 150, 18, 40);
  return (
  <Screen scroll={scroll} nav={<BottomNav active={3} pressAt={navPress} />}>
    <ScreenHeader
      title="Agendamentos"
      delay={base}
      right={<PlusIco size={34} color={APP.muted} strokeWidth={2.2} />}
    />
    <div style={{ padding: `30px ${PAD}px 0`, display: 'flex', flexDirection: 'column', gap: 26 }}>
      <SearchField placeholder="Buscar por nome, telefone ou serviço..." delay={base + 2} />
      <TabRow
        delay={base + 4}
        gap={10}
        tabs={[
          { label: 'Hoje' },
          { label: 'Pendentes' },
          { label: 'Confirmados', tone: 'active' },
          { label: 'Concluídos' },
          { label: 'Expirados' },
          { label: 'Cancelados' },
        ]}
      />

      {AGENDAMENTOS.map((a, i) => (
        <Card
          key={a.date}
          delay={base + 8 + i * 4}
          active={a.next}
          padding="28px 30px"
          highlight={i === 0 ? base + 18 : undefined}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={TEXT(FONT.bold, 30, APP.text)}>Roberto Almeida</div>
              <div style={{ ...TEXT(FONT.regular, 24, APP.muted), marginTop: 5 }}>
                +55 (11) 9700-0030
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <Pill bg={APP.green} color="#FFFFFF" delay={base + 11 + i * 4} size={22}>
                Confirmado
              </Pill>
              {a.next ? (
                <Pill bg={APP.blue} color="#FFFFFF" delay={base + 13} size={22}>
                  <ArrowUpRightIco size={18} color="#FFFFFF" strokeWidth={2.4} /> Próximo
                </Pill>
              ) : null}
              <Pill bg={APP.gray} color={APP.muted} delay={base + 14 + i * 4} size={22}>
                <RefreshIco size={18} color={APP.muted} strokeWidth={2.2} /> Recorrente
              </Pill>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginTop: 20,
              ...TEXT(FONT.bold, 27, APP.text),
            }}
          >
            <BriefcaseIco size={26} color={APP.muted} strokeWidth={2} />
            Hidratação Facial
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginTop: 10,
              ...TEXT(FONT.regular, 25, APP.muted),
            }}
          >
            <CalendarIco size={26} color={APP.muted} strokeWidth={2} />
            {a.date}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginTop: 18 }}>
            <span style={{ ...TEXT(FONT.semi, 25, APP.blueText), flex: 1 }}>Abrir conversa →</span>
            <span style={TEXT(FONT.regular, 26, APP.faint)}>×</span>
          </div>
        </Card>
      ))}
    </div>

  </Screen>
  );
};

export const SCREENS = [HomeScreen, ConversasScreen, InteressesScreen, AgendaScreen];
