import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePokemonData } from "@/hooks/usePokemonData";
import { useGame } from "@/context/GameContext";
import { SoundEngine } from "@/utils/audio";
import { ArrowRight, Shuffle, Dices, AlertTriangle, Loader2 } from "lucide-react";

/* Compact arcade fighter tile — corner brackets when locked in */
function FighterTile({ pokemon, selected, accent, role, disabled, onPick, dimmed }) {
  const isRed = accent === "red";
  return (
    <button
      type="button"
      onClick={onPick}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`${role === "cpu" ? "Choose CPU opponent" : "Choose your fighter"}: ${pokemon.name}`}
      className={`relative text-left border-2 transition-all duration-150 outline-none cursor-pointer
        focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black
        ${selected
          ? isRed
            ? "bg-[#160f0e] border-[#E8382A] text-white focus-visible:ring-[#E8382A]"
            : "bg-[#0e1218] border-[#2E7CF6] text-white focus-visible:ring-[#2E7CF6]"
          : "bg-[#131315] border-[#26262b] hover:border-[#52525b] hover:-translate-y-0.5 focus-visible:ring-white"
        } ${dimmed ? "opacity-45" : ""}`}
    >
      {selected && (
        <>
          <span className={`select-bracket sb-tl ${isRed ? "text-[#E8382A]" : "text-[#2E7CF6]"}`} />
          <span className={`select-bracket sb-tr ${isRed ? "text-[#E8382A]" : "text-[#2E7CF6]"}`} />
          <span className={`select-bracket sb-bl ${isRed ? "text-[#E8382A]" : "text-[#2E7CF6]"}`} />
          <span className={`select-bracket sb-br ${isRed ? "text-[#E8382A]" : "text-[#2E7CF6]"}`} />
        </>
      )}

      <span className={`absolute top-0 left-0 px-1.5 py-0.5 font-bebas text-xs tracking-[0.14em] ${selected ? (isRed ? "bg-[#E8382A] text-white" : "bg-[#2E7CF6] text-white") : "bg-[#1c1c1f] text-[#8F8F96]"}`}>
        {selected ? "LOCKED IN" : `#${String(pokemon.pokedexId || 0).padStart(3, "0")}`}
      </span>
      <span className="absolute top-1 right-1.5 font-mono text-[10px] text-[#8F8F96]">HP {pokemon.maxHp}</span>

      <span className="flex justify-center pt-7 pb-1 px-2">
        <img
          src={pokemon.sprite}
          alt={pokemon.name}
          loading="lazy"
          className={`h-16 sm:h-20 object-contain transition-transform duration-200 ${selected ? "scale-110" : ""}`}
        />
      </span>

      <span className="block px-2.5 pb-2.5">
        <span className="font-bebas text-xl leading-none text-[#F2EFE6] block">{pokemon.name}</span>
        <span className="text-[10px] font-bold tracking-[0.18em] uppercase block mt-0.5" style={{ color: pokemon.accentColor || "#8F8F96" }}>
          {(pokemon.types || []).join(" / ")}
        </span>
        <span className="flex items-center justify-between mt-1.5 font-mono text-[10px] text-[#8F8F96] border-t border-[#26262b] pt-1.5">
          <span>ATK <strong className="text-[#F2EFE6]">{pokemon.baseDamage}</strong></span>
          <span>DEF <strong className="text-[#F2EFE6]">{pokemon.defense}</strong></span>
          <span>EN <strong className="text-[#F2EFE6]">{pokemon.strongCost}</strong></span>
        </span>
      </span>
    </button>
  );
}

function PreviewStat({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between border-b border-[#26262b] py-1 last:border-0">
      <span className="text-[10px] font-extrabold tracking-[0.2em] uppercase text-[#8F8F96]">{label}</span>
      <span className="font-bebas text-xl leading-none" style={{ color: accent || "#F2EFE6" }}>{value}</span>
    </div>
  );
}

export default function Select() {
  const navigate = useNavigate();
  const { roster, isLoading, isError, refetch } = usePokemonData();
  const { playerPokemon, cpuPokemon, setPlayerPokemon, setCpuPokemon, soundEnabled } = useGame();

  // Explicit match-setup state: WHO is fighting (CPU AI only decides moves later)
  const [playerSelection, setPlayerSelection] = useState(null);
  const [opponentSelection, setOpponentSelection] = useState(null);
  const [error, setError] = useState("");

  // Init once from roster (restore previous context picks by name when possible)
  useEffect(() => {
    if (roster.length === 0 || playerSelection) return;
    const prevPlayer = playerPokemon ? roster.find((p) => p.name === playerPokemon.name) : null;
    const prevCpu = cpuPokemon ? roster.find((p) => p.name === cpuPokemon.name) : null;
    const p = prevPlayer || roster[0];
    let c = prevCpu && prevCpu.name !== p.name ? prevCpu : roster.find((x) => x.name !== p.name) || roster[0];
    setPlayerSelection(p);
    setOpponentSelection(c);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roster]);

  const click = () => soundEnabled && SoundEngine.playClick();

  const handlePlayerSelect = (pokemon) => {
    click();
    setError("");
    setPlayerSelection(pokemon);
  };

  const handleCpuSelect = (pokemon) => {
    click();
    setError("");
    setOpponentSelection(pokemon);
  };

  // Random OPPONENT only — never touches the player's fighter
  const handleRandomOpponent = () => {
    if (roster.length < 2 || !playerSelection) return;
    click();
    setError("");
    const pool = roster.filter((p) => p.name !== playerSelection.name);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setOpponentSelection(pick);
  };

  const handleRandomMatchup = () => {
    if (roster.length < 2) return;
    click();
    setError("");
    const i = Math.floor(Math.random() * roster.length);
    const rest = roster.filter((_, idx) => idx !== i);
    setPlayerSelection(roster[i]);
    setOpponentSelection(rest[Math.floor(Math.random() * rest.length)]);
  };

  const isMirror = Boolean(
    playerSelection && opponentSelection && playerSelection.name === opponentSelection.name
  );

  const handleConfirm = () => {
    if (!playerSelection || !opponentSelection) {
      setError("Pick a fighter AND an opponent first.");
      return;
    }
    if (isMirror) {
      setError("Mirror match blocked — your opponent must differ from your fighter.");
      return;
    }
    if (soundEnabled) SoundEngine.playStrongHit();
    // Fresh clones → battle engine always starts clean (no HP/energy leak)
    setPlayerPokemon(playerSelection.clone());
    setCpuPokemon(opponentSelection.clone());
    navigate("/battle");
  };

  if (isLoading) {
    return (
      <div className="py-8 max-w-6xl mx-auto w-full">
        <div className="border-2 border-[#26262b] bg-[#101012] px-4 py-3 flex items-center gap-3">
          <Loader2 className="w-4 h-4 animate-spin text-[#E8382A]" />
          <span className="font-bebas text-2xl tracking-widest text-[#F2EFE6]">Loading roster…</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border-2 border-[#26262b] bg-[#131315] h-48 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError && roster.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 border-2 border-[#E8382A] bg-[#160f0e] max-w-md mx-auto my-12">
        <AlertTriangle className="w-10 h-10 text-[#E8382A] mb-3" />
        <h3 className="font-bebas text-3xl text-[#F2EFE6]">Roster sync failed</h3>
        <p className="text-[#8F8F96] text-sm mb-5">Could not reach the Pokémon registry. Check connection and retry.</p>
        <button onClick={refetch} className="arcade-btn arcade-btn-red px-6 py-3 text-xl">
          Retry sync
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full pb-10">
      {/* header */}
      <div className="pt-4 pb-enter">
        <div className="flex items-center gap-2">
          <span className="w-8 h-[3px] bg-[#E8382A]" />
          <span className="text-[11px] font-extrabold tracking-[0.3em] text-[#E8382A] uppercase">Arena setup</span>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3 mt-1">
          <h1 className="font-bebas text-4xl sm:text-6xl text-[#F2EFE6] leading-none">Build your match</h1>
          <div className="flex items-center gap-2 text-[11px] font-extrabold tracking-[0.2em] uppercase text-[#8F8F96]">
            <span className="text-[#E8382A]">01 You</span>
            <span>/</span>
            <span className="text-[#2E7CF6]">02 CPU</span>
            <span>/</span>
            <span>03 Fight</span>
          </div>
        </div>
      </div>

      {/* MATCHUP HUD */}
      <div className="mt-4 border-2 border-black shadow-[4px_4px_0_#000] pb-enter pb-d1">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr]">
          {/* YOU preview */}
          <div className="bg-[#160f0e] border-b-2 md:border-b-0 md:border-r-2 border-black p-4">
            <span className="hud-tag hud-tag-red">Your fighter</span>
            {playerSelection ? (
              <div className="flex gap-4 mt-3 items-center">
                <div className="w-28 h-28 sm:w-32 sm:h-32 shrink-0 bg-[#0A0A0B] border-2 border-[#E8382A] flex items-center justify-center relative">
                  <span className="absolute top-1 left-1.5 text-[10px] font-mono text-[#8F8F96]">P1</span>
                  <img key={playerSelection.name} src={playerSelection.sprite} alt={playerSelection.name} className="max-h-24 sm:max-h-28 object-contain scale-x-[-1] animate-idle-player pb-pop" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bebas text-3xl text-[#F2EFE6] leading-none truncate">{playerSelection.name}</div>
                  <div className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: playerSelection.accentColor }}>
                    {(playerSelection.types || []).join(" / ")}
                  </div>
                  <div className="mt-2">
                    <PreviewStat label="HP" value={playerSelection.maxHp} />
                    <PreviewStat label="Attack" value={playerSelection.baseDamage} />
                    <PreviewStat label="Defense" value={playerSelection.defense} />
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-[#8F8F96] text-sm">Pick a fighter below.</p>
            )}
          </div>

          {/* VS + confirm controls */}
          <div className="bg-[#0A0A0B] px-4 py-4 flex md:flex-col items-center justify-center gap-3 border-b-2 md:border-b-0 md:border-x-2 border-black min-w-[220px]">
            <span className="font-bebas text-5xl italic text-[#F2EFE6] leading-none">VS</span>
            <div className="flex md:flex-col gap-2 w-full">
              <button onClick={handleRandomOpponent} className="arcade-btn arcade-btn-ghost px-4 py-2.5 text-lg flex-1 whitespace-nowrap" title="Pick a random CPU opponent (keeps your fighter)">
                <Shuffle className="w-4 h-4" strokeWidth={2.5} /> Random foe
              </button>
              <button onClick={handleConfirm} className="arcade-btn arcade-btn-red px-6 py-2.5 text-xl flex-1 whitespace-nowrap">
                Fight <ArrowRight className="w-5 h-5" strokeWidth={3} />
              </button>
            </div>
            {error || isMirror ? (
              <p role="alert" className="text-[11px] font-bold tracking-wide uppercase text-[#FFC93C] border border-[#FFC93C] bg-black px-2 py-1 text-center">
                {error || "Mirror match blocked — change one side."}
              </p>
            ) : (
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#8F8F96] text-center">
                {playerSelection && opponentSelection ? `${playerSelection.name} vs ${opponentSelection.name}` : "Awaiting picks"}
              </p>
            )}
          </div>

          {/* CPU preview */}
          <div className="bg-[#0e1218] border-black p-4">
            <span className="hud-tag hud-tag-blue">CPU opponent</span>
            {opponentSelection ? (
              <div className="flex gap-4 mt-3 items-center">
                <div className="w-28 h-28 sm:w-32 sm:h-32 shrink-0 bg-[#0A0A0B] border-2 border-[#2E7CF6] flex items-center justify-center relative">
                  <span className="absolute top-1 right-1.5 text-[10px] font-mono text-[#8F8F96]">CPU</span>
                  <img key={opponentSelection.name} src={opponentSelection.sprite} alt={opponentSelection.name} className="max-h-24 sm:max-h-28 object-contain animate-idle pb-pop" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bebas text-3xl text-[#F2EFE6] leading-none truncate">{opponentSelection.name}</div>
                  <div className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: opponentSelection.accentColor }}>
                    {(opponentSelection.types || []).join(" / ")}
                  </div>
                  <div className="mt-2">
                    <PreviewStat label="HP" value={opponentSelection.maxHp} />
                    <PreviewStat label="Attack" value={opponentSelection.baseDamage} />
                    <PreviewStat label="Defense" value={opponentSelection.defense} />
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-[#8F8F96] text-sm">Pick an opponent below.</p>
            )}
          </div>
        </div>
      </div>

      {/* YOUR FIGHTER grid */}
      <section className="mt-8 pb-enter pb-d2" aria-label="Choose your fighter">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bebas text-3xl sm:text-4xl text-[#F2EFE6]">
            <span className="inline-block w-7 text-center bg-[#E8382A] text-white mr-2 border-2 border-black shadow-[2px_2px_0_#000]">1</span>
            Your fighter
          </h2>
          <button onClick={handleRandomMatchup} className="text-[11px] font-extrabold tracking-[0.2em] uppercase text-[#8F8F96] hover:text-[#F2EFE6] transition-colors flex items-center gap-1.5">
            <Dices className="w-4 h-4" /> Shuffle both
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {roster.map((p) => (
            <FighterTile
              key={`you-${p.name}`}
              pokemon={p}
              role="player"
              accent="red"
              selected={playerSelection?.name === p.name}
              dimmed={opponentSelection?.name === p.name && playerSelection?.name !== p.name}
              onPick={() => handlePlayerSelect(p)}
            />
          ))}
        </div>
      </section>

      {/* CPU OPPONENT grid */}
      <section className="mt-8 pb-enter pb-d3" aria-label="Choose CPU opponent">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h2 className="font-bebas text-3xl sm:text-4xl text-[#F2EFE6]">
            <span className="inline-block w-7 text-center bg-[#2E7CF6] text-white mr-2 border-2 border-black shadow-[2px_2px_0_#000]">2</span>
            CPU opponent
          </h2>
          <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#8F8F96]">
            You pick who it fields — it calls its own moves
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {roster.map((p) => (
            <FighterTile
              key={`cpu-${p.name}`}
              pokemon={p}
              role="cpu"
              accent="blue"
              selected={opponentSelection?.name === p.name}
              dimmed={playerSelection?.name === p.name && opponentSelection?.name !== p.name}
              onPick={() => handleCpuSelect(p)}
            />
          ))}
        </div>
        <p className="mt-2 text-[11px] font-bold tracking-[0.18em] uppercase text-[#8F8F96]">
          Dimmed = your current fighter. Mirror matches are blocked at confirm.
        </p>
      </section>
    </div>
  );
}
