import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { usePokemonData } from "@/hooks/usePokemonData";
import { SoundEngine } from "@/utils/audio";
import { ArrowRight, ArrowDown } from "lucide-react";

const TICKER_ITEMS = [
  "CHOOSE YOUR FIGHTER",
  "PICK YOUR OPPONENT",
  "BUILD THE MATCHUP",
  "YOUR MOVE",
  "OUTPLAY THE CPU",
  "REMATCH",
];

function MiniBar({ value, max, color }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return (
    <div className="h-2 w-full bg-black border border-[#26262b] flex gap-[2px] p-[2px]">
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="flex-1"
          style={{ background: i < Math.round((pct / 100) * 12) ? color : "#1c1c1f" }}
        />
      ))}
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { winStreak, bestStreak, totalBattles, soundEnabled } = useGame();
  const { roster } = usePokemonData();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" || e.code === "Space") {
        if (e.target.tagName !== "BUTTON" && e.target.tagName !== "INPUT" && e.target.tagName !== "A") {
          e.preventDefault();
          if (soundEnabled) SoundEngine.playClick();
          navigate("/select");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, soundEnabled]);

  const previewA = roster[0];
  const previewB = roster[1] || roster[0];

  return (
    <div className="flex flex-col max-w-6xl mx-auto w-full">
      {/* TICKER */}
      <div className="border-y-2 border-[#26262b] bg-[#101012] overflow-hidden mt-2" aria-hidden="true">
        <div className="pb-ticker-track py-1.5">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0">
              {TICKER_ITEMS.map((t) => (
                <span key={`${copy}-${t}`} className="flex items-center font-bebas text-base tracking-[0.18em] text-[#8F8F96] whitespace-nowrap">
                  <span className="px-4">{t}</span>
                  <span className="w-2 h-2 bg-[#E8382A] inline-block" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* HERO — asymmetric, game-first */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch py-8 sm:py-12">
        <div className="lg:col-span-7 flex flex-col justify-center pb-enter">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-8 h-[3px] bg-[#E8382A]" />
            <span className="text-[11px] font-extrabold tracking-[0.3em] text-[#E8382A] uppercase">
              Season 01 — Arcade Terminal
            </span>
          </div>

          <h1 className="font-bebas leading-[0.88] text-[#F2EFE6]">
            <span className="block text-6xl sm:text-8xl tracking-tight">POKÉBATTLE</span>
            <span className="block text-4xl sm:text-6xl mt-2">
              <span className="text-[#F2EFE6]">CHOOSE.</span>{" "}
              <span className="text-[#E8382A]">FIGHT.</span>{" "}
              <span className="text-[#FFC93C]">OUTPLAY.</span>
            </span>
          </h1>

          <p className="mt-4 max-w-md text-[#B9B9BF] text-sm sm:text-base leading-relaxed">
            Pick your fighter. Pick who stands across from you. Call every move — strike, blast, guard, charge — and take the win.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/select"
              onClick={() => soundEnabled && SoundEngine.playClick()}
              className="arcade-btn arcade-btn-red px-8 py-4 text-2xl sm:text-3xl"
            >
              Enter Arena
              <ArrowRight className="w-6 h-6" strokeWidth={3} />
            </Link>
            <Link
              to="/select"
              onClick={() => soundEnabled && SoundEngine.playClick()}
              className="arcade-btn arcade-btn-ghost px-5 py-4 text-xl"
            >
              View Roster
            </Link>
          </div>

          <p className="mt-3 text-[11px] font-bold tracking-[0.22em] text-[#8F8F96] uppercase">
            Press <span className="text-[#F2EFE6] border border-[#3a3a41] px-1.5 py-0.5 ml-1">Enter</span> to start
          </p>
        </div>

        {/* VS PREVIEW — composed HUD, not cards */}
        <div className="lg:col-span-5 pb-enter pb-d2">
          <div className="pb-panel h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b-2 border-[#26262b] bg-[#101012]">
              <span className="tick-label">Featured matchup</span>
              <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-[#2FBF5A] uppercase">
                <span className="w-2 h-2 bg-[#2FBF5A] pb-blink inline-block" /> Live
              </span>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 p-4">
              <div className="text-center">
                <span className="hud-tag hud-tag-red mb-2">You</span>
                <div className="h-28 sm:h-32 flex items-center justify-center bg-[#0A0A0B] border-2 border-[#26262b] relative overflow-hidden">
                  <span className="absolute top-1 left-1.5 text-[10px] font-mono text-[#8F8F96]">P1</span>
                  {previewA ? (
                    <img src={previewA.sprite} alt={previewA.name} className="max-h-24 sm:max-h-28 object-contain animate-idle-player scale-x-[-1]" loading="lazy" />
                  ) : (
                    <span className="font-bebas text-3xl text-[#3a3a41]">???</span>
                  )}
                </div>
                <div className="font-bebas text-2xl text-[#F2EFE6] mt-2 leading-none">{previewA?.name || "—"}</div>
                <div className="mt-1.5 space-y-1">
                  <MiniBar value={previewA?.maxHp || 100} max={180} color="#E8382A" />
                  <MiniBar value={50} max={50} color="#2E7CF6" />
                </div>
              </div>

              <div className="flex flex-col items-center gap-1 px-1">
                <span className="font-bebas text-4xl text-[#F2EFE6] italic">VS</span>
                <span className="w-[2px] h-10 bg-[#26262b]" />
                <span className="text-[10px] font-mono text-[#8F8F96]">BO1</span>
              </div>

              <div className="text-center">
                <span className="hud-tag hud-tag-blue mb-2">CPU</span>
                <div className="h-28 sm:h-32 flex items-center justify-center bg-[#0A0A0B] border-2 border-[#26262b] relative overflow-hidden">
                  <span className="absolute top-1 right-1.5 text-[10px] font-mono text-[#8F8F96]">CPU</span>
                  {previewB ? (
                    <img src={previewB.sprite} alt={previewB.name} className="max-h-24 sm:max-h-28 object-contain animate-idle" loading="lazy" />
                  ) : (
                    <span className="font-bebas text-3xl text-[#3a3a41]">???</span>
                  )}
                </div>
                <div className="font-bebas text-2xl text-[#F2EFE6] mt-2 leading-none">{previewB?.name || "—"}</div>
                <div className="mt-1.5 space-y-1">
                  <MiniBar value={previewB?.maxHp || 100} max={180} color="#E8382A" />
                  <MiniBar value={50} max={50} color="#2E7CF6" />
                </div>
              </div>
            </div>

            <div className="mt-auto px-4 py-3 border-t-2 border-[#26262b] flex items-center justify-between bg-[#101012]">
              <span className="text-[11px] font-bold tracking-[0.2em] text-[#8F8F96] uppercase">You call the matchup</span>
              <ArrowDown className="w-4 h-4 text-[#E8382A]" strokeWidth={3} />
            </div>
          </div>
        </div>
      </section>

      {/* SCOREBOARD — strip, not cards */}
      <section className="pb-enter pb-d3 border-2 border-[#26262b] bg-[#101012] grid grid-cols-3 divide-x-2 divide-[#26262b]" aria-label="Player record">
        <div className="px-4 py-4 sm:py-5 text-center relative">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-[#E8382A]" />
          <div className="tick-label mb-1">Current streak</div>
          <div className="score-num text-4xl sm:text-6xl text-[#FFC93C]">{String(winStreak).padStart(2, "0")}</div>
        </div>
        <div className="px-4 py-4 sm:py-5 text-center relative">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-[#F2EFE6]" />
          <div className="tick-label mb-1">Best streak</div>
          <div className="score-num text-4xl sm:text-6xl text-[#F2EFE6]">{String(bestStreak).padStart(2, "0")}</div>
        </div>
        <div className="px-4 py-4 sm:py-5 text-center relative">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-[#2E7CF6]" />
          <div className="tick-label mb-1">Total battles</div>
          <div className="score-num text-4xl sm:text-6xl text-[#F2EFE6]">{String(totalBattles).padStart(2, "0")}</div>
        </div>
      </section>

      {/* YOUR BATTLE — steps, not feature cards */}
      <section className="mt-8 pb-enter pb-d4">
        <div className="flex items-end justify-between mb-3">
          <h2 className="font-bebas text-3xl sm:text-4xl text-[#F2EFE6] tracking-wide">
            <span className="text-[#E8382A]">/</span> Your battle
          </h2>
          <span className="tick-label hidden sm:block">4 steps — 60 seconds</span>
        </div>
        <ol className="grid grid-cols-2 lg:grid-cols-4 border-2 border-[#26262b] divide-x-2 divide-[#26262b] max-lg:divide-y-2 max-lg:grid-rows-2 max-lg:[&>*:nth-child(3)]:border-l-0 bg-[#131315]">
          {[
            ["01", "Choose your fighter", "Six fighters. One is yours."],
            ["02", "Choose opponent", "You pick who the CPU fields."],
            ["03", "Call your shots", "Strike / blast / guard / charge."],
            ["04", "Take the streak", "Win. Rematch. Run it back."],
          ].map(([n, title, sub]) => (
            <li key={n} className="px-4 py-4 group hover:bg-[#17171a] transition-colors">
              <div className="font-bebas text-xl text-[#E8382A]">{n}</div>
              <div className="font-bebas text-xl sm:text-2xl text-[#F2EFE6] leading-tight uppercase">{title}</div>
              <div className="text-xs text-[#8F8F96] mt-1">{sub}</div>
            </li>
          ))}
        </ol>
      </section>

      {/* ROSTER TEASER — big art, no nested cards */}
      <section className="mt-8 mb-10 pb-enter pb-d5">
        <div className="flex items-end justify-between mb-3">
          <h2 className="font-bebas text-3xl sm:text-4xl text-[#F2EFE6] tracking-wide">
            <span className="text-[#E8382A]">/</span> Tonight's lineup
          </h2>
          <Link
            to="/select"
            onClick={() => soundEnabled && SoundEngine.playClick()}
            className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-[#F2EFE6] border-b-2 border-[#E8382A] pb-0.5 hover:text-[#E8382A] transition-colors"
          >
            Open roster →
          </Link>
        </div>
        <div className="border-2 border-[#26262b] bg-[#131315]">
          <div className="grid grid-cols-3 sm:grid-cols-6 divide-x-2 divide-[#26262b]">
            {roster.slice(0, 6).map((p, i) => (
              <Link
                key={p.name}
                to="/select"
                onClick={() => soundEnabled && SoundEngine.playClick()}
                className="group relative flex flex-col items-center py-4 px-1 hover:bg-[#1a1a1e] transition-colors"
              >
                <span className="text-[10px] font-mono text-[#8F8F96]">#{String(p.pokedexId || i + 1).padStart(3, "0")}</span>
                <img
                  src={p.sprite}
                  alt={p.name}
                  loading="lazy"
                  className="h-16 sm:h-20 object-contain my-1 group-hover:-translate-y-1 group-hover:scale-110 transition-transform duration-200"
                />
                <span className="font-bebas text-lg sm:text-xl text-[#F2EFE6] leading-none">{p.name}</span>
                <span className="text-[10px] font-bold tracking-[0.18em] uppercase mt-1" style={{ color: p.accentColor || "#8F8F96" }}>
                  {(p.types || []).join(" / ")}
                </span>
                <span className="mt-1.5 font-mono text-[10px] text-[#8F8F96]">
                  HP {p.maxHp} · ATK {p.baseDamage}
                </span>
                <span className="absolute bottom-0 left-0 w-full h-[3px] scale-x-0 group-hover:scale-x-100 origin-left transition-transform" style={{ background: p.accentColor || "#E8382A" }} />
              </Link>
            ))}
            {roster.length === 0 &&
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center py-8 px-1">
                  <div className="h-16 w-16 bg-[#1c1c1f] border border-[#26262b] animate-pulse" />
                  <div className="h-3 w-14 bg-[#1c1c1f] mt-2 animate-pulse" />
                </div>
              ))}
          </div>
          <div className="border-t-2 border-[#26262b] px-4 py-2 flex items-center justify-between bg-[#101012]">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#8F8F96]">Keys 1–4 fire moves in battle</span>
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#8F8F96] hidden sm:block">Guard cuts damage · Charge banks energy</span>
          </div>
        </div>
      </section>
    </div>
  );
}
