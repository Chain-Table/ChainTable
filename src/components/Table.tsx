import React from "react";
import { useTranslation } from "react-i18next";
import Card, { CardBack } from "./Card";
import type { Card as CardType, GamePlayer } from "../types/game";
import { displayName, isValidPlay } from "../utils/gameUtils";


/** Avatar determinístico a partir de la wallet o el alias (mismo color en todas las pantallas). */
export const Avatar: React.FC<{ seed: string; size?: number; isTurn?: boolean }> = ({ seed: text, size = 40, isTurn }) => {
  let seed = 0;
  for (const ch of text.toLowerCase()) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const h1 = seed % 360;
  const h2 = (h1 + 40 + ((seed >> 9) % 140)) % 360;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {isTurn && <div className="turn-ring absolute -inset-[3px] rounded-full" />}
      <div
        className="relative w-full h-full rounded-full ring-2 ring-black/50"
        style={{ background: `radial-gradient(circle at 30% 30%, hsl(${h2} 90% 70%), hsl(${h1} 75% 45%) 70%)` }}
      />
    </div>
  );
};

// Rotación pseudoaleatoria pero estable para cada carta de la pila
const tilt = (i: number) => ((i * 37) % 21) - 10;

export const OpponentSeat: React.FC<{ player: GamePlayer; isTurn: boolean }> = ({ player, isTurn }) => {
  const { t } = useTranslation();
  const count = player.cardCount ?? 0;
  const shown = Math.min(count, 7);
  return (
    <div className={`flex flex-col items-center gap-1 transition-all duration-300 ${isTurn ? "scale-110" : "opacity-75"}`}>
      <div className="relative h-14 w-24">
        {Array.from({ length: shown }).map((_, i) => {
          const off = i - (shown - 1) / 2;
          return (
            <CardBack
              key={i}
              size="xs"
              className="absolute left-1/2 bottom-0 origin-bottom"
              style={{ transform: `translateX(calc(-50% + ${off * 7}px)) rotate(${off * 9}deg)` }}
            />
          );
        })}
      </div>
      <div
        className={`flex items-center gap-2 rounded-full pl-1 pr-3 py-1 backdrop-blur-sm ${
          isTurn ? "bg-yellow-400/20 ring-1 ring-yellow-300/60" : "bg-black/40"
        }`}
      >
        <Avatar seed={player.walletAddress || player.username} size={28} isTurn={isTurn} />
        <span className="text-white text-sm font-mono whitespace-nowrap max-w-28 truncate">{displayName(player.username)}</span>
        <span className="min-w-6 h-6 px-1.5 rounded-full bg-white/15 text-white text-xs font-bold flex items-center justify-center">
          {count}
        </span>
      </div>
      {count === 1 && (
        <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-extrabold animate-bounce shadow-lg">
          ¡UNO!
        </span>
      )}
      {player.isConnected === false && <span className="text-[11px] text-red-300">{t("status_disconnected")}</span>}
    </div>
  );
};

const COLOR_HEX: Record<string, string> = { Red: "#ef4444", Blue: "#3b82f6", Green: "#22c55e", Yellow: "#facc15" };

export const CenterPiles: React.FC<{
  discardPile: CardType[];
  activeColor: string | null;
  direction: number;
  drawStack: number;
  canDraw: boolean;
  mustDraw: boolean;
  onDraw: () => void;
}> = ({ discardPile, activeColor, direction, drawStack, canDraw, mustDraw, onDraw }) => {
  const { t } = useTranslation();
  const glow = activeColor ? COLOR_HEX[activeColor] : undefined;
  const top = discardPile.length - 1;
  return (
    <div className="relative flex items-center justify-center gap-8 sm:gap-14">
      {/* Dirección del juego */}
      <svg
        viewBox="0 0 200 200"
        className={`absolute w-[min(78vw,420px)] h-[min(78vw,420px)] opacity-25 pointer-events-none ${
          direction === -1 ? "direction-ccw" : "direction-cw"
        }`}
        aria-hidden
      >
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="white" />
          </marker>
        </defs>
        {[0, 120, 240].map((a) => (
          <path
            key={a}
            d="M 100 8 A 92 92 0 0 1 180 54"
            transform={`rotate(${a} 100 100)${direction === -1 ? " scale(-1 1) translate(-200 0)" : ""}`}
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            markerEnd="url(#arrow)"
          />
        ))}
      </svg>

      {/* Mazo */}
      <button
        type="button"
        onClick={onDraw}
        disabled={!canDraw}
        aria-label={t("draw_card")}
        className="relative group disabled:cursor-default"
      >
        {[2, 1, 0].map((i) => (
          <CardBack
            key={i}
            size="pile"
            className={i ? "absolute top-0 left-0" : "relative transition-transform group-enabled:group-hover:-translate-y-2"}
            style={i ? { transform: `translate(${i * 3}px, ${i * 3}px)` } : undefined}
          />
        ))}
        {mustDraw && (
          <>
            <span className="absolute -inset-2 rounded-2xl ring-4 ring-yellow-300 animate-pulse pointer-events-none" />
            <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold text-yellow-200 bg-black/60 px-2 py-1 rounded-full">
              {t("draw_hint")}
            </span>
          </>
        )}
      </button>

      {/* Descarte */}
      <div className="relative">
        {discardPile.slice(-3, -1).map((card, i) => (
          <div
            key={top - 2 + i}
            className="absolute inset-0"
            style={{ transform: `rotate(${tilt(top - 2 + i)}deg)` }}
          >
            <Card card={card} size="pile" />
          </div>
        ))}
        {top >= 0 && (
          <div
            key={top}
            className="relative animate-card-drop rounded-[10%]"
            style={{
              ["--rot" as string]: `${tilt(top)}deg`,
              transform: `rotate(${tilt(top)}deg)`,
              boxShadow: glow ? `0 0 0 4px ${glow}, 0 0 36px 6px ${glow}99` : undefined,
            }}
          >
            <Card card={discardPile[top]} size="pile" />
          </div>
        )}
        {drawStack > 0 && (
          <span className="absolute -top-4 -right-6 px-3 py-1 rounded-full bg-red-600 text-white font-extrabold text-sm shadow-lg animate-pulse">
            +{drawStack}
          </span>
        )}
      </div>
    </div>
  );
};

export const Hand: React.FC<{
  cards: CardType[];
  topCard: CardType | null;
  activeColor: string | null;
  drawStackActive: boolean;
  isMyTurn: boolean;
  onPlay: (index: number) => void;
}> = ({ cards, topCard, activeColor, drawStackActive, isMyTurn, onPlay }) => {
  // Key estable por carta (color+valor+variante+ocurrencia) para animar solo las que entran
  const seen: Record<string, number> = {};
  const mid = (cards.length - 1) / 2;
  const overlap = cards.length > 10 ? "-ml-14 sm:-ml-16" : cards.length > 6 ? "-ml-10 sm:-ml-12" : "-ml-6 sm:-ml-4";
  return (
    <div className="w-full overflow-x-auto overflow-y-visible [scrollbar-width:thin]">
      <div className="flex w-max mx-auto px-8 pt-8 pb-4">
        {cards.map((card, i) => {
          const id = `${card.color}-${card.value}-${card.variant ?? "a"}`;
          seen[id] = (seen[id] ?? 0) + 1;
          const playable = isMyTurn && (!topCard || isValidPlay(card, topCard, activeColor, drawStackActive));
          const off = i - mid;
          return (
            <div
              key={`${id}-${seen[id]}`}
              className={`animate-card-deal hover:z-50 ${i ? overlap : ""}`}
              style={{
                transform: `rotate(${off * 2.5}deg) translateY(${Math.abs(off) * Math.abs(off) * 0.8}px)`,
                animationDelay: `${Math.min(i, 8) * 40}ms`,
              }}
            >
              <Card card={card} size="hand" isPlayable={playable} dimmed={isMyTurn && !playable} onClick={() => onPlay(i)} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
