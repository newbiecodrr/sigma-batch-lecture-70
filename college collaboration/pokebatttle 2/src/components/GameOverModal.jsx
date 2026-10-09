import { Trophy, Skull, RotateCcw, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { SoundEngine } from "@/utils/audio";

export default function GameOverModal({
  isWinner,
  playerPokemon,
  cpuPokemon,
  turns,
  totalDamageDealt,
  winStreak,
  bestStreak,
  onRematch,
  soundEnabled = true,
}) {
  const handleRematch = () => {
    if (soundEnabled) SoundEngine.playClick();
    onRematch();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div
        className={`w-full max-w-lg text-center relative border-2 border-black shadow-[6px_6px_0_#000] pb-pop ${
          isWinner ? "bg-[#141310]" : "bg-[#141416]"
        }`}
      >
        <div className={`h-2 w-full ${isWinner ? "bg-[#FFC93C]" : "bg-[#E8382A]"}`} />
        <div className="p-6 sm:p-8">
          <div
            className={`w-16 h-16 mx-auto flex items-center justify-center border-2 border-black shadow-[3px_3px_0_#000] mb-4 ${
              isWinner ? "bg-[#FFC93C] text-black" : "bg-[#E8382A] text-white"
            }`}
          >
            {isWinner ? <Trophy className="w-8 h-8" strokeWidth={2.5} /> : <Skull className="w-8 h-8" strokeWidth={2.5} />}
          </div>

          <p className="tick-label mb-1">{isWinner ? "Match result" : "Match result"}</p>
          <h2 className="font-bebas text-6xl tracking-wide text-[#F2EFE6] leading-none">
            {isWinner ? "Victory" : "Defeat"}
          </h2>
          <p className="text-[#B9B9BF] text-sm mt-2 max-w-sm mx-auto">
            {isWinner
              ? `${playerPokemon.name} takes down ${cpuPokemon.name}. The streak lives on.`
              : `${playerPokemon.name} went down to ${cpuPokemon.name}. Run it back.`}
          </p>

          <div className="grid grid-cols-3 divide-x-2 divide-[#26262b] border-2 border-[#26262b] bg-[#0A0A0B] my-6 text-xs">
            <div className="py-3">
              <span className="tick-label !text-[9px] block mb-1">Turns</span>
              <span className="font-bebas text-3xl text-[#F2EFE6]">{turns}</span>
            </div>
            <div className="py-3">
              <span className="tick-label !text-[9px] block mb-1">Damage</span>
              <span className="font-bebas text-3xl text-[#E8382A]">{totalDamageDealt}</span>
            </div>
            <div className="py-3">
              <span className="tick-label !text-[9px] block mb-1">Streak · Best {bestStreak}</span>
              <span className="font-bebas text-3xl text-[#FFC93C]">{winStreak}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <button onClick={handleRematch} className="arcade-btn arcade-btn-red flex-1 py-3 text-2xl">
              <RotateCcw className="w-5 h-5" strokeWidth={2.75} /> Rematch
            </button>
            <Link
              to="/select"
              onClick={() => soundEnabled && SoundEngine.playClick()}
              className="arcade-btn arcade-btn-ghost flex-1 py-3 text-2xl"
            >
              <Users className="w-5 h-5" strokeWidth={2.5} /> New matchup
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
