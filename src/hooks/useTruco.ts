import { useCallback, useEffect, useState } from 'react';
import { socketService } from '../services/socketService';
import type { TrucoAction, TrucoEvent, TrucoState } from '../types/truco';

export type Bubble = { ev: TrucoEvent; id: number };
export type Puntos = Extract<TrucoEvent, { type: 'puntos' }>;

let seq = 0;

// Estado de la mesa de truco. Se monta al tope de la página: el server manda truco:state apenas empieza
export function useTruco(lobbyId: string) {
  const [state, setState] = useState<TrucoState | null>(null);
  const [bubbles, setBubbles] = useState<Record<number, Bubble>>({});
  const [handPoints, setHandPoints] = useState<Puntos[]>([]);
  const [notice, setNotice] = useState<{ kind: 'timeout' | 'left'; seat: number } | null>(null);
  const [version, setVersion] = useState(0); // reinicia el reloj en cada estado nuevo

  useEffect(() => {
    const onState = (st: TrucoState) => {
      if (st.lobbyId !== lobbyId) return;
      setState(st);
      setVersion((v) => v + 1);
      if (st.events.some((e) => e.type === 'nuevaMano')) {
        setBubbles({});
        setHandPoints([]);
        setNotice(null);
      }
      const said = st.events.filter((e) => ['canto', 'quiero', 'noQuiero', 'mazo', 'envido'].includes(e.type));
      if (said.length) {
        setBubbles((b) => {
          const next = { ...b };
          for (const ev of said) next[(ev as { seat: number }).seat] = { ev, id: ++seq };
          return next;
        });
      }
      const pts = st.events.filter((e): e is Puntos => e.type === 'puntos');
      if (pts.length) setHandPoints((p) => [...p, ...pts]);
      const auto = st.events.find((e) => e.auto === 'timeout' && 'seat' in e) as { seat: number } | undefined;
      if (auto) setNotice({ kind: 'timeout', seat: auto.seat });
      const left = st.events.find((e) => e.type === 'abandono') as { seat: number } | undefined;
      if (left) setNotice({ kind: 'left', seat: left.seat });
    };
    socketService.on('truco:state', onState);
    return () => socketService.off('truco:state', onState);
  }, [lobbyId]);

  const act = useCallback((action: TrucoAction) => socketService.trucoAct(lobbyId, action).catch(() => {}), [lobbyId]);

  return { state, version, bubbles, handPoints, notice, act };
}
