import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGame } from "../hooks/useGame";
import { useSocket } from "../hooks/useSocket";
import { getUserSession } from "../utils/userSession";
import { displayName, isValidPlay } from "../utils/gameUtils";
import ColorPicker from "../components/ColorPicker";
import { Avatar, CenterPiles, Hand, OpponentSeat } from "../components/Table";
import type { Card as CardType, GameLogEntry, GameState } from "../types/game";
import { NETWORKS, fmtAmount, type NetworkKey } from "../config/chains";
import { tErr } from "../i18n";

const PAGE_BG = "min-h-[100dvh] page-bg text-white";

/** Premios por puesto (en wei) según las reglas del contrato. */
function prizesFor(gs: GameState): bigint[] | null {
  if (gs.type !== "pago" || !gs.onchain?.entryFee) return null;
  const pool = BigInt(gs.onchain.entryFee) * BigInt(gs.players.length);
  const fee = (pool * 5n) / 100n;
  if (gs.mode !== "CLASSIC") return [pool - fee];
  const n = Math.min(3, gs.players.length - 1);
  const second = (pool * 20n) / 100n;
  const third = (pool * 15n) / 100n;
  const first = pool - fee - (n > 1 ? second : 0n) - (n > 2 ? third : 0n);
  return [first, second, third].slice(0, n);
}

const fmt = fmtAmount;

const Game: React.FC = () => {
  const { lobbyId } = useParams<{ lobbyId: string }>();
  const navigate = useNavigate();
  const session = getUserSession();
  const { t } = useTranslation();
  const [showLog, setShowLog] = useState(false);

  useEffect(() => {
    if (!session) navigate("/auth");
    else if (!lobbyId) navigate("/lobbies");
  }, [session, lobbyId, navigate]);

  const {
    gameState,
    playerHand,
    isMyTurn,
    isGameFinished,
    startGame,
    playCard,
    drawCard,
    passTurn,
    chooseWildColor,
    isLoading,
    error,
    showColorPicker,
    winners,
    gameMessage,
    prizeDistributionTx,
    actionLog,
    leaveGame,
  } = useGame(lobbyId || "");
  const { cancelLobby } = useSocket();

  if (!lobbyId || !session) {
    return null; // Se redirigirá en useEffect
  }

  const formatPlayerForLog = (playerName?: string) => {
    if (!playerName) return "-";
    return displayName(playerName);
  };

  const getCardLabel = (card?: CardType) => {
    if (!card) return "";

    if (card.value === "Skip") return `${t("card_value_skip")} ${t(`card_color_${card.color.toLowerCase()}`)}`;
    if (card.value === "Reverse") return `${t("card_value_reverse")} ${t(`card_color_${card.color.toLowerCase()}`)}`;
    if (card.value === "DrawTwo") return `${t("card_value_draw_two")} ${t(`card_color_${card.color.toLowerCase()}`)}`;
    if (card.value === "Wild") return t("card_value_wild");
    if (card.value === "WildDrawFour") return t("card_value_wild_draw_four");

    return `${card.value} ${t(`card_color_${card.color.toLowerCase()}`)}`;
  };

  const getCardTextClass = (card?: CardType) => {
    switch (card?.color) {
      case "Red":
        return "text-red-300";
      case "Blue":
        return "text-blue-300";
      case "Green":
        return "text-emerald-300";
      case "Yellow":
        return "text-yellow-200";
      case "Wild":
        return "text-fuchsia-300";
      default:
        return "text-white";
    }
  };

  const renderColoredCard = (card?: CardType, fallback?: string) => (
    <span className={`font-bold ${getCardTextClass(card)}`}>
      {card ? getCardLabel(card) : fallback}
    </span>
  );

  const renderLogMessage = (entry: GameLogEntry) => {
    const player = formatPlayerForLog(entry.playerName);
    const count = entry.cardsDrawn || 1;
    const isSpanish = t("game_log_title") === "Log de partida";
    const addressLabel = isSpanish ? "Dirección" : "Address";

    switch (entry.action) {
      case "started":
        return <>{t("game_log_started")}</>;
      case "over":
        return <>{t("game_log_over")}</>;
      case "winner":
        return <>{t("game_log_winner", { player })}</>;
      case "play":
        return (
          <>
            {addressLabel} <span className="font-semibold text-white">{player}</span>{" "}
            {isSpanish ? "tiró" : "played"} {renderColoredCard(entry.playedCard)}
          </>
        );
      case "draw":
        return <>{t(count === 1 ? "game_log_draw" : "game_log_draw_plural", { player, count })}</>;
      case "pass":
        return <>{t("game_log_pass", { player })}</>;
      case "skip":
        return (
          <>
            {addressLabel} <span className="font-semibold text-white">{player}</span>{" "}
            {isSpanish ? "tiró" : "played"} {renderColoredCard(entry.playedCard, t("card_value_skip"))}
          </>
        );
      case "reverse":
        return (
          <>
            {addressLabel} <span className="font-semibold text-white">{player}</span>{" "}
            {isSpanish ? "tiró" : "played"} {renderColoredCard(entry.playedCard, t("card_value_reverse"))}
          </>
        );
      case "drawTwo_played":
        return (
          <>
            {addressLabel} <span className="font-semibold text-white">{player}</span>{" "}
            {isSpanish ? "tiró" : "played"} {renderColoredCard(entry.playedCard, "+2")}
          </>
        );
      case "drawFour_played":
        return (
          <>
            {addressLabel} <span className="font-semibold text-white">{player}</span>{" "}
            {isSpanish ? "tiró" : "played"} {renderColoredCard(entry.playedCard, "+4")}
          </>
        );
      case "draw_penalty":
        return <>{t("game_log_draw_penalty", { player, count })}</>;
      case "color_chosen":
        return <>{t("game_log_color_chosen", { player })}</>;
      case "player_disconnected":
        return <>{t("game_log_disconnected", { player })}</>;
      case "stack_allowed":
        return <>{t("game_log_stack_allowed", { player })}</>;
      case "stack_not_allowed":
        return <>{t("game_log_stack_not_allowed", { player })}</>;
      default:
        return <>{t("game_log_play", { player, card: getCardLabel(entry.playedCard) })}</>;
    }
  };

  const latestLogByPlayer = actionLog.filter((entry, index, entries) => {
    if (!entry.playerName) return index === 0;
    return entries.findIndex((item) => item.playerName === entry.playerName) === index;
  }).slice(0, Math.max(4, gameState?.players.length || 4));

  // ---------- Cargando ----------
  if (!gameState) {
    return (
      <div className={`${PAGE_BG} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-white/20 border-t-yellow-400 mx-auto mb-5" />
          <h2 className="text-2xl font-bold">{t("game_loading")}</h2>
          <p className="text-white/60">{t("game_connecting")}</p>
        </div>
      </div>
    );
  }

  const isHost = session.id === gameState.hostId;
  const isPaid = gameState.type === "pago" && !!gameState.onchain;
  const network = gameState.onchain?.chain;
  const prizes = prizesFor(gameState);
  const pot = isPaid ? BigInt(gameState.onchain!.entryFee) * BigInt(gameState.players.length) : 0n;

  // ---------- Sala de espera ----------
  if (gameState.status === "waiting") {
    const max = gameState.maxPlayers ?? 8;
    const empty = Math.max(0, max - gameState.players.length);
    return (
      <div className={`${PAGE_BG} px-4 py-10`}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-emerald-300/80 text-sm uppercase tracking-widest">{t("waiting_players")}</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold mt-1">{gameState.name}</h1>
            <p className="text-white/60 mt-2">{t("seats_count", { count: gameState.players.length, max })}</p>
          </div>

          {isPaid && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {[
                [t("entry_label"), fmt(BigInt(gameState.onchain!.entryFee), network)],
                [t("prize_pool"), fmt(pot, network)],
                [t("mode_label"), gameState.mode ?? "BEAST"],
                [t("network_label"), NETWORKS[network as NetworkKey]?.chain.name ?? network],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-3 text-center">
                  <div className="text-xs text-white/50">{label}</div>
                  <div className="font-bold text-yellow-300 truncate">{value}</div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            {gameState.players.map((player) => (
              <div
                key={player.id}
                className="animate-card-deal rounded-2xl bg-white/5 ring-1 ring-white/10 p-4 flex flex-col items-center gap-2"
              >
                <Avatar seed={player.walletAddress || player.username} size={52} />
                <span className="font-bold text-sm max-w-full truncate">{displayName(player.username)}</span>
                <div className="flex gap-1 text-xs">
                  {player.isHost && <span className="px-2 rounded-full bg-yellow-400/20 text-yellow-300">👑 Host</span>}
                  {player.id === session.id && <span className="px-2 rounded-full bg-blue-500/30 text-blue-200">{t("you_label")}</span>}
                </div>
              </div>
            ))}
            {Array.from({ length: Math.min(empty, 8) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="rounded-2xl border-2 border-dashed border-white/10 p-4 flex flex-col items-center justify-center gap-2 text-white/30 min-h-[124px]"
              >
                <div className="w-[52px] h-[52px] rounded-full border-2 border-dashed border-white/15" />
                <span className="text-sm">{t("empty_seat")}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {isHost ? (
              <button
                onClick={startGame}
                disabled={isLoading || gameState.players.length < 2}
                className="px-10 py-4 rounded-2xl text-lg font-bold text-black bg-gradient-to-r from-yellow-300 to-orange-400 shadow-[0_0_30px_rgba(250,204,21,0.35)] hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100"
              >
                {isLoading ? t("game_starting") : t("game_start")}
              </button>
            ) : (
              <p className="w-full text-center text-white/60 mb-2">{t("waiting_for_host")}</p>
            )}
            {isHost && <CancelLobbyButton lobbyId={gameState.id} cancelLobby={cancelLobby} isOnchainLobby={isPaid} />}
            <button
              onClick={leaveGame}
              className="px-6 py-4 rounded-2xl font-bold bg-white/10 hover:bg-white/20 transition-colors"
            >
              {t("game_leave")}
            </button>
          </div>

          {gameState.players.length < 2 && (
            <p className="mt-6 text-center text-yellow-200/80">⏳ {t("game_need_two", { count: 2 })}</p>
          )}
          {error && <p className="mt-6 text-center text-red-300">❌ {error}</p>}
        </div>
      </div>
    );
  }

  // ---------- Fin de partida ----------
  if (isGameFinished) {
    const ranked = winners.length ? winners : [];
    const iWon = ranked[0]?.username === session.username;
    // Orden visual del podio: 2º, 1º, 3º
    const podium = [ranked[1], ranked[0], ranked[2]];
    const heights = ["h-28", "h-40", "h-20"];
    const ranks = [2, 1, 3];
    return (
      <div className={`${PAGE_BG} relative overflow-hidden px-4 py-10`}>
        {iWon &&
          Array.from({ length: 40 }).map((_, i) => (
            <span
              key={i}
              className="confetti"
              style={{
                left: `${(i * 97) % 100}%`,
                background: ["#facc15", "#ef4444", "#3b82f6", "#22c55e", "#a855f7"][i % 5],
                animationDuration: `${3 + (i % 5)}s`,
                animationDelay: `${(i % 10) * 0.3}s`,
              }}
            />
          ))}
        <div className="relative max-w-3xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent">
            {iWon ? t("you_won") : t("game_finished")}
          </h1>

          <div className="mt-12 flex items-end justify-center gap-3 sm:gap-5">
            {podium.map((w, col) =>
              w ? (
                <div key={w.username} className="flex flex-col items-center w-28 sm:w-36">
                  <Avatar seed={w.walletAddress || w.username} size={col === 1 ? 72 : 56} />
                  <span className="font-bold text-sm mt-2 max-w-full truncate">{displayName(w.username)}</span>
                  {prizes?.[ranks[col] - 1] !== undefined && (
                    <span className="text-yellow-300 font-bold text-sm">{fmt(prizes[ranks[col] - 1], network)}</span>
                  )}
                  <div
                    className={`animate-rise mt-2 w-full ${heights[col]} rounded-t-xl flex items-start justify-center pt-2 text-3xl font-extrabold ${
                      col === 1
                        ? "bg-gradient-to-b from-yellow-300 to-yellow-600 text-yellow-900"
                        : col === 0
                        ? "bg-gradient-to-b from-slate-200 to-slate-400 text-slate-700"
                        : "bg-gradient-to-b from-orange-300 to-orange-600 text-orange-900"
                    }`}
                    style={{ animationDelay: `${[0.3, 0, 0.6][col]}s` }}
                  >
                    {ranks[col]}
                  </div>
                </div>
              ) : (
                <div key={col} className="w-28 sm:w-36" />
              )
            )}
          </div>

          {ranked.length > 3 && (
            <ol start={4} className="mt-6 space-y-1 text-white/60">
              {ranked.slice(3).map((w) => (
                <li key={w.username} className="font-semibold text-sm">
                  {w.rank}. {displayName(w.username)}
                </li>
              ))}
            </ol>
          )}

          {isPaid && (
            <div className="mt-10 rounded-2xl bg-white/5 ring-1 ring-white/10 p-5">
              {prizeDistributionTx ? (
                <>
                  <p className="font-bold text-emerald-300">✅ {t("game_prizes_distributed")}</p>
                  <a
                    href={prizeDistributionTx.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 px-5 py-2 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400"
                  >
                    {t("game_view_tx")}
                  </a>
                </>
              ) : (
                <p className="text-white/70 animate-pulse">{gameMessage ?? t("prize_paying")}</p>
              )}
            </div>
          )}

          <button
            onClick={leaveGame}
            className="mt-10 px-10 py-4 rounded-2xl text-lg font-bold text-black bg-gradient-to-r from-yellow-300 to-orange-400 hover:scale-105 transition-transform"
          >
            {t("back_to_lobbies")}
          </button>
        </div>
      </div>
    );
  }

  // ---------- Mesa ----------
  const myIndex = gameState.players.findIndex((p) => p.id === session.id);
  // Rivales en orden de turno empezando por el que juega después de mí
  const opponents =
    myIndex >= 0
      ? [...gameState.players.slice(myIndex + 1), ...gameState.players.slice(0, myIndex)]
      : gameState.players;
  const turnPlayer = gameState.players[gameState.currentTurnIndex];
  const topCard = gameState.discardPile?.[gameState.discardPile.length - 1] ?? null;
  const drawStackActive = (gameState.drawStackCount || 0) > 0;
  const hasMove = playerHand.some((c) => !topCard || isValidPlay(c, topCard, gameState.currentActiveColor, drawStackActive));
  const mustDraw = isMyTurn && !hasMove;

  const logPanel = (
    <div className="space-y-1.5">
      {latestLogByPlayer.length === 0 ? (
        <p className="text-white/50 text-sm">{t("game_log_empty")}</p>
      ) : (
        latestLogByPlayer.map((entry) => (
          <p key={entry.id} className="text-sm text-white/80 leading-snug animate-fade-in">
            {renderLogMessage(entry)}
          </p>
        ))
      )}
    </div>
  );

  return (
    <div className={`${PAGE_BG} h-[100dvh] flex flex-col overflow-hidden`}>
      {/* Barra superior */}
      <header className="flex items-center gap-3 pl-3 sm:pl-5 pr-28 py-2 bg-black/30 backdrop-blur-sm border-b border-white/10">
        <h1 className="text-xl tracking-wide truncate">{gameState.name}</h1>
        {isPaid && (
          <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-yellow-400/15 text-yellow-300 text-sm font-bold">
            💰 {fmt(pot, network)}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowLog((v) => !v)}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
          >
            📝<span className="hidden sm:inline"> {t("show_log")}</span>
          </button>
          <button
            onClick={leaveGame}
            aria-label={t("game_leave")}
            className="px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-sm font-semibold whitespace-nowrap"
          >
            🚪<span className="hidden sm:inline"> {t("game_leave").replace(/^\S+\s/, "")}</span>
          </button>
        </div>
      </header>

      {/* Rivales (mobile: fila con scroll) */}
      <div className="md:hidden flex gap-4 overflow-x-auto px-4 pt-3 pb-1 justify-start">
        {opponents.map((p) => (
          <OpponentSeat key={p.id} player={p} isTurn={p.id === turnPlayer?.id} />
        ))}
      </div>

      {/* Mesa */}
      <main className="relative flex-1 min-h-0 flex items-center justify-center p-3 sm:p-6">
        <div className="felt relative w-full max-w-5xl h-full max-h-[620px] rounded-[48%/42%] flex items-center justify-center">
          {/* Rivales sentados alrededor del borde superior (desktop) */}
          {opponents.map((p, i) => {
            const angle = Math.PI + ((i + 1) * Math.PI) / (opponents.length + 1);
            return (
              <div
                key={p.id}
                className="hidden md:block absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${50 + 47 * Math.cos(angle)}%`, top: `${50 + 50 * Math.sin(angle)}%` }}
              >
                <OpponentSeat player={p} isTurn={p.id === turnPlayer?.id} />
              </div>
            );
          })}

          <CenterPiles
            discardPile={gameState.discardPile ?? []}
            activeColor={gameState.currentActiveColor}
            direction={gameState.direction}
            drawStack={gameState.drawStackCount || 0}
            canDraw={isMyTurn && !isLoading}
            mustDraw={mustDraw}
            onDraw={drawCard}
          />
        </div>

        {/* Mensaje del juego */}
        {(gameMessage || error) && (
          <div
            key={gameMessage ?? error}
            className={`absolute top-3 left-1/2 -translate-x-1/2 max-w-[90%] px-4 py-2 rounded-full text-sm font-semibold shadow-lg animate-fade-in ${
              error ? "bg-red-600" : "bg-black/70 backdrop-blur-sm"
            }`}
          >
            {error ? `❌ ${error}` : gameMessage}
          </div>
        )}

        {/* Log de jugadas */}
        {showLog && (
          <div className="absolute left-3 bottom-3 w-72 max-w-[85%] rounded-2xl bg-black/70 backdrop-blur-sm ring-1 ring-white/10 p-3 animate-fade-in">
            <h3 className="font-bold text-sm mb-2">{t("game_log_title")}</h3>
            {logPanel}
          </div>
        )}
      </main>

      {/* Mi lugar */}
      <footer className="relative bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center justify-center gap-3 px-4 pt-2">
          <Avatar seed={session.walletAddress || session.username} size={32} isTurn={isMyTurn} />
          <span
            className={`font-bold ${isMyTurn ? "text-yellow-300 text-lg animate-heartbeat" : "text-white/60 text-sm"}`}
          >
            {isMyTurn ? t("your_turn") : t("turn_of", { player: displayName(turnPlayer?.username) })}
          </span>
          {playerHand.length === 1 && (
            <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 font-extrabold animate-bounce">
              ¡UNO!
            </span>
          )}
          {isMyTurn && (
            <button
              onClick={passTurn}
              disabled={isLoading}
              className="ml-2 px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-semibold disabled:opacity-40"
            >
              {t("pass_turn")}
            </button>
          )}
        </div>
        <Hand
          cards={playerHand}
          topCard={topCard}
          activeColor={gameState.currentActiveColor}
          drawStackActive={drawStackActive}
          isMyTurn={isMyTurn}
          onPlay={playCard}
        />
      </footer>

      <ColorPicker isVisible={showColorPicker} onColorSelect={chooseWildColor} />
    </div>
  );
};

// Botón de cancelar con confirmación y estado de carga
const CancelLobbyButton: React.FC<{
  lobbyId: string;
  cancelLobby: (lobbyId: string) => Promise<void>;
  isOnchainLobby: boolean;
}> = ({ lobbyId, cancelLobby, isOnchainLobby }) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const { t } = useTranslation();

  const handleCancel = async () => {
    const confirmMessage = isOnchainLobby
      ? `${t("cancel_lobby")} - ${t("cancel_lobby_confirm")}\n\n⚠️ Este lobby tiene entrada pagada. Se devolverán los fondos a todos los jugadores.`
      : `${t("cancel_lobby")} - ${t("cancel_lobby_confirm")}`;
    if (!window.confirm(confirmMessage)) return;

    setIsCancelling(true);
    try {
      // En mesas pagas el servidor cancela on-chain y el contrato devuelve las entradas
      await cancelLobby(lobbyId);
    } catch (err) {
      alert(t("cancel_lobby") + ": " + tErr(err instanceof Error ? err.message : String(err)));
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={isCancelling}
      className="px-6 py-4 rounded-2xl font-bold bg-red-600/80 hover:bg-red-600 transition-colors disabled:opacity-50"
    >
      {isCancelling ? t("canceling") : t("cancel_lobby")}
    </button>
  );
};

export default Game;
