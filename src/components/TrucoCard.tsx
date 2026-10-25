import React from "react";

// Naipe del truco dibujado en SVG: marco del color del palo con los cortes de la pinta,
// índices en las esquinas, palos vectoriales del 2 al 7 y arte para los ases y figuras.
// Ids como los del motor: "7-espada", "12-copa".

export type Palo = "espada" | "basto" | "oro" | "copa";

const W = 363;
const H = 532;
const CREMA = "#f6efdf";
const TINTA = "#2a1d14";

// Color del palo sobre crema, y cortes de la pinta en el marco (oros 0, copas 1, espadas 2, bastos 3)
const PALO: Record<Palo, { color: string; cortes: number; nombre: string }> = {
  oro: { color: "#b8860b", cortes: 0, nombre: "oro" },
  copa: { color: "#c0222c", cortes: 1, nombre: "copa" },
  espada: { color: "#2b6c9e", cortes: 2, nombre: "espada" },
  basto: { color: "#3f8a06", cortes: 3, nombre: "basto" },
};

// Ases, caballos (11) y reyes (12) usan arte de public/truco/<id>.webp; del 2 al 7 se dibujan acá
const ARTE = /^(1|11|12)-/;
// El as de oro es casi cuadrado y los de espada y basto son diagonales: así pesan lo mismo
const ESCALA_ARTE: Record<string, number> = { "1-oro": 0.84, "1-espada": 1.1, "1-basto": 1.1 };

const line = { stroke: TINTA, strokeWidth: 3.5, strokeLinejoin: "round", strokeLinecap: "round" } as const;

// Cada palo en una caja de 100×100, parado, con el mismo trazo oscuro que el arte de los ases
const FORMAS: Record<Palo, React.ReactNode> = {
  espada: (
    <>
      <path d="M50 2 L60 15 L60 62 L40 62 L40 15 Z" fill="#d4ecfa" />
      <path d="M50 2 L50 62 L40 62 L40 15 Z" fill="#9fd0ef" />
      <path d="M50 9 L50 58" stroke="#7fb6dc" strokeWidth="1.8" />
      <path d="M50 2 L60 15 L60 62 L40 62 L40 15 Z" fill="none" {...line} />
      <rect x="44.5" y="70" width="11" height="18" rx="2" fill="#d23a2e" {...line} />
      <path d="M44.5 77 L55.5 74 M44.5 83 L55.5 80" stroke="#f5c518" strokeWidth="2.2" />
      <rect x="22" y="60" width="56" height="10" rx="5" fill="#f5c518" {...line} />
      <circle cx="50" cy="65" r="3.4" fill="#d62f2f" />
      <circle cx="50" cy="92" r="6.5" fill="#f5c518" {...line} />
    </>
  ),
  // Garrote nudoso con la cabeza arriba, como el as
  basto: (
    <>
      <path d="M35 34 C27 27 19 29 16 32 C21 39 30 39 35 34 Z" fill="#5cbf1f" {...line} strokeWidth={2.5} />
      <path d="M44 90 C42 74 40 62 37 50 C33 46 31 40 34 36 C31 28 33 18 40 13 C44 6 52 4 58 7 C63 4 70 8 69 15 C73 20 71 28 67 32 C70 37 68 43 64 46 C61 60 59 74 57 90 Z" fill="#a8642f" />
      <path d="M58 7 C63 4 70 8 69 15 C73 20 71 28 67 32 C70 37 68 43 64 46 C61 60 59 74 57 90 L51 90 C54 74 56 60 59 46 C63 40 64 34 62 30 C66 24 64 14 58 7 Z" fill="#7f4620" />
      <path d="M44 90 C42 74 40 62 37 50 C33 46 31 40 34 36 C31 28 33 18 40 13 C44 6 52 4 58 7 C63 4 70 8 69 15 C73 20 71 28 67 32 C70 37 68 43 64 46 C61 60 59 74 57 90 Z" fill="none" {...line} />
      <circle cx="47" cy="24" r="5.5" fill="#7f4620" {...line} strokeWidth={2.2} />
      <circle cx="47" cy="24" r="2" fill="#a8642f" />
      <circle cx="56" cy="40" r="3.5" fill="#7f4620" {...line} strokeWidth={2} />
      <circle cx="46" cy="55" r="3" fill="#7f4620" {...line} strokeWidth={2} />
      <path d="M39.5 63 L61.4 62 L60.6 69.5 L40.5 70.5 Z" fill="#d62f2f" {...line} strokeWidth={2.5} />
      <path d="M40.6 70.5 L60.5 69.5 L59.7 77 L41.6 78 Z" fill="#f5c518" {...line} strokeWidth={2.5} />
      <ellipse cx="50.5" cy="91" rx="8.5" ry="5" fill="#a8642f" {...line} strokeWidth={2.8} />
    </>
  ),
  oro: (
    <>
      <circle cx="50" cy="50" r="42" fill="#f7c21b" {...line} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return <circle key={i} cx={50 + 37.5 * Math.cos(a)} cy={50 + 37.5 * Math.sin(a)} r="2.2" fill="#c98f0a" />;
      })}
      <circle cx="50" cy="50" r="31" fill="#ffd84a" stroke="#d62f2f" strokeWidth="3.5" />
      <path d="M31 40 A21 21 0 0 1 49 28" fill="none" stroke="#fff7c2" strokeWidth="4.5" strokeLinecap="round" />
    </>
  ),
  copa: (
    <>
      <path d="M22 12 L78 12 C78 40 66 56 50 58 C34 56 22 40 22 12 Z" fill="#f7c21b" />
      <path d="M63 13 L78 12 C78 40 66 56 50 58 C60 52 66 36 63 13 Z" fill="#d9a20e" />
      <path d="M22 12 L78 12 C78 40 66 56 50 58 C34 56 22 40 22 12 Z" fill="none" {...line} />
      <ellipse cx="50" cy="12" rx="28" ry="5" fill="#ffd84a" {...line} />
      <circle cx="50" cy="32" r="6" fill="#2a5fd6" {...line} strokeWidth={2.5} />
      <rect x="46" y="57" width="8" height="22" fill="#f7c21b" {...line} />
      <ellipse cx="50" cy="67" rx="7.5" ry="5" fill="#f7c21b" {...line} />
      <path d="M28 93 C28 84 39 80 50 80 C61 80 72 84 72 93 Z" fill="#f7c21b" {...line} />
    </>
  ),
};

// Contorno blanco de sticker, igual que el arte de los ases
const Defs = () => (
  <defs>
    <filter id="tc-sticker" x="-20%" y="-20%" width="140%" height="140%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="4" result="d" />
      <feFlood floodColor="#fff" />
      <feComposite in2="d" operator="in" result="o" />
      <feMerge>
        <feMergeNode in="o" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
);

// La moneda llena su caja: se achica para pesar lo mismo que los otros palos
const ESCALA_PIP: Partial<Record<Palo, number>> = { oro: 0.86 };

// Espadas y bastos van inclinados, como en el as
const Pip: React.FC<{ palo: Palo; cx: number; cy: number; s: number }> = ({ palo, cx, cy, s: s0 }) => {
  const s = s0 * (ESCALA_PIP[palo] ?? 1);
  return (
  <g transform={`translate(${cx - s / 2} ${cy - s / 2}) scale(${s / 100})`} filter="url(#tc-sticker)">
    <g transform={palo === "espada" || palo === "basto" ? "rotate(30 50 50)" : undefined}>{FORMAS[palo]}</g>
  </g>
  );
};

// Posiciones de los palos (0..1 dentro de la zona central), como en la baraja española
const DISPOSICION: Record<number, [number, number][]> = {
  2: [[0.5, 0.17], [0.5, 0.83]],
  3: [[0.5, 0.14], [0.5, 0.5], [0.5, 0.86]],
  4: [[0.25, 0.17], [0.75, 0.17], [0.25, 0.83], [0.75, 0.83]],
  5: [[0.25, 0.15], [0.75, 0.15], [0.5, 0.5], [0.25, 0.85], [0.75, 0.85]],
  6: [[0.25, 0.14], [0.75, 0.14], [0.25, 0.5], [0.75, 0.5], [0.25, 0.86], [0.75, 0.86]],
  7: [[0.25, 0.1], [0.75, 0.1], [0.5, 0.3], [0.25, 0.5], [0.75, 0.5], [0.25, 0.9], [0.75, 0.9]],
};
const ZONA = { x: 70, y: 92, w: 223, h: 348 };

// Marco con la pinta: cortes repartidos en el borde de arriba y el de abajo
function Marco({ palo }: { palo: Palo }) {
  const { color, cortes } = PALO[palo];
  const x0 = 70;
  const x1 = W - 70;
  const gap = 18;
  const seg = (x1 - x0 - cortes * gap) / (cortes + 1);
  const xs = Array.from({ length: cortes }, (_, i) => x0 + seg * (i + 1) + gap * i);
  return (
    <>
      <rect x="16" y="16" width={W - 32} height={H - 32} rx="18" fill="none" stroke={color} strokeWidth="5" />
      {xs.flatMap((x) => [
        <rect key={`t${x}`} x={x} y="11" width={gap} height="10" fill={CREMA} />,
        <rect key={`b${x}`} x={x} y={H - 21} width={gap} height="10" fill={CREMA} />,
      ])}
    </>
  );
}

function Indice({ num, palo }: { num: number; palo: Palo }) {
  const { color } = PALO[palo];
  const esquina = (
    <>
      <text x="47" y="86" textAnchor="middle" fontFamily="'Lilita One', system-ui, sans-serif" fontSize="58" fill={color}>
        {num}
      </text>
      <Pip palo={palo} cx={47} cy={122} s={44} />
    </>
  );
  return (
    <>
      {esquina}
      <g transform={`rotate(180 ${W / 2} ${H / 2})`}>{esquina}</g>
    </>
  );
}

function Centro({ id, num, palo }: { id: string; num: number; palo: Palo }) {
  if (ARTE.test(id)) {
    // Las figuras van un poco más chicas para no pisar los índices de las esquinas
    const k = ESCALA_ARTE[id] ?? (num === 1 ? 1 : 0.94);
    const w = 250 * k;
    const h = 380 * k;
    return <image href={`/truco/${id}.webp`} x={(W - w) / 2} y={(H - h) / 2} width={w} height={h} preserveAspectRatio="xMidYMid meet" />;
  }
  const s = num <= 3 ? 110 : num === 7 ? 82 : 98;
  return (
    <>
      {DISPOSICION[num].map(([u, v], i) => (
        <Pip key={i} palo={palo} cx={ZONA.x + u * ZONA.w} cy={ZONA.y + v * ZONA.h} s={s} />
      ))}
    </>
  );
}

const DORSO_PALOS: [Palo, number, number][] = [["oro", 0, -68], ["copa", 68, 0], ["espada", 0, 68], ["basto", -68, 0]];

function Dorso() {
  return (
    <>
      <defs>
        <pattern id="tc-rombos" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M0 14 L14 0 L28 14 L14 28 Z" fill="none" stroke={CREMA} strokeOpacity="0.14" strokeWidth="2" />
        </pattern>
      </defs>
      <rect width={W} height={H} rx="26" fill="#1d2740" />
      <rect x="26" y="26" width={W - 52} height={H - 52} rx="12" fill="url(#tc-rombos)" />
      <rect x="16" y="16" width={W - 32} height={H - 32} rx="18" fill="none" stroke={CREMA} strokeWidth="5" />
      <circle cx={W / 2} cy={H / 2} r="124" fill={CREMA} stroke="#c9a227" strokeWidth="5" />
      {DORSO_PALOS.map(([p, dx, dy]) => (
        <Pip key={p} palo={p} cx={W / 2 + dx} cy={H / 2 + dy} s={86} />
      ))}
    </>
  );
}

function parseCarta(id: string): { num: number; palo: Palo } {
  const [n, palo] = id.split("-");
  return { num: Number(n), palo: palo as Palo };
}

/** La carta como SVG suelto (para el componente y para exportar el mazo). */
export const TrucoCardSvg: React.FC<{ id?: string; className?: string }> = ({ id, className }) => {
  const c = id && parseCarta(id);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label={c ? `${c.num} de ${PALO[c.palo].nombre}` : "carta tapada"}>
      <Defs />
      {c ? (
        <>
          <rect width={W} height={H} rx="26" fill={CREMA} />
          <Marco palo={c.palo} />
          <Centro id={id} num={c.num} palo={c.palo} />
          <Indice num={c.num} palo={c.palo} />
        </>
      ) : (
        <Dorso />
      )}
    </svg>
  );
};

const SIZES = {
  xs: "w-8",
  sm: "w-12",
  md: "w-16",
  played: "w-11 sm:w-16",
  mini: "w-8 sm:w-12",
  hand: "w-[clamp(72px,11vw,120px)]",
  pile: "w-[clamp(84px,11vw,132px)]",
} as const;

interface TrucoCardProps {
  /** Id del motor ("7-espada"); sin id se muestra el dorso. */
  id?: string;
  onClick?: () => void;
  isPlayable?: boolean;
  dimmed?: boolean;
  size?: keyof typeof SIZES;
  className?: string;
  style?: React.CSSProperties;
}

export const TrucoCard: React.FC<TrucoCardProps> = ({ id, onClick, isPlayable = false, dimmed = false, size = "md", className = "", style }) => (
  <button
    type="button"
    onClick={isPlayable ? onClick : undefined}
    disabled={!isPlayable}
    style={style}
    className={[
      "relative aspect-[363/532] shrink-0 transition-all duration-200 select-none disabled:cursor-default",
      SIZES[size],
      isPlayable
        ? "cursor-pointer hover:-translate-y-5 hover:scale-105 drop-shadow-[0_0_12px_rgba(250,204,21,0.55)] focus-visible:-translate-y-5 focus-visible:outline-none"
        : "drop-shadow-[0_6px_8px_rgba(0,0,0,0.5)]",
      dimmed ? "brightness-50 saturate-50" : "",
      className,
    ].join(" ")}
  >
    <TrucoCardSvg id={id} className="w-full h-full" />
  </button>
);
