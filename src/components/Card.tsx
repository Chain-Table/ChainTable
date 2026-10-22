import React from "react";
import type { Card as CardType } from "../types/game";
import { getCardImageSrc } from "../utils/gameUtils";

// Proporción real de las imágenes de cartas (363x532)
const SIZES = {
  xs: "w-8",
  sm: "w-12",
  md: "w-16",
  hand: "w-[clamp(72px,11vw,120px)]",
  pile: "w-[clamp(84px,11vw,132px)]",
} as const;

interface CardProps {
  card: CardType;
  onClick?: () => void;
  /** Se puede jugar ahora: se levanta al pasar el mouse y brilla. */
  isPlayable?: boolean;
  /** Atenuada (no se puede jugar en tu turno). */
  dimmed?: boolean;
  size?: keyof typeof SIZES;
  className?: string;
  style?: React.CSSProperties;
}

function cardTitle(card: CardType): string {
  if (card.value === "WildDrawFour") return "Comodín +4";
  if (card.value === "Wild") return "Comodín";
  const names: Record<string, string> = { Skip: "Saltar", Reverse: "Reversa", DrawTwo: "+2" };
  return `${names[card.value] ?? card.value} ${card.color}`;
}

export const Card: React.FC<CardProps> = ({
  card,
  onClick,
  isPlayable = false,
  dimmed = false,
  size = "md",
  className = "",
  style,
}) => (
  <button
    type="button"
    onClick={isPlayable ? onClick : undefined}
    disabled={!isPlayable}
    title={cardTitle(card)}
    style={style}
    className={[
      "relative aspect-[363/532] shrink-0 rounded-[10%] transition-all duration-200 select-none",
      "disabled:cursor-default",
      SIZES[size],
      isPlayable
        ? "cursor-pointer hover:-translate-y-5 hover:scale-105 drop-shadow-[0_0_12px_rgba(250,204,21,0.55)] focus-visible:-translate-y-5 focus-visible:outline-none"
        : "drop-shadow-[0_6px_8px_rgba(0,0,0,0.5)]",
      dimmed ? "brightness-50 saturate-50" : "",
      className,
    ].join(" ")}
  >
    <img src={getCardImageSrc(card)} alt={cardTitle(card)} className="w-full h-full object-contain" draggable={false} />
  </button>
);

/** Dorso de carta (mazo y manos de los rivales). */
export const CardBack: React.FC<{ size?: keyof typeof SIZES; className?: string; style?: React.CSSProperties }> = ({
  size = "md",
  className = "",
  style,
}) => (
  <div
    style={style}
    className={`aspect-[363/532] shrink-0 rounded-[10%] overflow-hidden bg-black ring-1 ring-white/30 shadow-[0_4px_8px_rgba(0,0,0,0.5)] ${SIZES[size]} ${className}`}
  >
    <img src="/cartamazo.png" alt="" className="w-full h-full object-cover" draggable={false} />
  </div>
);

export default Card;
