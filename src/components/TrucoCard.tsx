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

// Arte disponible en public/truco/<id>.webp. Al sumar los caballos (11) y reyes (12), agregarlos acá.
const ARTE = new Set(["1-espada", "1-basto", "1-oro", "1-copa"]);
// El oro es casi cuadrado: sin esto se ve más grande que los demás
const ESCALA_ARTE: Partial<Record<Palo, number>> = { oro: 0.84, espada: 1.1, basto: 1.1 };

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

const PIEL = "#f2c9a0";
const ORO = "#f5c518";
const fino = { ...line, strokeWidth: 2.4 } as const;
// Manchas del armiño
const Armino = ({ pts }: { pts: [number, number][] }) => (
  <>
    {pts.map(([x, y]) => (
      <path key={`${x}-${y}`} d={`M${x} ${y} l-1.6 3.4 l1.6 -1 l1.6 1 Z`} fill={TINTA} />
    ))}
  </>
);

// Rey (12) de la baraja española: anciano de barba, corona, túnica roja y capa azul con armiño.
// Dibujado en una caja de 200×300; el objeto del palo va en la mano levantada.
function Rey({ palo }: { palo: Palo }) {
  return (
    <g transform={`translate(${(W - 250) / 2} ${(H - 375) / 2 + 4}) scale(1.25)`}>
      <g filter="url(#tc-sticker)">
        <ellipse cx="100" cy="289" rx="64" ry="7" fill="#000" opacity="0.12" />
        {/* capa */}
        <path d="M66 92 C44 120 36 200 30 286 L170 286 C164 200 156 120 134 92 Z" fill="#4a8fd6" />
        <path d="M134 92 C156 120 164 200 170 286 L150 286 C148 200 146 130 128 96 Z" fill="#2f6db3" />
        <path d="M66 92 C44 120 36 200 30 286 L170 286 C164 200 156 120 134 92 Z" fill="none" {...fino} />
        <path d="M56 122 C48 170 44 230 42 286 L57 286 C59 230 62 170 67 126 Z" fill="#fff" {...fino} />
        <path d="M144 122 C152 170 156 230 158 286 L143 286 C141 230 138 170 133 126 Z" fill="#fff" {...fino} />
        <Armino pts={[[52, 150], [49, 190], [47, 230], [46, 268], [148, 150], [151, 190], [153, 230], [154, 268]]} />
        <ellipse cx="85" cy="287" rx="11" ry="5" fill={ORO} {...fino} />
        <ellipse cx="115" cy="287" rx="11" ry="5" fill={ORO} {...fino} />
        {/* túnica */}
        <path d="M74 98 L126 98 C132 150 138 220 142 284 L58 284 C62 220 68 150 74 98 Z" fill="#d9482b" />
        <path d="M113 98 L126 98 C132 150 138 220 142 284 L123 284 C121 220 119 150 113 98 Z" fill="#b5361f" />
        <path d="M74 98 L126 98 C132 150 138 220 142 284 L58 284 C62 220 68 150 74 98 Z" fill="none" {...fino} />
        <path d="M94 100 L106 100 L110 284 L90 284 Z" fill={ORO} {...fino} />
        {[140, 192, 244].map((y) => (
          <path key={y} d={`M100 ${y - 8} L105 ${y} L100 ${y + 8} L95 ${y} Z`} fill="#d62f2f" {...fino} strokeWidth={1.6} />
        ))}
        <path d="M59.5 268 L140.5 268 L142 284 L58 284 Z" fill={ORO} {...fino} />
        <path d="M70 160 L130 160 L131 170 L69 170 Z" fill={ORO} {...fino} />
        <circle cx="100" cy="165" r="4" fill="#d62f2f" {...fino} strokeWidth={1.6} />
        {/* brazo apoyado */}
        <path d="M124 102 C140 112 147 140 145 168 L131 170 C131 148 127 128 118 116 Z" fill="#d9482b" {...fino} />
        <path d="M130.5 164 L145.5 162 L146.5 173 L131 175 Z" fill={ORO} {...fino} />
        <circle cx="139" cy="181" r="7" fill={PIEL} {...fino} />
        {/* cuello de armiño */}
        <path d="M68 98 C78 110 122 110 132 98 C126 88 74 88 68 98 Z" fill="#fff" {...fino} />
        <Armino pts={[[80, 98], [92, 101], [108, 101], [120, 98]]} />
        {/* cabeza */}
        <path d="M80 58 C78 40 122 40 120 58 C124 70 121 82 116 88 L84 88 C79 82 76 70 80 58 Z" fill="#ececec" {...fino} />
        <ellipse cx="100" cy="62" rx="17" ry="20" fill={PIEL} {...fino} />
        <circle cx="90" cy="66" r="3.5" fill="#e8907a" opacity="0.45" />
        <circle cx="110" cy="66" r="3.5" fill="#e8907a" opacity="0.45" />
        <path d="M83 66 C84 82 89 98 100 114 C111 98 116 82 117 66 C110 75 90 75 83 66 Z" fill="#f7f7f7" {...fino} />
        <path d="M94 82 C95 92 97 100 100 108 M106 82 C105 92 103 100 100 108" fill="none" stroke="#c9c9c9" strokeWidth="1.5" />
        <path d="M88 71 C93 66 97 67 100 70 C103 67 107 66 112 71 C107 75 103 74 100 72.5 C97 74 93 75 88 71 Z" fill="#f7f7f7" {...fino} strokeWidth={1.8} />
        <path d="M100 60 Q103.5 65 99 67" fill="none" stroke={TINTA} strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="93" cy="59" r="1.9" fill={TINTA} />
        <circle cx="107" cy="59" r="1.9" fill={TINTA} />
        <path d="M88 54 Q93 50.5 97 54 M103 54 Q107 50.5 112 54" fill="none" stroke="#bdbdbd" strokeWidth="3" strokeLinecap="round" />
        {/* corona */}
        <path d="M80 46 L82 30 L90 38 L100 25 L110 38 L118 30 L120 46 Z" fill={ORO} {...fino} />
        <rect x="79" y="41" width="42" height="8" rx="2" fill={ORO} {...fino} />
        {[89, 100, 111].map((x) => (
          <circle key={x} cx={x} cy="45" r="2.2" fill="#d62f2f" />
        ))}
        {[[82, 30], [100, 25], [118, 30]].map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r="2.6" fill={ORO} {...fino} strokeWidth={1.6} />
        ))}
        {/* brazo levantado con el palo */}
        <path d="M78 100 C62 104 50 112 44 124 L54 132 C60 122 68 116 82 114 Z" fill="#d9482b" {...fino} />
        <path d="M42 121 L52 117 L57.5 128.5 L47.5 133.5 Z" fill={ORO} {...fino} />
      </g>
      <Pip palo={palo} cx={42} cy={palo === "espada" || palo === "basto" ? 80 : 94} s={palo === "espada" || palo === "basto" ? 76 : 50} />
      <circle cx="43" cy="125" r="7" fill={PIEL} {...fino} />
    </g>
  );
}

// Ropa del jinete según el palo, como en la baraja clásica
const JINETE: Record<Palo, { tunica: string; gorro: string; calza: string }> = {
  oro: { tunica: ORO, gorro: ORO, calza: "#c98f0a" },
  copa: { tunica: "#d9482b", gorro: "#d9482b", calza: "#b5361f" },
  espada: { tunica: "#6fb3e8", gorro: "#4a8fd6", calza: "#2f6db3" },
  basto: { tunica: ORO, gorro: "#d9482b", calza: "#d9482b" },
};
const PELO = "#a0673a";
const PELO_OSC = "#7f4a24";
const CRIN = "#4a2a14";

// Caballo (11): jinete con gorro de pluma sobre un caballo que levanta una mano, objeto del palo en alto
function Caballo({ palo }: { palo: Palo }) {
  const j = JINETE[palo];
  const largo = palo === "espada" || palo === "basto";
  return (
    <g transform={`translate(${(W - 250) / 2} ${(H - 375) / 2 + 4}) scale(1.25)`}>
      <g filter="url(#tc-sticker)">
        <ellipse cx="104" cy="284" rx="72" ry="7" fill="#000" opacity="0.12" />
        {/* cola y patas de atrás del lado lejano */}
        <path d="M56 170 C36 174 26 200 28 238 C36 228 40 212 44 202 C44 216 48 226 56 232 C56 212 56 192 60 180 Z" fill={CRIN} {...fino} />
        <path d="M86 198 C88 226 92 252 94 274 L104 274 C102 250 100 222 100 202 Z" fill={PELO_OSC} {...fino} />
        <rect x="92" y="272" width="14" height="8" rx="2" fill={TINTA} />
        <path d="M128 198 C130 226 132 252 132 274 L142 274 C142 250 142 224 140 196 Z" fill={PELO_OSC} {...fino} />
        <rect x="130" y="272" width="14" height="8" rx="2" fill={TINTA} />
        {/* cuerpo */}
        <path d="M54 176 C52 156 72 146 100 148 C128 148 148 154 152 170 C156 190 142 204 114 206 L80 206 C62 204 54 194 54 176 Z" fill={PELO} />
        <path d="M60 190 C70 202 90 206 114 206 C138 204 152 192 152 178 C146 196 120 200 96 199 C80 198 68 196 60 190 Z" fill={PELO_OSC} />
        <path d="M54 176 C52 156 72 146 100 148 C128 148 148 154 152 170 C156 190 142 204 114 206 L80 206 C62 204 54 194 54 176 Z" fill="none" {...fino} />
        {/* patas del lado cercano: una apoyada atrás, una mano levantada adelante */}
        <path d="M62 194 C60 220 64 250 64 274 L75 274 C75 250 77 222 82 202 Z" fill={PELO} {...fino} />
        <rect x="61" y="272" width="16" height="8" rx="2" fill={TINTA} />
        <path d="M138 192 C150 204 160 212 166 220 C171 228 168 238 161 243 L155 237 C159 233 159 228 155 225 C147 219 138 212 128 204 Z" fill={PELO} {...fino} />
        <path d="M155 237 L161 243 L156 249 L149 243 Z" fill={TINTA} />
        {/* manta y montura */}
        <path d="M78 148 L126 148 L130 192 L74 192 Z" fill="#3f9b3a" {...fino} />
        <path d="M74 186 L130 186 L131 196 L73 196 Z" fill={ORO} {...fino} />
        <path d="M84 146 C90 140 112 140 118 146 L118 152 L84 152 Z" fill="#8a2a1c" {...fino} />
        {/* cuello, crin y cabeza */}
        <path d="M124 160 C128 140 136 120 148 106 L166 114 C158 130 152 150 150 172 Z" fill={PELO} {...fino} />
        <path d="M150 102 C140 110 130 128 124 150 C130 146 134 138 138 128 C140 136 144 130 146 120 C148 126 152 118 154 108 Z" fill={CRIN} {...fino} strokeWidth={1.8} />
        <path d="M150 106 C153 96 164 92 172 96 L187 117 C191 123 187 130 180 130 C174 130 170 126 166 122 L159 115 Z" fill={PELO} {...fino} />
        <path d="M154 99 L156 86 L163 97 Z" fill={PELO} {...fino} />
        <circle cx="166" cy="105" r="2.2" fill={TINTA} />
        <circle cx="181" cy="122" r="1.5" fill={TINTA} />
        <path d="M162 101 L168 116 M170 112 C175 119 180 123 186 121" fill="none" stroke="#8a2a1c" strokeWidth="2.6" strokeLinecap="round" />
        {/* jinete: pierna, torso, cabeza */}
        <path d="M90 140 L112 148 C119 154 119 163 115 169 L113 190 L103 190 L105 167 L88 156 Z" fill={j.calza} {...fino} />
        <path d="M102 178 L115 178 L117 198 L99 198 Z" fill="#6b3b1b" {...fino} />
        <path d="M84 100 C84 92 112 92 112 100 L117 146 L81 146 Z" fill={j.tunica} {...fino} />
        <path d="M82 128 L116 128 L116.5 134 L81.5 134 Z" fill="#6b3b1b" />
        <path d="M88 104 C82 118 90 130 104 130" fill="none" stroke={TINTA} strokeWidth="9" strokeLinecap="round" />
        <path d="M88 104 C82 118 90 130 104 130" fill="none" stroke={j.tunica} strokeWidth="5.5" strokeLinecap="round" />
        <path d="M106 130 L180 124" stroke="#6b3b1b" strokeWidth="1.6" />
        <circle cx="106" cy="130" r="5" fill={PIEL} {...fino} />
        <path d="M85 79 C84 66 112 64 112 79 C112 85 110 89 108 91 L88 91 C86 87 85 83 85 79 Z" fill="#7a4a22" {...fino} />
        <circle cx="98" cy="81" r="12" fill={PIEL} {...fino} />
        <circle cx="94" cy="80" r="1.7" fill={TINTA} />
        <circle cx="102" cy="80" r="1.7" fill={TINTA} />
        <path d="M95 86 Q98 88.5 101 86" fill="none" stroke={TINTA} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M82 72 C84 59 112 57 117 69 C109 74 92 74 82 72 Z" fill={j.gorro} {...fino} />
        <path d="M88 64 C76 52 64 52 58 57 C66 60 76 66 86 71 Z" fill="#fff" {...fino} strokeWidth={1.8} />
        {/* brazo en alto con el palo */}
        <path d="M108 100 L114 96 L126 74 L118 70 Z" fill={j.tunica} {...fino} />
      </g>
      <Pip palo={palo} cx={largo ? 128 : 124} cy={largo ? 36 : 50} s={largo ? 70 : 42} />
      <circle cx="122" cy="70" r="6" fill={PIEL} {...fino} />
    </g>
  );
}

function Centro({ id, num, palo }: { id: string; num: number; palo: Palo }) {
  if (ARTE.has(id)) {
    const k = ESCALA_ARTE[palo] ?? 1;
    const w = 250 * k;
    const h = 380 * k;
    return <image href={`/truco/${id}.webp`} x={(W - w) / 2} y={(H - h) / 2} width={w} height={h} preserveAspectRatio="xMidYMid meet" />;
  }
  // Figuras dibujadas en SVG; si algún día hay arte generado, entra por ARTE y tiene prioridad
  if (num === 12) return <Rey palo={palo} />;
  if (num === 11) return <Caballo palo={palo} />;
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
