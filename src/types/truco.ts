// Lo que manda el server en truco:state (ver Truco.view en truco/engine). Equipo = asiento % 2
export type Llamada = 'E' | 'R' | 'F'; // envido, real envido, falta envido
export type CantoTruco = 'truco' | 'retruco' | 'valeCuatro';

export type TrucoAction =
  | { type: 'jugar'; card: string }
  | { type: 'envido'; call: Llamada }
  | { type: 'truco' | 'quiero' | 'noQuiero' | 'quieroSubir' | 'mazo' };

export type TrucoEvent = { auto?: 'timeout' } & (
  | { type: 'jugar'; seat: number; card: string }
  | { type: 'baza'; res: 0 | 1 | 'P'; seat: number | null }
  | { type: 'canto'; seat: number; call: Llamada | CantoTruco }
  | { type: 'quiero' | 'noQuiero' | 'mazo' | 'abandono'; seat: number }
  | { type: 'envido'; seat: number; tanto: number }
  | { type: 'puntos'; team: 0 | 1; pts: number; reason: 'envido' | 'mano' | 'noQuiero' | 'mazo' }
  | { type: 'finMano' | 'nuevaMano' }
  | { type: 'fin'; winner: 0 | 1 }
);

export interface TrucoState {
  lobbyId: string;
  seat: number;
  names: string[];
  events: TrucoEvent[];
  turnMs: number;
  msLeft: number | null;
  players: 2 | 4 | 6;
  target: 15 | 30;
  scores: [number, number];
  dealer: number;
  mano: number;
  order: number[]; // quiénes juegan esta mano (en pica-pica, solo el duelo)
  pica: boolean;
  phase: 'PLAYING' | 'ENVIDO' | 'TRUCO' | 'OVER';
  turn: number;
  baza: number;
  hand: string[];
  partners: Record<number, string[]>;
  counts: number[];
  played: { seat: number; card: string }[][];
  results: (0 | 1 | 'P')[];
  bazaTop: number[][];
  envido: {
    state: 'NONE' | 'PENDING' | 'DONE';
    chain: Llamada[];
    caller: 0 | 1 | null;
    result: { seat: number; tanto: number; cards?: string[] } | null;
  };
  truco: { level: 0 | 1 | 2 | 3; pendingBy: 0 | 1 | null; owner: 0 | 1 | null };
  falta: number;
  legal: TrucoAction[];
  over: boolean;
  winner: 0 | 1 | null;
}
