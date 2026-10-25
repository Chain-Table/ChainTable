import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount, useDisconnect } from "wagmi";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import { useTranslation } from "react-i18next";
import type { GameKind, LobbySummary, LobbyType, SupportedNetwork } from "../types/lobby";
import { ENABLED_NETWORKS, NETWORKS, fmtAmount, symbolOf } from "../config/chains";
import { createPaidLobby, joinPaidLobby, leavePaidLobby } from "../utils/chainTable";
import { useSocket } from "../hooks/useSocket";
import { getUserId, getUserSession, clearUserSession, setSessionWallet } from "../utils/userSession";
import { displayName } from "../utils/gameUtils";
import { Avatar } from "../components/Table";
import { tErr } from "../i18n";

// Cupo on-chain de las mesas pagas; el host puede empezar antes con 2+
const MAX_PAID_PLAYERS = 8;

type Filter = "all" | LobbyType;
type Mode = "BEAST" | "CLASSIC";

const TYPE_STYLE: Record<LobbyType, { icon: string; badge: string; key: string }> = {
  publico: { icon: "🌍", badge: "bg-sky-500/15 text-sky-200 ring-sky-400/30", key: "table_public" },
  privado: { icon: "🔒", badge: "bg-violet-500/15 text-violet-200 ring-violet-400/30", key: "table_private" },
  pago: { icon: "💰", badge: "bg-yellow-400/15 text-yellow-200 ring-yellow-300/40", key: "table_paid" },
};

const errMsg = (e: unknown) => tErr(e instanceof Error ? e.message : String(e));

const Lobbies: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { address: walletAddress, isConnected: isWalletConnected } = useAccount();
  const { disconnect: disconnectWallet } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  const { isConnected, activeLobbies, createLobby, joinLobby, disconnect } = useSocket();

  const [userName, setUserName] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [askPassword, setAskPassword] = useState<LobbySummary | null>(null);
  // Acción en curso (id de mesa o "create") + mensaje para el toast
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  // Sesión con alias o wallet; la wallet conectada queda vinculada al alias (mesas pagas)
  useEffect(() => {
    if (!getUserSession()) {
      navigate("/auth");
      return;
    }
    if (isWalletConnected && walletAddress) setSessionWallet(walletAddress);
    setUserName(getUserSession()!.username);
  }, [navigate, isWalletConnected, walletAddress]);

  useEffect(() => {
    if (toast?.kind !== "ok") return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  const requireWallet = () => {
    if (walletAddress) return walletAddress;
    openConnectModal?.();
    throw new Error(t("paid_needs_wallet"));
  };

  const handleLogout = () => {
    clearUserSession();
    disconnect();
    disconnectWallet();
    navigate("/");
  };

  const handleCreate = async (form: CreateForm) => {
    setBusy("create");
    setToast(null);
    let onchain: { chain: SupportedNetwork; lobbyId: string } | undefined;
    try {
      // Mesa paga: se crea on-chain (el creador paga su entrada en el mismo tx).
      // El server lee entrada, modo y cupo del contrato; no confía en lo que mandamos.
      if (form.type === "pago") {
        requireWallet();
        setToast({ kind: "ok", text: t("creating_onchain", { network: NETWORKS[form.network].chain.name }) });
        const lobbyId = await createPaidLobby(form.network, form.entry, MAX_PAID_PLAYERS, form.mode);
        onchain = { chain: form.network, lobbyId };
      }
      let created;
      try {
        created = await createLobby(
          {
            type: form.type,
            name: form.name.trim(),
            ...(form.type === "privado" && { password: form.password }),
            ...(form.type === "pago" && { entryCost: form.entry, mode: form.mode, network: form.network, onchain }),
            ...(form.game === "truco" && { game: "truco" as const, players: form.players, target: form.target }),
          },
          getUserId(),
          userName,
        );
      } catch (e) {
        // Ya pagó pero el server no publicó la mesa: devolverle la entrada
        if (onchain && walletAddress) {
          setToast({ kind: "err", text: t("refunding_entry") });
          await leavePaidLobby(onchain.chain, onchain.lobbyId, walletAddress);
        }
        throw e;
      }
      navigate(`/game/${created.id}`);
    } catch (e) {
      setToast({ kind: "err", text: errMsg(e) });
    } finally {
      setBusy(null);
    }
  };

  const handleJoin = async (lobby: LobbySummary, password?: string) => {
    if (lobby.type === "privado" && password === undefined) {
      setAskPassword(lobby);
      return;
    }
    setBusy(lobby.id);
    setToast(null);
    try {
      if (lobby.type === "pago") {
        // El contrato es siempre el de nuestra config, nunca uno que mande el server
        const network = lobby.onchain?.chain;
        if (!network || !NETWORKS[network] || !lobby.onchain?.lobbyId) throw new Error(t("bad_onchain_table"));
        const wallet = requireWallet();
        setToast({ kind: "ok", text: t("paying_entry", { network: NETWORKS[network].chain.name }) });
        await joinPaidLobby(network, String(lobby.onchain.lobbyId), wallet);
      }
      await joinLobby(lobby.id, password);
      navigate(`/game/${lobby.id}`);
    } catch (e) {
      setToast({ kind: "err", text: errMsg(e) });
    } finally {
      setBusy(null);
    }
  };

  const visible = useMemo(
    () => activeLobbies.filter((l) => filter === "all" || l.type === filter),
    [activeLobbies, filter],
  );
  const open = visible.filter((l) => l.status === "waiting");
  const playing = visible.filter((l) => l.status === "playing");
  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: 0, publico: 0, privado: 0, pago: 0 };
    for (const l of activeLobbies) {
      if (l.status !== "waiting") continue;
      c.all++;
      c[l.type]++;
    }
    return c;
  }, [activeLobbies]);

  return (
    <div className="min-h-[100dvh] page-bg text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-black/40 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto flex items-center gap-3 pl-4 pr-28 sm:pl-6 2xl:pr-6 py-3">
          <div className="flex items-center gap-2 mr-auto">
            <button
              onClick={() => navigate("/")}
              title={t("back_home")}
              aria-label={t("back_home")}
              className="w-9 h-9 shrink-0 rounded-full bg-white/5 ring-1 ring-white/10 hover:bg-white/15 flex items-center justify-center"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <span className="hidden sm:inline text-3xl font-display tracking-wide whitespace-nowrap logo">{t("title")}</span>
            <span
              title={isConnected ? t("status_connected") : t("status_disconnected")}
              className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400" : "bg-red-400 animate-pulse"}`}
            />
          </div>

          <div className="flex items-center gap-2 rounded-full bg-white/5 ring-1 ring-white/10 pl-1 pr-3 py-1 min-w-0">
            <Avatar seed={walletAddress || userName || "?"} size={30} />
            <div className="leading-tight min-w-0">
              <button
                onClick={() => navigate("/auth")}
                title={t("change_alias")}
                className="block text-sm font-semibold truncate max-w-[9rem] hover:text-yellow-300"
              >
                {displayName(userName)}
              </button>
              <ConnectButton.Custom>
                {({ mounted, account, openConnectModal: connect, openAccountModal }) => (
                  <button
                    onClick={mounted && account ? openAccountModal : connect}
                    className="block text-xs font-mono text-white/60 hover:text-white whitespace-nowrap"
                  >
                    {mounted && account ? displayName(account.address) : "+ Wallet"}
                  </button>
                )}
              </ConnectButton.Custom>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title={t("auth_logout")}
            aria-label={t("auth_logout")}
            className="w-9 h-9 shrink-0 rounded-full bg-white/5 ring-1 ring-white/10 hover:bg-red-500/30 flex items-center justify-center"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11" />
            </svg>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Título + crear */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl sm:text-5xl font-display">{t("tables_open")}</h1>
            <p className="text-white/50 text-sm">{t("tables_open_sub")}</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            disabled={!isConnected}
            className="btn-shine bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-extrabold px-6 py-3 rounded-xl shadow-lg shadow-orange-500/20 hover:brightness-110 active:scale-[0.98] transition disabled:opacity-40"
          >
            ＋ {t("create_table")}
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6 [scrollbar-width:none]">
          {(["all", "publico", "privado", "pago"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold ring-1 transition ${
                filter === f ? "bg-white text-black ring-white" : "bg-white/5 text-white/70 ring-white/10 hover:bg-white/10"
              }`}
            >
              {f === "all" ? t("filter_all") : `${TYPE_STYLE[f].icon} ${t(TYPE_STYLE[f].key)}`}
              <span className="ml-2 opacity-60">{counts[f]}</span>
            </button>
          ))}
        </div>

        {open.length === 0 ? (
          <div className="felt rounded-3xl ring-1 ring-white/10 py-16 px-6 text-center">
            <div className="text-5xl mb-3">🃏</div>
            <h2 className="text-2xl font-bold">{t("no_tables")}</h2>
            <p className="text-white/60 mt-1 mb-6">{t("no_tables_hint")}</p>
            <button
              onClick={() => setShowCreate(true)}
              disabled={!isConnected}
              className="bg-white text-black font-bold px-6 py-2.5 rounded-xl hover:bg-yellow-300 transition disabled:opacity-40"
            >
              {t("create_table")}
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {open.map((l) => (
              <TableCard
                key={l.id}
                lobby={l}
                busy={busy === l.id}
                disabled={!!busy || !isConnected}
                onJoin={() => handleJoin(l)}
              />
            ))}
          </div>
        )}

        {playing.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-bold text-white/70 mb-3">🔥 {t("tables_in_game")}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {playing.map((l) => (
                <TableCard key={l.id} lobby={l} />
              ))}
            </div>
          </section>
        )}
      </main>

      {showCreate && (
        <CreateModal busy={busy === "create"} onClose={() => setShowCreate(false)} onSubmit={handleCreate} />
      )}

      {askPassword && (
        <PasswordModal
          lobbyName={askPassword.name}
          onClose={() => setAskPassword(null)}
          onSubmit={(pw) => {
            const lobby = askPassword;
            setAskPassword(null);
            handleJoin(lobby, pw);
          }}
        />
      )}

      {toast && (
        <div
          role="status"
          className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-md flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl ring-1 animate-slide-in-up ${
            toast.kind === "ok" ? "bg-emerald-900/95 ring-emerald-400/40" : "bg-red-900/95 ring-red-400/40"
          }`}
        >
          <span className="flex-1 text-sm">{toast.text}</span>
          <button onClick={() => setToast(null)} aria-label={t("close")} className="text-white/60 hover:text-white">
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

// ---------- Tarjeta de mesa ----------

const TableCard: React.FC<{ lobby: LobbySummary; busy?: boolean; disabled?: boolean; onJoin?: () => void }> = ({
  lobby,
  busy,
  disabled,
  onJoin,
}) => {
  const { t } = useTranslation();
  const style = TYPE_STYLE[lobby.type];
  const entry = lobby.onchain?.entryFee ?? lobby.entryCost;
  const network = lobby.onchain?.chain;
  const price = lobby.type === "pago" && entry ? fmtAmount(entry, network) : null;
  return (
    <article
      className={`rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-4 flex flex-col gap-3 transition ${
        onJoin ? "hover:ring-yellow-300/40 hover:bg-white/[0.07] hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 animate-slide-in-up" : "opacity-60"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-bold text-lg leading-tight break-words min-w-0">{lobby.name}</h3>
        <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ring-1 ${style.badge}`}>
          {style.icon} {t(style.key)}
        </span>
      </div>
      <div className="-mt-1 text-xs font-bold">
        {lobby.game === "truco" ? (
          <span className="px-2 py-1 rounded-lg bg-amber-500/15 text-amber-200">
            🗡️ {t("truco_name")} · {lobby.maxPlayers / 2}v{lobby.maxPlayers / 2} · {t("truco_to", { n: lobby.target })}
          </span>
        ) : (
          <span className="px-2 py-1 rounded-lg bg-red-500/15 text-red-200">🃏 UNO</span>
        )}
      </div>

      {price && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded-lg bg-yellow-400/10 text-yellow-200 font-bold text-sm">{price}</span>
          {network && NETWORKS[network] && (
            <span className="px-2 py-1 rounded-lg bg-white/5 text-white/70">{NETWORKS[network].chain.name}</span>
          )}
          {lobby.mode && (
            <span
              className={`px-2 py-1 rounded-lg font-bold ${
                lobby.mode === "BEAST" ? "bg-rose-500/15 text-rose-300" : "bg-indigo-500/15 text-indigo-300"
              }`}
            >
              {lobby.mode}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 mt-auto">
        <div
          className="flex items-center gap-1"
          aria-label={t("seats_count", { count: lobby.playerCount, max: lobby.maxPlayers })}
        >
          {Array.from({ length: Math.min(lobby.maxPlayers, 8) }).map((_, i) => (
            <span key={i} className={`w-2.5 h-2.5 rounded-full ${i < lobby.playerCount ? "bg-emerald-400" : "bg-white/15"}`} />
          ))}
          <span className="ml-2 text-xs text-white/50">
            {lobby.playerCount}/{lobby.maxPlayers}
          </span>
        </div>
        {onJoin ? (
          <button
            onClick={onJoin}
            disabled={disabled}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition disabled:opacity-40"
          >
            {busy ? "…" : price ? `${t("join_table")} · ${price}` : t("join_table")}
          </button>
        ) : (
          <span className="text-xs text-white/50">{t("in_progress")}</span>
        )}
      </div>
    </article>
  );
};

// ---------- Modales ----------

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => {
  const { t } = useTranslation();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg max-h-[92dvh] overflow-y-auto bg-slate-950 ring-1 ring-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-slide-in-up"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-display">{title}</h2>
          <button onClick={onClose} aria-label={t("close")} className="text-white/50 hover:text-white text-xl">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const INPUT =
  "w-full bg-white/5 ring-1 ring-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400";

interface CreateForm {
  game: GameKind;
  players: 2 | 4 | 6;
  target: 15 | 30;
  type: LobbyType;
  name: string;
  password: string;
  entry: string;
  mode: Mode;
  network: SupportedNetwork;
}

const CreateModal: React.FC<{ busy: boolean; onClose: () => void; onSubmit: (f: CreateForm) => void }> = ({
  busy,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const [f, setF] = useState<CreateForm>({
    game: "uno",
    players: 2,
    target: 30,
    type: "publico",
    name: "",
    password: "",
    entry: "",
    mode: "BEAST",
    network: ENABLED_NETWORKS[0] ?? "base",
  });
  const set = <K extends keyof CreateForm>(k: K, v: CreateForm[K]) => setF((p) => ({ ...p, [k]: v }));
  const paidAvailable = ENABLED_NETWORKS.length > 0;
  const entry = f.entry.replace(",", ".");
  const entryOk = parseFloat(entry) > 0;
  const truco = f.game === "truco";
  const valid =
    f.name.trim().length >= 3 &&
    !(truco && f.type === "pago") &&
    (f.type !== "privado" || f.password.length > 0) &&
    (f.type !== "pago" || (paidAvailable && entryOk));

  return (
    <Modal title={t("create_table")} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (valid && !busy) onSubmit({ ...f, entry });
        }}
        className="space-y-5"
      >
        {/* Juego */}
        <div className="grid grid-cols-2 gap-2">
          {(["uno", "truco"] as GameKind[]).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setF((p) => ({ ...p, game: g, type: g === "truco" && p.type === "pago" ? "publico" : p.type }))}
              aria-pressed={f.game === g}
              className={`rounded-2xl py-3 ring-1 transition font-display text-xl ${
                f.game === g ? "bg-white/10 ring-yellow-400" : "bg-white/[0.03] ring-white/10 hover:bg-white/[0.06]"
              }`}
            >
              {g === "uno" ? "🃏 UNO" : `🗡️ ${t("truco_name")}`}
            </button>
          ))}
        </div>

        {/* Tipo (el truco todavía no tiene mesas pagas) */}
        <div className={`grid gap-2 ${truco ? "grid-cols-2" : "grid-cols-3"}`}>
          {(Object.keys(TYPE_STYLE) as LobbyType[]).filter((type) => !truco || type !== "pago").map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => set("type", type)}
              aria-pressed={f.type === type}
              className={`rounded-2xl py-3 ring-1 transition flex flex-col items-center gap-1 ${
                f.type === type ? "bg-white/10 ring-yellow-400" : "bg-white/[0.03] ring-white/10 hover:bg-white/[0.06]"
              }`}
            >
              <span className="text-2xl">{TYPE_STYLE[type].icon}</span>
              <span className="text-sm font-semibold">{t(TYPE_STYLE[type].key)}</span>
            </button>
          ))}
        </div>

        <label className="block">
          <span className="block text-sm text-white/70 mb-1.5">{t("label_lobby_name")}</span>
          <input
            autoFocus
            maxLength={40}
            value={f.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder={t("placeholder_table_name")}
            className={INPUT}
          />
        </label>

        {truco && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="block text-sm text-white/70 mb-1.5">{t("mode_label")}</span>
              <div className="grid grid-cols-3 gap-1.5">
                {([2, 4, 6] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => set("players", p)}
                    aria-pressed={f.players === p}
                    className={`rounded-xl py-2 ring-1 font-bold transition ${
                      f.players === p ? "bg-amber-500/20 ring-amber-400" : "bg-white/[0.03] ring-white/10 hover:bg-white/[0.06]"
                    }`}
                  >
                    {p / 2}v{p / 2}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="block text-sm text-white/70 mb-1.5">{t("truco_points")}</span>
              <div className="grid grid-cols-2 gap-1.5">
                {([15, 30] as const).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => set("target", n)}
                    aria-pressed={f.target === n}
                    className={`rounded-xl py-2 ring-1 font-bold transition ${
                      f.target === n ? "bg-amber-500/20 ring-amber-400" : "bg-white/[0.03] ring-white/10 hover:bg-white/[0.06]"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {f.type === "privado" && (
          <label className="block">
            <span className="block text-sm text-white/70 mb-1.5">{t("label_password")}</span>
            <input type="password" value={f.password} onChange={(e) => set("password", e.target.value)} className={INPUT} />
          </label>
        )}

        {f.type === "pago" &&
          (!paidAvailable ? (
            <p className="rounded-xl bg-yellow-400/10 ring-1 ring-yellow-300/30 text-yellow-100 text-sm p-4">
              {t("paid_unavailable")}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="block text-sm text-white/70 mb-1.5">{t("network_label")}</span>
                  <select
                    value={f.network}
                    onChange={(e) => set("network", e.target.value as SupportedNetwork)}
                    className={INPUT}
                  >
                    {ENABLED_NETWORKS.map((n) => (
                      <option key={n} value={n} className="bg-slate-900">
                        {NETWORKS[n].chain.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="block text-sm text-white/70 mb-1.5">{t("entry_label")}</span>
                  <div className="relative">
                    <input
                      inputMode="decimal"
                      value={f.entry}
                      onChange={(e) => set("entry", e.target.value.replace(/[^0-9.,]/g, ""))}
                      placeholder="0.01"
                      className={`${INPUT} pr-14`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 text-sm font-bold">
                      {symbolOf(f.network)}
                    </span>
                  </div>
                </label>
              </div>

              <div>
                <span className="block text-sm text-white/70 mb-1.5">{t("mode_label")}</span>
                <div className="grid grid-cols-2 gap-2">
                  {(["BEAST", "CLASSIC"] as Mode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => set("mode", m)}
                      aria-pressed={f.mode === m}
                      className={`rounded-xl p-3 text-left ring-1 transition ${
                        f.mode !== m
                          ? "bg-white/[0.03] ring-white/10 hover:bg-white/[0.06]"
                          : m === "BEAST"
                            ? "bg-rose-500/15 ring-rose-400"
                            : "bg-indigo-500/15 ring-indigo-400"
                      }`}
                    >
                      <span className="block font-extrabold">{m}</span>
                      <span className="block text-xs text-white/60 mt-0.5">
                        {t(m === "BEAST" ? "beast_description" : "classic_description")}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-xs text-white/50">{t("paid_create_note", { max: MAX_PAID_PLAYERS })}</p>
            </>
          ))}

        <button
          type="submit"
          disabled={!valid || busy}
          className="btn-shine w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-extrabold py-3 rounded-xl text-lg hover:brightness-110 transition disabled:opacity-40"
        >
          {busy
            ? t("creating")
            : f.type === "pago" && entryOk
              ? `${t("create_and_pay")} · ${entry} ${symbolOf(f.network)}`
              : t("create_table")}
        </button>
      </form>
    </Modal>
  );
};

const PasswordModal: React.FC<{ lobbyName: string; onClose: () => void; onSubmit: (pw: string) => void }> = ({
  lobbyName,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const [pw, setPw] = useState("");
  return (
    <Modal title={`🔒 ${lobbyName}`} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (pw) onSubmit(pw);
        }}
        className="space-y-4"
      >
        <label className="block">
          <span className="block text-sm text-white/70 mb-1.5">{t("label_password")}</span>
          <input autoFocus type="password" value={pw} onChange={(e) => setPw(e.target.value)} className={INPUT} />
        </label>
        <button
          type="submit"
          disabled={!pw}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition disabled:opacity-40"
        >
          {t("join_table")}
        </button>
      </form>
    </Modal>
  );
};

export default Lobbies;
