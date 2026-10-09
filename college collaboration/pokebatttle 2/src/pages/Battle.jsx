import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "@/context/GameContext";
import { usePokemonData } from "@/hooks/usePokemonData";
import StatBar from "@/components/StatBar";
import BattleLog from "@/components/BattleLog";
import DamageNumber from "@/components/DamageNumber";
import GameOverModal from "@/components/GameOverModal";
import { SoundEngine } from "@/utils/audio";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function Battle() {
  const navigate = useNavigate();
  const { roster } = usePokemonData();
  const {
    playerPokemon,
    cpuPokemon,
    setPlayerPokemon,
    setCpuPokemon,
    winStreak,
    bestStreak,
    recordWin,
    recordLoss,
    soundEnabled,
  } = useGame();

  // Pokemon battle instance pointers (keeps object references stable during turns)
  const playerRef = useRef(null);
  const cpuRef = useRef(null);

  // HP and stamina bars state
  const [playerHp, setPlayerHp] = useState(100);
  const [playerEnergy, setPlayerEnergy] = useState(50);
  const [playerDefending, setPlayerDefending] = useState(false);

  const [cpuHp, setCpuHp] = useState(100);
  const [cpuEnergy, setCpuEnergy] = useState(50);
  const [cpuDefending, setCpuDefending] = useState(false);

  const [turn, setTurn] = useState("player");
  const [turnCount, setTurnCount] = useState(1);
  const [totalPlayerDamage, setTotalPlayerDamage] = useState(0);

  const [battleLogs, setBattleLogs] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWinner, setIsWinner] = useState(false);

  // Combat animation flags
  const [playerLunge, setPlayerLunge] = useState(false);
  const [cpuLunge, setCpuLunge] = useState(false);
  const [playerHit, setPlayerHit] = useState(false);
  const [cpuHit, setCpuHit] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [playerFaint, setPlayerFaint] = useState(false);
  const [cpuFaint, setCpuFaint] = useState(false);

  // Floating damage number popup data
  const [playerDamageEvent, setPlayerDamageEvent] = useState(null);
  const [cpuDamageEvent, setCpuDamageEvent] = useState(null);

  // Battle reset and setup logic (match start & rematch)
  const initializeBattle = useCallback(() => {
    let p = playerPokemon;
    let c = cpuPokemon;

    // agar user ne direct URL khol li bina roster select kiye toh fallback default load karo
    if (!p && roster.length > 0) {
      p = roster[0].clone();
      setPlayerPokemon(p);
    }
    if (!c && roster.length > 1) {
      c = roster[1].clone();
      setCpuPokemon(c);
    }

    if (p && c) {
      // fresh clones taaki original roster ke stats modify na ho
      const pClone = p.clone();
      const cClone = c.clone();
      pClone.reset();
      cClone.reset();

      playerRef.current = pClone;
      cpuRef.current = cClone;

      setPlayerHp(pClone.currentHp);
      setPlayerEnergy(pClone.energy);
      setPlayerDefending(false);

      setCpuHp(cClone.currentHp);
      setCpuEnergy(cClone.energy);
      setCpuDefending(false);

      setTurn("player");
      setTurnCount(1);
      setTotalPlayerDamage(0);
      setIsGameOver(false);
      setIsWinner(false);
      setPlayerFaint(false);
      setCpuFaint(false);

      setBattleLogs([
        {
          turn: 1,
          isPlayer: true,
          message: `Battle started: ${pClone.name} vs ${cClone.name}! Choose your move.`,
        },
      ]);
    }
  }, [playerPokemon, cpuPokemon, roster, setPlayerPokemon, setCpuPokemon]);

  useEffect(() => {
    initializeBattle();
  }, [initializeBattle]);

  // Ref objects se updated HP/Energy React UI states me sync karna
  const syncGameState = () => {
    if (playerRef.current && cpuRef.current) {
      setPlayerHp(playerRef.current.currentHp);
      setPlayerEnergy(playerRef.current.energy);
      setPlayerDefending(playerRef.current.isDefending);

      setCpuHp(cpuRef.current.currentHp);
      setCpuEnergy(cpuRef.current.energy);
      setCpuDefending(cpuRef.current.isDefending);
    }
  };

  // Heavy attack or critical hit pe screen shake trigger
  const triggerScreenShake = (isHeavy = false) => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), isHeavy ? 400 : 250);
  };

  // User action handler (Weak attack, Heavy attack, Guard, Charge)
  const handlePlayerAction = (actionType) => {
    if (turn !== "player" || isGameOver || !playerRef.current || !cpuRef.current) return;

    const player = playerRef.current;
    const cpu = cpuRef.current;
    let result = null;

    if (actionType === "weak") {
      setPlayerLunge(true);
      setTimeout(() => setPlayerLunge(false), 400);

      result = player.weakAttack(cpu);

      if (soundEnabled) SoundEngine.playWeakHit();

      // CPU hit reaction and damage popup
      setCpuHit(true);
      setTimeout(() => setCpuHit(false), 350);

      setCpuDamageEvent({
        value: result.damage,
        isCrit: result.isCrit,
        isBlocked: cpuDefending,
      });
      setTimeout(() => setCpuDamageEvent(null), 1000);

      setTotalPlayerDamage((prev) => prev + result.damage);

      if (result.isCrit) triggerScreenShake(false);
    } else if (actionType === "strong") {
      if (player.energy < player.strongCost) return; // energy nahi hai toh attack cancel

      setPlayerLunge(true);
      setTimeout(() => setPlayerLunge(false), 450);

      result = player.strongAttack(cpu);

      if (soundEnabled) SoundEngine.playStrongHit();

      setCpuHit(true);
      setTimeout(() => setCpuHit(false), 400);

      setCpuDamageEvent({
        value: result.damage,
        isCrit: result.isCrit,
        isBlocked: cpuDefending,
      });
      setTimeout(() => setCpuDamageEvent(null), 1000);

      setTotalPlayerDamage((prev) => prev + result.damage);
      triggerScreenShake(true);
    } else if (actionType === "defend") {
      result = player.defend();
      if (soundEnabled) SoundEngine.playDefend();

      setPlayerDamageEvent({
        isEnergy: true,
        value: result.energyGained,
      });
      setTimeout(() => setPlayerDamageEvent(null), 1000);
    } else if (actionType === "charge") {
      result = player.chargeEnergy();
      if (soundEnabled) SoundEngine.playCharge();

      setPlayerDamageEvent({
        isEnergy: true,
        value: result.energyGained,
      });
      setTimeout(() => setPlayerDamageEvent(null), 1000);
    }

    if (result) {
      syncGameState();

      // Combat feed log me message append karo
      setBattleLogs((prev) => [
        ...prev,
        {
          turn: turnCount,
          isPlayer: true,
          action: result.action,
          isCrit: result.isCrit,
          message: result.message,
        },
      ]);

      // Check karo agar CPU faint ho gaya toh match finish
      if (cpu.isFainted()) {
        setCpuFaint(true);
        setTimeout(() => {
          setIsWinner(true);
          setIsGameOver(true);
          recordWin();
          if (soundEnabled) SoundEngine.playVictory();
        }, 800);
      } else {
        setTurn("cpu"); // pass turn to AI
      }
    }
  };

  // CPU AI turn loop with a natural thinking delay
  useEffect(() => {
    if (turn === "cpu" && !isGameOver && playerRef.current && cpuRef.current) {
      const cpu = cpuRef.current;
      const player = playerRef.current;

      // 1.1s natural pause taaki turn automatic na lage
      const cpuTimer = setTimeout(() => {
        const chosenAction = cpu.getComputerMove(player);
        let result = null;

        if (chosenAction === "weak") {
          setCpuLunge(true);
          setTimeout(() => setCpuLunge(false), 400);

          result = cpu.weakAttack(player);
          if (soundEnabled) SoundEngine.playWeakHit();

          setPlayerHit(true);
          setTimeout(() => setPlayerHit(false), 350);

          setPlayerDamageEvent({
            value: result.damage,
            isCrit: result.isCrit,
            isBlocked: playerDefending,
          });
          setTimeout(() => setPlayerDamageEvent(null), 1000);

          if (result.isCrit) triggerScreenShake(false);
        } else if (chosenAction === "strong") {
          setCpuLunge(true);
          setTimeout(() => setCpuLunge(false), 450);

          result = cpu.strongAttack(player);
          if (soundEnabled) SoundEngine.playStrongHit();

          setPlayerHit(true);
          setTimeout(() => setPlayerHit(false), 400);

          setPlayerDamageEvent({
            value: result.damage,
            isCrit: result.isCrit,
            isBlocked: playerDefending,
          });
          setTimeout(() => setPlayerDamageEvent(null), 1000);

          triggerScreenShake(true);
        } else if (chosenAction === "defend") {
          result = cpu.defend();
          if (soundEnabled) SoundEngine.playDefend();

          setCpuDamageEvent({
            isEnergy: true,
            value: result.energyGained,
          });
          setTimeout(() => setCpuDamageEvent(null), 1000);
        } else if (chosenAction === "charge") {
          result = cpu.chargeEnergy();
          if (soundEnabled) SoundEngine.playCharge();

          setCpuDamageEvent({
            isEnergy: true,
            value: result.energyGained,
          });
          setTimeout(() => setCpuDamageEvent(null), 1000);
        }

        if (result) {
          syncGameState();

          setBattleLogs((prev) => [
            ...prev,
            {
              turn: turnCount,
              isPlayer: false,
              action: result.action,
              isCrit: result.isCrit,
              message: result.message,
            },
          ]);

          // Agar player ki health 0 ho gayi toh defeat modal khol do
          if (player.isFainted()) {
            setPlayerFaint(true);
            setTimeout(() => {
              setIsWinner(false);
              setIsGameOver(true);
              recordLoss();
              if (soundEnabled) SoundEngine.playDefeat();
            }, 800);
          } else {
            setTurn("player");
            setTurnCount((prev) => prev + 1);
          }
        }
      }, 1100);

      return () => clearTimeout(cpuTimer);
    }
  }, [turn, isGameOver, turnCount, soundEnabled, playerDefending, recordLoss, recordWin]);

  // Keyboard number shortcuts (1-4 keys for quick actions)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (turn !== "player" || isGameOver) return;
      if (e.key === "1") handlePlayerAction("weak");
      if (e.key === "2") handlePlayerAction("strong");
      if (e.key === "3") handlePlayerAction("defend");
      if (e.key === "4") handlePlayerAction("charge");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, isGameOver, playerEnergy]);

  if (!playerRef.current || !cpuRef.current) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#E8382A] animate-spin" />
        <p className="font-bebas text-2xl tracking-[0.14em] text-[#F2EFE6]">Staging arena…</p>
      </div>
    );
  }

  const playerObj = playerRef.current;
  const cpuObj = cpuRef.current;
  const canUseStrong = playerEnergy >= playerObj.strongCost && turn === "player" && !isGameOver;
  const playerTurn = turn === "player" && !isGameOver;

  const moveBtn = (active, hoverBorder) =>
    `text-left border-2 p-3 sm:p-4 flex flex-col justify-between gap-2 transition-all duration-150 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
      active
        ? `bg-[#131315] border-[#26262b] ${hoverBorder} hover:-translate-y-0.5 shadow-[3px_3px_0_#000]`
        : "bg-[#101012] border-[#1c1c1f] opacity-40 pointer-events-none"
    } active:translate-x-[2px] active:translate-y-[2px] active:shadow-none`;

  return (
    <div className={`max-w-6xl mx-auto w-full flex flex-col pb-8 ${screenShake ? "animate-shake" : ""}`}>
      {/* Arena header */}
      <div className="flex items-center justify-between gap-2 py-3 border-b-2 border-[#26262b] pb-enter">
        <button
          onClick={() => navigate("/select")}
          className="arcade-btn arcade-btn-ghost px-3 py-1.5 text-base"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2.75} /> Roster
        </button>

        {playerTurn ? (
          <span className="hud-tag hud-tag-red !text-xs !px-3 !py-1.5">
            <span className="w-2 h-2 bg-white pb-blink inline-block" /> Your move
          </span>
        ) : (
          <span className="hud-tag hud-tag-yellow !text-xs !px-3 !py-1.5">
            <span className="w-2 h-2 bg-black pb-blink inline-block" /> CPU thinking
          </span>
        )}

        <span className="font-bebas text-xl tracking-[0.12em] text-[#F2EFE6]">
          Turn <span className="text-[#E8382A]">{String(turnCount).padStart(2, "0")}</span>
        </span>
      </div>

      {/* Fighter HUDs */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 mt-4 items-stretch">
        {/* YOU */}
        <div className="border-2 border-black shadow-[4px_4px_0_#000] pb-enter-left">
          <div className="bg-[#E8382A] px-3 py-1.5 flex items-center justify-between border-b-2 border-black">
            <span className="font-bebas text-xl tracking-[0.14em] text-white">You — {playerObj.name}</span>
            <span className="text-[10px] font-extrabold tracking-[0.2em] text-white/85 uppercase">{(playerObj.types || []).join(" / ")}</span>
          </div>
          <div className="bg-[#131315] p-3 sm:p-4 space-y-2.5">
            <StatBar label="HP" current={playerHp} max={playerObj.maxHp} type="hp" isDefending={playerDefending} />
            <StatBar label="Energy" current={playerEnergy} max={playerObj.maxEnergy} type="energy" />
            <div className="relative h-32 sm:h-44 flex items-center justify-center bg-[#0A0A0B] border-2 border-[#26262b] overflow-hidden">
              <DamageNumber event={playerDamageEvent} />
              <span className="absolute top-1 left-1.5 text-[10px] font-mono text-[#8F8F96]">P1</span>
              <span className="absolute bottom-2 w-28 sm:w-36 h-[3px] bg-[#26262b]" />
              <img
                src={playerObj.sprite}
                alt={playerObj.name}
                className={`relative max-h-28 sm:max-h-36 object-contain scale-x-[-1] ${
                  playerLunge ? "animate-lunge-player" : ""
                } ${playerHit ? "animate-hit-player" : ""} ${
                  playerFaint ? "animate-faint-player" : "animate-idle-player"
                }`}
              />
            </div>
          </div>
        </div>

        {/* VS divider */}
        <div className="hidden md:flex flex-col items-center justify-center gap-2 px-1">
          <span className="font-bebas text-5xl italic text-[#F2EFE6]">VS</span>
          <span className="w-[2px] flex-1 bg-[#26262b] min-h-10" />
          <span className="text-[10px] font-mono text-[#8F8F96]">BO1</span>
        </div>
        <div className="md:hidden flex items-center gap-3 justify-center py-1">
          <span className="h-[2px] flex-1 bg-[#26262b]" />
          <span className="font-bebas text-3xl italic text-[#F2EFE6]">VS</span>
          <span className="h-[2px] flex-1 bg-[#26262b]" />
        </div>

        {/* CPU */}
        <div className="border-2 border-black shadow-[4px_4px_0_#000] pb-enter-right">
          <div className="bg-[#2E7CF6] px-3 py-1.5 flex items-center justify-between border-b-2 border-black">
            <span className="font-bebas text-xl tracking-[0.14em] text-white">CPU — {cpuObj.name}</span>
            <span className="text-[10px] font-extrabold tracking-[0.2em] text-white/85 uppercase">{(cpuObj.types || []).join(" / ")}</span>
          </div>
          <div className="bg-[#131315] p-3 sm:p-4 space-y-2.5">
            <StatBar label="HP" current={cpuHp} max={cpuObj.maxHp} type="hp" isDefending={cpuDefending} />
            <StatBar label="Energy" current={cpuEnergy} max={cpuObj.maxEnergy} type="energy" />
            <div className="relative h-32 sm:h-44 flex items-center justify-center bg-[#0A0A0B] border-2 border-[#26262b] overflow-hidden">
              <DamageNumber event={cpuDamageEvent} />
              <span className="absolute top-1 right-1.5 text-[10px] font-mono text-[#8F8F96]">CPU</span>
              <span className="absolute bottom-2 w-28 sm:w-36 h-[3px] bg-[#26262b]" />
              <img
                src={cpuObj.sprite}
                alt={cpuObj.name}
                className={`relative max-h-28 sm:max-h-36 object-contain ${
                  cpuLunge ? "animate-lunge-cpu" : ""
                } ${cpuHit ? "animate-hit-flash" : ""} ${
                  cpuFaint ? "animate-faint" : "animate-idle"
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Moves + feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mt-4">
        <div className="lg:col-span-7 grid grid-cols-2 gap-2.5 pb-enter pb-d2">
          <button
            type="button"
            disabled={!playerTurn}
            onClick={() => handlePlayerAction("weak")}
            aria-label={`Weak attack ${playerObj.moves.weak}`}
            className={moveBtn(playerTurn, "hover:border-[#E8382A]")}
          >
            <span className="flex items-center justify-between">
              <span className="w-6 h-6 bg-[#E8382A] text-white flex items-center justify-center font-mono text-xs font-bold border border-black">1</span>
              <span className="text-[11px] font-mono text-[#2FBF5A] font-bold">+5 EN</span>
            </span>
            <span>
              <span className="font-bebas text-xl sm:text-2xl text-[#F2EFE6] leading-none block uppercase">{playerObj.moves.weak}</span>
              <span className="text-[#8F8F96] text-[11px]">Quick strike. No cost.</span>
            </span>
          </button>

          <button
            type="button"
            disabled={!canUseStrong}
            onClick={() => handlePlayerAction("strong")}
            aria-label={`Strong attack ${playerObj.moves.strong}, costs ${playerObj.strongCost} energy`}
            className={moveBtn(canUseStrong, "hover:border-[#FFC93C]")}
          >
            <span className="flex items-center justify-between">
              <span className="w-6 h-6 bg-[#FFC93C] text-black flex items-center justify-center font-mono text-xs font-bold border border-black">2</span>
              <span className="text-[11px] font-mono text-[#FFC93C] font-bold">-{playerObj.strongCost} EN</span>
            </span>
            <span>
              <span className="font-bebas text-xl sm:text-2xl text-[#F2EFE6] leading-none block uppercase">{playerObj.moves.strong}</span>
              <span className="text-[#8F8F96] text-[11px]">Heavy blast. Big damage.</span>
            </span>
          </button>

          <button
            type="button"
            disabled={!playerTurn}
            onClick={() => handlePlayerAction("defend")}
            aria-label="Guard"
            className={moveBtn(playerTurn, "hover:border-[#2E7CF6]")}
          >
            <span className="flex items-center justify-between">
              <span className="w-6 h-6 bg-[#2E7CF6] text-white flex items-center justify-center font-mono text-xs font-bold border border-black">3</span>
              <span className="text-[11px] font-mono text-[#2E7CF6] font-bold">+12 EN</span>
            </span>
            <span>
              <span className="font-bebas text-xl sm:text-2xl text-[#F2EFE6] leading-none block">Guard</span>
              <span className="text-[#8F8F96] text-[11px]">Halve next hit.</span>
            </span>
          </button>

          <button
            type="button"
            disabled={!playerTurn}
            onClick={() => handlePlayerAction("charge")}
            aria-label="Charge energy"
            className={moveBtn(playerTurn, "hover:border-[#2FBF5A]")}
          >
            <span className="flex items-center justify-between">
              <span className="w-6 h-6 bg-[#F2EFE6] text-black flex items-center justify-center font-mono text-xs font-bold border border-black">4</span>
              <span className="text-[11px] font-mono text-[#2FBF5A] font-bold">+25 EN</span>
            </span>
            <span>
              <span className="font-bebas text-xl sm:text-2xl text-[#F2EFE6] leading-none block">Charge</span>
              <span className="text-[#8F8F96] text-[11px]">Bank energy. Open guard.</span>
            </span>
          </button>
        </div>

        <div className="lg:col-span-5 pb-enter pb-d3">
          <BattleLog logs={battleLogs} />
        </div>
      </div>

      {isGameOver && (
        <GameOverModal
          isWinner={isWinner}
          playerPokemon={playerObj}
          cpuPokemon={cpuObj}
          turns={turnCount}
          totalDamageDealt={totalPlayerDamage}
          winStreak={winStreak}
          bestStreak={bestStreak}
          onRematch={initializeBattle}
          soundEnabled={soundEnabled}
        />
      )}
    </div>
  );
}
