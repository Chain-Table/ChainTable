import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TrucoCard } from "./TrucoCard";
import { Avatar, TurnClock } from "./Table";
import { displayName } from "../utils/gameUtils";
import type { Bubble, Puntos } from "../hooks/useTruco";
import type { CantoTruco, TrucoAction, TrucoEvent, TrucoState } from "../types/truco";

const TRUCO: CantoTruco[] = ["truco", "retruco", "valeCuatro"];
const team = (s: number) => s % 2;
// Nosotros en celeste, ellos en rosa (en la sala de espera y en la mesa)
const TEAM_STYLE = ["bg-sky-500/25 text-sky-100 ring-sky-400/50", "bg-rose-500/25 text-rose-100 ring-rose-400/50"];
const ACTION_STYLE: Record<string, string> = {
  quiero: "bg-emerald-500 hover:bg-emerald-400 text-black",
  noQuiero: "bg-red-600 hover:bg-red-500",
  quieroSubir: "bg-gradient-to-r from-yellow-300 to-orange-500 text-black",
  truco: "bg-gradient-to-r from-yellow-300 to-orange-500 text-black",
  envido: "bg-sky-500 hover:bg-sky-400 text-black",
};
const ORDER = ["quiero", "noQuiero", "quieroSubir", "truco", "envido"];

interface Props {
  st: TrucoState;
  version: number;
  bubbles: Record<number, Bubble>;
  handPoints: Puntos[];
  notice: { kind: "timeout" | "left"; seat: number } | null;
  tableName: string;
  message: string | null;
  onAct: (a: TrucoAction) => void;
  onLeave: () => void;
}

const TrucoTable: React.FC<Props> = ({ st, version, bubbles, handPoints, notice, tableName, message, onAct, onLeave }) => {
  const { t } = useTranslation();
  const me = st.seat;
  const n = st.players;
  const us = team(me);
  const name = (s: number) => displayName(st.names[s]);
  const call = (c: string) => t(`truco_call_${c}`);

  // Irse al mazo pide un segundo toque: tocarlo sin querer cuesta la mano
  const [confirmMazo, setConfirmMazo] = useState(false);
  useEffect(() => {
    if (!confirmMazo) return;
    const id = setTimeout(() => setConfirmMazo(false), 3000);
    return () => clearTimeout(id);
  }, [confirmMazo]);

  // Yo abajo; los demás en el orden de juego, hacia la derecha
  const angle = (s: number) => Math.PI / 2 - (((s - me + n) % n) * 2 * Math.PI) / n;
  const pos = (s: number, rx: number, ry: number) => ({
    left: `${50 + rx * Math.cos(angle(s))}%`,
    top: `${50 + ry * Math.sin(angle(s))}%`,
  });

  const pendingBy = st.phase === "ENVIDO" ? st.envido.caller : st.phase === "TRUCO" ? st.truco.pendingBy : null;
  const pendingCall =
    st.phase === "ENVIDO" ? st.envido.chain.map(call).join(" · ") : st.phase === "TRUCO" ? call(TRUCO[st.truco.level]) : "";
  const acting = st.phase === "PLAYING" ? [st.turn] : pendingBy !== null ? st.order.filter((s) => team(s) !== pendingBy) : [];
  const playable = new Set(st.legal.flatMap((a) => (a.type === "jugar" ? [a.card] : [])));
  const calls = st.legal
    .filter((a) => a.type !== "jugar" && a.type !== "mazo")
    .sort((a, b) => ORDER.indexOf(a.type) - ORDER.indexOf(b.type));
  const canMazo = st.legal.some((a) => a.type === "mazo");

  const actionLabel = (a: TrucoAction) => {
    if (a.type === "envido") return call(a.call);
    if (a.type === "truco") return call(TRUCO[st.truco.level]);
    if (a.type === "quieroSubir") return t("truco_quiero_subir", { call: call(TRUCO[st.truco.level + 1]).toLowerCase() });
    return t(a.type === "quiero" ? "truco_quiero" : "truco_no_quiero");
  };

  const bubbleText = (ev: TrucoEvent) => {
    if (ev.type === "canto") return `¡${call(ev.call)}!`;
    if (ev.type === "envido") return t("truco_tanto", { n: ev.tanto });
    if (ev.type === "quiero") return t("truco_quiero");
    if (ev.type === "noQuiero") return t("truco_no_quiero");
    return t("truco_mazo_said");
  };

  const prompt =
    st.phase === "OVER"
      ? t("truco_hand_over")
      : !st.order.includes(me)
        ? t("truco_sitting_out")
        : pendingBy !== null
          ? t(pendingBy === us ? "truco_waiting_answer" : "truco_they_called", { call: pendingCall })
          : st.turn === me
            ? t("your_turn")
            : t("turn_of", { player: name(st.turn) });

  const reason = (p: Puntos) =>
    p.reason === "mano" ? (st.truco.level ? call(TRUCO[st.truco.level - 1]) : t("truco_reason_mano")) : t(`truco_reason_${p.reason}`);

  // Arriba del jugador, salvo los de la mitad de arriba de la mesa: abajo, para no taparse con el encabezado
  const bubble = (s: number, below = false) =>
    bubbles[s] && (
      <span
        key={bubbles[s].id}
        className={`animate-bubble absolute left-1/2 z-20 whitespace-nowrap px-3 py-1 rounded-2xl bg-white text-black font-display text-base sm:text-lg shadow-xl after:absolute after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent ${
          below ? "top-full mt-2 after:bottom-full after:border-b-white" : "bottom-full mb-2 after:top-full after:border-t-white"
        }`}
      >
        {bubbleText(bubbles[s].ev)}
      </span>
    );

  // Tanteador en fósforos: cuadraditos de 5 (cuatro lados y la diagonal); a 30, malas | buenas
  const score = (tm: number) => (
    <div className="flex items-center gap-2" title={`${st.scores[tm]}${st.target === 30 ? ` (${t(st.scores[tm] < 15 ? "truco_malas" : "truco_buenas")})` : ""}`}>
      <span className={`hidden sm:block w-[4.5rem] text-right text-[11px] font-bold uppercase tracking-wider ${tm === us ? "text-sky-200" : "text-rose-200"}`}>
        {t(tm === us ? "truco_us" : "truco_them")}
      </span>
      <Fosforos points={st.scores[tm]} target={st.target} />
      <span className={`w-6 font-display text-lg leading-none ${tm === us ? "text-sky-200" : "text-rose-200"}`}>{st.scores[tm]}</span>
    </div>
  );

  const toast = message ?? (notice && t(notice.kind === "left" ? "truco_left" : "truco_timeout", { player: name(notice.seat) }));

  return (
    <div className="min-h-[100dvh] page-bg text-white h-[100dvh] flex flex-col overflow-hidden">
      <header className="flex items-center gap-2 sm:gap-3 pl-3 sm:pl-5 pr-28 py-2 bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl tracking-wide truncate">{tableName}</h1>
          <div className="flex gap-1.5 text-[11px] text-white/60">
            <span>{t("truco_mode", { mode: `${n / 2}v${n / 2}` })}</span>
            <span>· {t("truco_to", { n: st.target })}</span>
            {st.pica && <span className="px-1.5 rounded bg-fuchsia-500/30 text-fuchsia-100 font-bold">{t("truco_pica")}</span>}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onLeave}
            aria-label={t("game_leave")}
            className="px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-sm font-semibold whitespace-nowrap"
          >
            🚪<span className="hidden sm:inline"> {t("game_leave").replace(/^\S+\s/, "")}</span>
          </button>
        </div>
      </header>

      <main className="relative flex-1 min-h-0 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-2 p-3 sm:p-6">
        {/* Tanteador: en el celu arriba de la mesa; en pantallas grandes, en la esquina libre */}
        <div className="shrink-0 sm:absolute z-10 sm:top-3 sm:left-3 flex flex-col gap-1.5 px-2.5 py-2 rounded-2xl ring-2 ring-amber-950/80 shadow-[inset_0_1px_0_rgba(255,255,255,.25),0_8px_20px_rgba(0,0,0,.45)]"
          style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent 0 38px, rgba(0,0,0,.22) 38px 40px), linear-gradient(#b45309, #451a03)" }}
        >
          {score(us)}
          {score(1 - us)}
        </div>
        <div className="felt relative w-full max-w-5xl flex-1 sm:flex-none min-h-0 sm:h-full max-h-[620px] rounded-[48%/42%]">
          {/* Los demás jugadores alrededor */}
          {st.names.map((_, s) => {
            if (s === me) return null;
            const out = !st.order.includes(s);
            const partner = st.partners[s];
            return (
              <div
                key={s}
                data-seat={s}
                className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 transition-opacity ${out ? "opacity-40" : ""}`}
                style={pos(s, 40, 41)}
              >
                <div className="relative">
                  <Avatar seed={st.names[s]} size={40} isTurn={acting.includes(s)} />
                  {s === st.mano && (
                    <span title={t("truco_mano")} className="absolute -right-2 -bottom-1 px-1 rounded bg-yellow-400 text-black text-[10px] font-extrabold">
                      M
                    </span>
                  )}
                  {Math.sin(angle(s)) > -0.5 && bubble(s)}
                </div>
                <span className={`max-w-[7rem] truncate text-xs font-bold px-2 rounded-full ring-1 ${TEAM_STYLE[team(s) === us ? 0 : 1]}`}>
                  {name(s)}
                </span>
                <div className="flex -space-x-4">
                  {partner
                    ? partner.map((c) => <TrucoCard key={c} id={c} size="mini" />)
                    : Array.from({ length: st.counts[s] }).map((_, i) => <TrucoCard key={i} size="xs" />)}
                </div>
                {Math.sin(angle(s)) <= -0.5 && bubble(s, true)}
              </div>
            );
          })}

          {/* Cartas jugadas: cada uno las deja delante suyo, una por baza (la j-ésima es de la baza j).
              La que ganó la baza brilla, las que perdieron se apagan; en una parda quedan las empatadas */}
          {st.order.map((s) => {
            const cards = st.played.flatMap((b) => b.filter((p) => p.seat === s).map((p) => p.card));
            return (
              <div key={s} className="absolute -translate-x-1/2 -translate-y-1/2 flex -space-x-5" style={pos(s, 20, 23)}>
                {cards.map((c, j) => {
                  const top = st.bazaTop?.[j];
                  const won = top && st.results[j] !== "P" && top[0] === s;
                  const lost = top && !won && !(st.results[j] === "P" && top.includes(s));
                  return (
                    <TrucoCard
                      key={c}
                      id={c}
                      size="played"
                      dimmed={!!lost}
                      className={`animate-card-drop ${won ? "z-10 -translate-y-1 rounded-lg ring-2 ring-yellow-300 shadow-[0_0_16px_rgba(250,204,21,0.6)]" : ""}`}
                    />
                  );
                })}
              </div>
            );
          })}

        </div>

        {toast && (
          <div
            key={toast}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-30 max-w-[90%] px-4 py-2 rounded-full text-sm font-semibold shadow-lg animate-fade-in bg-black/70 backdrop-blur-sm"
          >
            {toast}
          </div>
        )}
      </main>

      {/* Mi lugar */}
      <footer className="relative bg-gradient-to-t from-black/60 to-transparent pb-3">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 pt-2">
          <div className="relative">
            <Avatar seed={st.names[me]} size={32} isTurn={acting.includes(me)} />
            {bubble(me)}
          </div>
          {me === st.mano && <span className="px-1.5 rounded bg-yellow-400 text-black text-xs font-extrabold">{t("truco_mano")}</span>}
          <span className={`font-bold ${acting.includes(me) ? "text-yellow-300 text-lg" : "text-white/70 text-sm"}`}>{prompt}</span>
          {st.msLeft != null && st.phase !== "OVER" && <TurnClock key={version} msLeft={st.msLeft} total={st.turnMs} />}
          {st.phase === "OVER" &&
            handPoints.map((p, i) => (
              <span key={i} className={`px-2 py-0.5 rounded-full text-sm font-bold ring-1 ${TEAM_STYLE[p.team === us ? 0 : 1]}`}>
                {t(p.team === us ? "truco_us" : "truco_them")} +{p.pts} <span className="font-normal opacity-70">· {reason(p)}</span>
              </span>
            ))}
          <div className="flex gap-1" aria-label={t("truco_bazas")}>
            {st.results.map((r, i) => (
              <span
                key={i}
                className={`w-6 h-6 rounded-full text-xs font-extrabold flex items-center justify-center ${
                  r === "P" ? "bg-white/20" : r === us ? "bg-sky-400 text-black" : "bg-rose-500"
                }`}
                title={`${i + 1}ª`}
              >
                {r === "P" ? "=" : r === us ? "✓" : "✗"}
              </span>
            ))}
          </div>
        </div>

        {st.phase === "OVER" && st.envido.result?.cards && (
          <div className="flex items-center justify-center gap-2 pt-2 text-sm text-white/70">
            {t("truco_envido_of", { player: name(st.envido.result.seat), n: st.envido.result.tanto })}
            {st.envido.result.cards.map((c) => (
              <TrucoCard key={c} id={c} size="sm" />
            ))}
          </div>
        )}

        {(calls.length > 0 || canMazo) && (
          <div className="flex flex-wrap items-center justify-center gap-2 px-4 pt-2">
            {calls.map((a) => (
              <button
                key={a.type + ("call" in a ? a.call : "")}
                onClick={() => onAct(a)}
                className={`px-4 py-2 rounded-xl font-extrabold text-sm sm:text-base shadow-lg active:scale-95 transition ${ACTION_STYLE[a.type]}`}
              >
                {actionLabel(a)}
              </button>
            ))}
            {canMazo && (
              <button
                onClick={() => (confirmMazo ? onAct({ type: "mazo" }) : setConfirmMazo(true))}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${
                  confirmMazo ? "bg-red-600 animate-pulse" : "bg-white/10 hover:bg-white/20 text-white/80"
                }`}
              >
                {confirmMazo ? t("truco_mazo_confirm") : t("truco_mazo")}
              </button>
            )}
          </div>
        )}

        <div className="flex justify-center gap-2 sm:gap-4 pt-3 min-h-[7rem]">
          {st.hand.map((c) => (
            <TrucoCard
              key={c}
              id={c}
              size="hand"
              className="animate-card-deal"
              isPlayable={playable.has(c)}
              dimmed={st.phase === "PLAYING" && st.turn === me && !playable.has(c)}
              onClick={() => onAct({ type: "jugar", card: c })}
            />
          ))}
        </div>
      </footer>

      {st.over && st.winner !== null && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-[2px] animate-fade-in">
          <div
            className={`animate-pop mx-4 text-center px-10 py-8 rounded-3xl shadow-2xl ${
              st.winner === us ? "bg-gradient-to-b from-yellow-300 to-orange-500 text-black" : "bg-slate-900 ring-1 ring-white/15"
            }`}
          >
            {st.winner === us && <div className="text-6xl">🏆</div>}
            <div className="font-display text-4xl sm:text-5xl mt-2">
              {t(st.winner === us ? (n === 2 ? "you_won" : "truco_we_won") : n === 2 ? "truco_you_lost" : "truco_we_lost")}
            </div>
            <div className="mt-2 font-display text-2xl opacity-80">
              {st.scores[us]} – {st.scores[1 - us]}
            </div>
            {notice?.kind === "left" && <p className="mt-1 text-sm opacity-80">{t("truco_left", { player: name(notice.seat) })}</p>}
            <button
              onClick={onLeave}
              className={`mt-6 px-8 py-3 rounded-2xl font-bold ${st.winner === us ? "bg-black text-white" : "bg-white text-black"}`}
            >
              {t("back_to_lobbies")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Cada fósforo: palito y cabeza roja. Orden de un cuadradito: arriba, derecha, abajo, izquierda, diagonal
const PALITOS: [number, number, number, number][] = [
  [6, 5, 30, 5],
  [31, 6, 31, 30],
  [30, 31, 6, 31],
  [5, 30, 5, 6],
  [10, 26, 26, 10],
];
const Fosforo: React.FC<{ p: [number, number, number, number] }> = ({ p: [x1, y1, x2, y2] }) => {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const [ux, uy] = [(x2 - x1) / len, (y2 - y1) / len];
  return (
    <g className="animate-fosforo">
      <line x1={x1 + 0.6} y1={y1 + 0.8} x2={x2 + 0.6} y2={y2 + 0.8} stroke="rgba(0,0,0,.35)" strokeWidth="5" strokeLinecap="round" />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f3e2c0" strokeWidth="4.2" strokeLinecap="round" />
      <line x1={x2 - 3.2 * ux} y1={y2 - 3.2 * uy} x2={x2} y2={y2} stroke="#e4505f" strokeWidth="6.4" strokeLinecap="round" />
    </g>
  );
};
const Fosforos: React.FC<{ points: number; target: number }> = ({ points, target }) => {
  const groups = target / 5;
  const W = 36;
  const GAP = 6;
  const SEP = target === 30 ? 8 : 0; // raya entre malas y buenas
  const width = groups * W + (groups - 1) * GAP + SEP;
  return (
    <svg viewBox={`-1 -1 ${width + 2} ${W + 2}`} className="h-5 sm:h-7 w-auto" aria-hidden>
      {SEP > 0 && <line x1={3 * W + 2.5 * GAP + SEP / 2} y1="0" x2={3 * W + 2.5 * GAP + SEP / 2} y2={W} stroke="rgba(255,255,255,.35)" strokeWidth="2" />}
      {Array.from({ length: groups }).map((_, g) => {
        const x = g * (W + GAP) + (g >= 3 ? SEP : 0);
        const n = Math.max(0, Math.min(5, points - g * 5));
        return (
          <g key={g} transform={`translate(${x} 0)`}>
            <rect x="1" y="1" width={W - 2} height={W - 2} rx="4" fill="rgba(0,0,0,.2)" />
            {PALITOS.slice(0, n).map((p, i) => (
              <Fosforo key={i} p={p} />
            ))}
          </g>
        );
      })}
    </svg>
  );
};

export default TrucoTable;
