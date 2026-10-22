import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getUserSession } from "../utils/userSession";
import { getCardImageSrc } from "../utils/gameUtils";
import { useSocket } from "../hooks/useSocket";
import { ENABLED_NETWORKS, NETWORKS, type NetworkKey } from "../config/chains";
import { Avatar } from "../components/Table";
import { CardBack } from "../components/Card";
import type { Card } from "../types/game";

const HAND = [
  { type: "Number", color: "Red", value: "7" },
  { type: "Action", color: "Yellow", value: "Reverse" },
  { type: "Wild", color: "Wild", value: "WildDrawFour" },
  { type: "Action", color: "Blue", value: "Skip" },
  { type: "Number", color: "Green", value: "3" },
] as Card[];
const TOP = { type: "Action", color: "Green", value: "DrawTwo" } as Card;

const STEPS = [
  { n: 1, title: "step1_title", text: "step1_text" },
  { n: 2, title: "step2_title", text: "step2_text" },
  { n: 3, title: "step3_title", text: "step3_text" },
];

export default function Landing() {
  const { t } = useTranslation();
  const { isConnected, activeLobbies } = useSocket();
  const playTo = getUserSession() ? "/lobbies" : "/auth";
  const open = activeLobbies.filter((l) => l.status === "waiting").length;
  const playing = activeLobbies.filter((l) => l.status === "playing").reduce((n, l) => n + l.playerCount, 0);

  return (
    <div className="min-h-[100dvh] page-bg text-white overflow-x-hidden">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex items-center justify-between gap-3 pl-4 pr-28 sm:pl-6 2xl:pr-6 py-4">
        <span className="text-2xl sm:text-3xl font-display tracking-wide whitespace-nowrap logo">{t("title")}</span>
        <Link
          to={playTo}
          className="px-4 py-2 rounded-xl bg-white/10 ring-1 ring-white/15 hover:bg-white/20 text-sm font-bold whitespace-nowrap"
        >
          {t("play_now")}
        </Link>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-12 pb-16 grid lg:grid-cols-2 gap-12 items-center">
        <div className="animate-fade-in text-center lg:text-left">
          {isConnected && (
            <div className="inline-flex items-center gap-2 rounded-full bg-black/30 ring-1 ring-white/10 px-3 py-1 text-xs text-white/80 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {t("live_tables", { count: open })}
              {playing > 0 && ` · ${t("live_playing", { count: playing })}`}
            </div>
          )}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[0.95]">
            {t("hero_title")}
            <span className="block bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent">
              {t("hero_title_accent")}
            </span>
          </h1>
          <p className="mt-6 text-lg text-white/70 max-w-xl mx-auto lg:mx-0">{t("hero_sub")}</p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
            <Link
              to={playTo}
              className="btn-shine bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-extrabold px-8 py-4 rounded-2xl text-lg shadow-xl shadow-orange-500/25 hover:brightness-110 active:scale-[0.98] transition"
            >
              {t("play_now")} →
            </Link>
            <a href="#como" className="px-6 py-4 rounded-2xl ring-1 ring-white/20 hover:bg-white/5 font-semibold">
              {t("how_title")}
            </a>
          </div>
        </div>

        {/* Mesa de muestra */}
        <div className="relative mx-auto w-full max-w-[520px] aspect-[5/4]" aria-hidden>
          <div className="felt absolute inset-x-0 top-[8%] bottom-[18%] rounded-[50%]" />
          {[
            { seed: "Miguelito", cls: "left-[6%] top-[14%]" },
            { seed: "Juana", cls: "left-1/2 -translate-x-1/2 top-0" },
            { seed: "Robotito", cls: "right-[6%] top-[14%]" },
          ].map((s) => (
            <div key={s.seed} className={`absolute flex flex-col items-center gap-1 ${s.cls}`}>
              <div className="flex -space-x-5">
                {[0, 1, 2].map((i) => (
                  <CardBack key={i} size="xs" style={{ transform: `rotate(${(i - 1) * 12}deg)` }} />
                ))}
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-black/50 pl-0.5 pr-2 py-0.5 text-[11px]">
                <Avatar seed={s.seed} size={18} />
                {s.seed}
              </span>
            </div>
          ))}
          <div className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
            <div className="flex items-center gap-4">
              <CardBack size="sm" />
              <img
                src={getCardImageSrc(TOP)}
                alt=""
                className="w-14 sm:w-16 rotate-6 rounded-[10%] shadow-[0_0_0_3px_#22c55e,0_0_30px_4px_#22c55e99] animate-card-drop"
              />
            </div>
            <span className="rounded-full bg-yellow-400 text-black text-xs font-extrabold px-3 py-1 shadow-lg whitespace-nowrap">
              {t("prize_pool")} 0.4 ETH
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex justify-center animate-float">
            {HAND.map((card, i) => (
              <img
                key={i}
                src={getCardImageSrc(card)}
                alt=""
                className={`w-16 sm:w-20 drop-shadow-2xl animate-card-deal ${i ? "-ml-7 sm:-ml-8" : ""} ${i === 2 ? "-translate-y-4" : ""}`}
                style={{ rotate: `${(i - 2) * 8}deg`, animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 scroll-mt-4">
        <h2 className="font-display text-4xl sm:text-5xl text-center mb-10">{t("how_title")}</h2>
        <ol className="grid md:grid-cols-3 gap-4">
          {STEPS.map((s) => (
            <li key={s.n} className="rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-6">
              <span className="w-10 h-10 rounded-full bg-yellow-400 text-black font-extrabold flex items-center justify-center mb-4">
                {s.n}
              </span>
              <h3 className="text-xl font-bold mb-1">{t(s.title)}</h3>
              <p className="text-white/60">{t(s.text)}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Mesas pagas */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="rounded-[2rem] bg-gradient-to-br from-yellow-400/10 via-transparent to-transparent ring-1 ring-yellow-300/20 p-6 sm:p-10 grid lg:grid-cols-[1.1fr_1fr] gap-10">
          <div>
            <span className="text-xs font-bold tracking-widest text-yellow-300 uppercase">💰 {t("paid_kicker")}</span>
            <h2 className="font-display text-4xl sm:text-5xl mt-2 mb-4">{t("paid_title")}</h2>
            <p className="text-white/70 leading-relaxed">{t("paid_text")}</p>
            <div className="mt-6">
              <span className="block text-sm text-white/50 mb-2">{t("networks_label")}</span>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(NETWORKS) as NetworkKey[]).map((n) => (
                  <span
                    key={n}
                    className={`px-3 py-1 rounded-full text-sm ring-1 ${
                      ENABLED_NETWORKS.includes(n) ? "bg-white/10 ring-white/20" : "ring-white/10 text-white/50"
                    }`}
                  >
                    {NETWORKS[n].chain.name}
                  </span>
                ))}
              </div>
              {ENABLED_NETWORKS.length === 0 && <p className="text-xs text-yellow-200/70 mt-2">{t("coming_soon")}</p>}
            </div>
          </div>
          <div className="grid gap-4 content-center">
            {[
              { mode: "BEAST", desc: "beast_description", cls: "from-rose-500/20 ring-rose-400/30", bars: [95] },
              { mode: "CLASSIC", desc: "classic_description", cls: "from-indigo-500/20 ring-indigo-400/30", bars: [60, 20, 15] },
            ].map((m) => (
              <div key={m.mode} className={`rounded-2xl bg-gradient-to-br to-transparent ring-1 p-5 ${m.cls}`}>
                <div className="font-extrabold text-lg">{m.mode}</div>
                <div className="text-sm text-white/60 mb-3">{t(m.desc)}</div>
                <div className="flex h-3 rounded-full overflow-hidden bg-white/10 gap-0.5">
                  {m.bars.map((w, i) => (
                    <div
                      key={i}
                      style={{ width: `${w}%` }}
                      className={["bg-yellow-300", "bg-slate-300", "bg-amber-600"][i]}
                      title={`${i + 1}° · ${w}%`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h2 className="font-display text-4xl sm:text-5xl mb-6">{t("final_cta")}</h2>
        <Link
          to={playTo}
          className="btn-shine inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-extrabold px-10 py-4 rounded-2xl text-lg shadow-xl shadow-orange-500/25 hover:brightness-110 transition"
        >
          {t("play_now")} →
        </Link>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-white/50">
        {t("made_by")}{" "}
        <a href="https://x.com/pimmpi_" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-yellow-300 underline">
          @Alva
        </a>
        {" & "}
        <a
          href="https://x.com/Miguelito_Crypt"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/80 hover:text-yellow-300 underline"
        >
          @Miguelito
        </a>
      </footer>
    </div>
  );
}
