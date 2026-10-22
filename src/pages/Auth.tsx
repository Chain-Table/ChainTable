import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { createUserSession, getUserSession } from "../utils/userSession";
import { displayName, getCardImageSrc } from "../utils/gameUtils";
import type { Card } from "../types/game";
import { useTranslation } from "react-i18next";

// Mismas reglas que el server (server.js identity)
const isValidAlias = (a: string) => a.length >= 2 && a.length <= 20 && !/^0x[0-9a-f]{4,}/i.test(a);

const HERO_CARDS = [
  { type: "Number", color: "Red", value: "7" },
  { type: "Action", color: "Blue", value: "Skip" },
  { type: "Wild", color: "Wild", value: "WildDrawFour" },
] as Card[];

export default function Auth() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { address } = useAccount();
  const previous = getUserSession()?.username ?? "";
  const [alias, setAlias] = useState(/^0x/i.test(previous) ? "" : previous);
  const trimmed = alias.trim();
  const aliasOk = isValidAlias(trimmed);

  const enter = () => {
    // Con wallet conectada el alias es opcional: sin alias, el nombre es la wallet
    if (!aliasOk && !address) return;
    createUserSession(aliasOk ? trimmed : address!, address ?? "");
    navigate("/lobbies");
  };

  return (
    <div className="min-h-[100dvh] page-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex -space-x-6 mb-4">
            {HERO_CARDS.map((card, i) => (
              <img
                key={i}
                src={getCardImageSrc(card)}
                alt=""
                className="w-16 drop-shadow-2xl"
                style={{ transform: `rotate(${(i - 1) * 12}deg) translateY(${i === 1 ? -6 : 0}px)` }}
              />
            ))}
          </div>
          <h1 className="text-5xl font-extrabold text-white font-jersey tracking-wide">{t("title")}</h1>
          <p className="text-emerald-200/70 text-sm mt-1">{t("auth_brandline")}</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            enter();
          }}
          className="bg-black/40 backdrop-blur-xl p-6 sm:p-8 rounded-3xl ring-1 ring-white/10 shadow-2xl space-y-5"
        >
          <div>
            <label htmlFor="alias" className="block text-sm font-semibold text-white mb-2">
              {t("auth_alias_label")}
            </label>
            <input
              id="alias"
              autoFocus
              maxLength={20}
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder={t("auth_alias_placeholder")}
              className="w-full bg-white/5 ring-1 ring-white/15 rounded-xl px-4 py-3 text-white text-lg placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            {trimmed && !aliasOk && <p className="text-red-300 text-xs mt-2">{t("auth_alias_invalid")}</p>}
          </div>

          <button
            type="submit"
            disabled={!aliasOk && !address}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-extrabold py-3 rounded-xl text-lg shadow-lg shadow-orange-500/20 hover:brightness-110 active:scale-[0.99] transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {aliasOk || !address ? t("play_now") : t("auth_continue_with_wallet")}
          </button>

          <div className="flex items-center gap-3 text-white/40 text-xs uppercase tracking-widest">
            <span className="h-px flex-1 bg-white/10" />
            {t("auth_wallet_optional")}
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <ConnectButton.Custom>
            {({ mounted, account, openConnectModal, openAccountModal }) =>
              mounted && account ? (
                <button
                  type="button"
                  onClick={openAccountModal}
                  className="w-full flex items-center justify-between gap-3 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-400/40 px-4 py-3 text-left"
                >
                  <span className="flex items-center gap-2 text-emerald-200 text-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {t("wallet_connected")}
                  </span>
                  <span className="font-mono text-white text-sm">{displayName(account.address)}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openConnectModal}
                  className="w-full rounded-xl ring-1 ring-white/20 hover:ring-white/40 hover:bg-white/5 text-white font-semibold py-3 transition"
                >
                  {t("auth_connect_wallet")}
                </button>
              )
            }
          </ConnectButton.Custom>

          <p className="text-white/50 text-xs text-center leading-relaxed">{t("auth_wallet_prompt")}</p>
        </form>
      </div>
    </div>
  );
}
