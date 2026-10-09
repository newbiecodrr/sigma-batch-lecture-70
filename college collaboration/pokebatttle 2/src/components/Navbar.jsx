import { Link, useLocation } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { SoundEngine } from "@/utils/audio";
import { Volume2, VolumeX } from "lucide-react";

function PokeBallMark({ className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="#F2EFE6" strokeWidth="2" />
      <path d="M3 12h6.5M14.5 12H21" stroke="#F2EFE6" strokeWidth="2" />
      <path d="M4.5 8.5C6.5 5.7 9.1 4 12 4c2.9 0 5.5 1.7 7.5 4.5" stroke="#E8382A" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2.6" fill="#0A0A0B" stroke="#F2EFE6" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="1" fill="#E8382A" />
    </svg>
  );
}

export function Navbar() {
  const location = useLocation();
  const { winStreak, bestStreak, totalBattles, soundEnabled, toggleSound } = useGame();

  const handleSoundToggle = () => {
    if (!soundEnabled) SoundEngine.playClick();
    toggleSound();
  };

  const linkCls = (active) =>
    `px-3 py-1.5 font-bebas text-lg tracking-[0.12em] border-2 transition-colors ${
      active
        ? "bg-[#E8382A] text-white border-black shadow-[2px_2px_0_#000]"
        : "text-[#F2EFE6] border-transparent hover:border-[#3a3a41] hover:bg-[#141416]"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-[#0A0A0B]/95 border-b-2 border-[#26262b]">
      {/* thin score ticker line */}
      <div className="h-1 w-full flex">
        <div className="flex-1 bg-[#E8382A]" />
        <div className="flex-1 bg-[#FF6B1A]" />
        <div className="flex-1 bg-[#FFC93C]" />
        <div className="w-24 bg-[#2E7CF6]" />
      </div>
      <div className="mx-auto max-w-6xl flex h-14 items-center justify-between gap-2 px-3 sm:px-5">
        <Link
          to="/"
          onClick={() => soundEnabled && SoundEngine.playClick()}
          className="flex items-center gap-2 shrink-0 group"
          aria-label="PokéBattle home"
        >
          <span className="w-9 h-9 bg-[#E8382A] border-2 border-black shadow-[2px_2px_0_#000] flex items-center justify-center group-active:translate-x-[1px] group-active:translate-y-[1px] group-active:shadow-none transition-all">
            <PokeBallMark className="w-5 h-5" />
          </span>
          <span className="leading-none">
            <span className="font-bebas text-2xl tracking-[0.08em] text-[#F2EFE6] block leading-none">
              POKÉ<span className="text-[#E8382A]">BATTLE</span>
            </span>
            <span className="text-[10px] font-bold tracking-[0.28em] text-[#8F8F96] uppercase block">
              Arcade Terminal
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* compact HUD record — dividers, not cards */}
          <div className="hidden md:flex items-stretch border-2 border-[#26262b] bg-[#101012] text-center" aria-label="Player record">
            <div className="px-3 py-1">
              <div className="tick-label !text-[9px]">Streak</div>
              <div className="score-num text-xl text-[#FFC93C]">{String(winStreak).padStart(2, "0")}</div>
            </div>
            <div className="w-[2px] bg-[#26262b]" />
            <div className="px-3 py-1">
              <div className="tick-label !text-[9px]">Best</div>
              <div className="score-num text-xl text-[#F2EFE6]">{String(bestStreak).padStart(2, "0")}</div>
            </div>
            <div className="w-[2px] bg-[#26262b]" />
            <div className="px-3 py-1">
              <div className="tick-label !text-[9px]">Battles</div>
              <div className="score-num text-xl text-[#F2EFE6]">{String(totalBattles).padStart(2, "0")}</div>
            </div>
          </div>

          {/* mobile streak readout */}
          <div className="md:hidden font-bebas text-lg tracking-widest text-[#FFC93C] border-2 border-[#26262b] px-2 py-0.5 bg-[#101012]">
            {String(winStreak).padStart(2, "0")} W
          </div>

          <nav className="flex items-center gap-1.5" aria-label="Primary">
            <Link to="/select" onClick={() => soundEnabled && SoundEngine.playClick()} className={linkCls(location.pathname === "/select")}>
              Roster
            </Link>
            <Link to="/battle" onClick={() => soundEnabled && SoundEngine.playClick()} className={linkCls(location.pathname === "/battle")}>
              Arena
            </Link>
          </nav>

          <button
            onClick={handleSoundToggle}
            title={soundEnabled ? "Mute sound" : "Enable sound"}
            aria-label={soundEnabled ? "Mute sound" : "Enable sound"}
            className="w-9 h-9 border-2 border-[#3a3a41] bg-[#141416] text-[#F2EFE6] hover:border-[#F2EFE6] flex items-center justify-center transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-[#8F8F96]" />}
          </button>
        </div>
      </div>
    </header>
  );
}
