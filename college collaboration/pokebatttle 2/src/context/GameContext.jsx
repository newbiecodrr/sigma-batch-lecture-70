import { createContext, useContext, useState, useEffect } from "react";

// Global Game State (shares selected pokemon & persists win streak in localStorage)
const GameContext = createContext(null);

const STORAGE_KEYS = {
  CURRENT_STREAK: "pokebattle_current_streak",
  BEST_STREAK: "pokebattle_best_streak",
  SOUND: "pokebattle_sound_enabled",
  TOTAL_BATTLES: "pokebattle_total_battles",
};

export function GameProvider({ children }) {
  const [playerPokemon, setPlayerPokemon] = useState(null);
  const [cpuPokemon, setCpuPokemon] = useState(null);

  // LocalStorage se streaks load karo
  const [winStreak, setWinStreak] = useState(() => {
    try {
      return parseInt(localStorage.getItem(STORAGE_KEYS.CURRENT_STREAK) || "0", 10);
    } catch {
      return 0;
    }
  });

  const [bestStreak, setBestStreak] = useState(() => {
    try {
      return parseInt(localStorage.getItem(STORAGE_KEYS.BEST_STREAK) || "0", 10);
    } catch {
      return 0;
    }
  });

  const [totalBattles, setTotalBattles] = useState(() => {
    try {
      return parseInt(localStorage.getItem(STORAGE_KEYS.TOTAL_BATTLES) || "0", 10);
    } catch {
      return 0;
    }
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SOUND);
      return stored === null ? true : stored === "true";
    } catch {
      return true;
    }
  });

  // LocalStorage sync
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_STREAK, winStreak.toString());
      localStorage.setItem(STORAGE_KEYS.BEST_STREAK, bestStreak.toString());
      localStorage.setItem(STORAGE_KEYS.TOTAL_BATTLES, totalBattles.toString());
      localStorage.setItem(STORAGE_KEYS.SOUND, soundEnabled.toString());
    } catch (e) {
      console.warn("LocalStorage access restricted:", e);
    }
  }, [winStreak, bestStreak, totalBattles, soundEnabled]);

  // match jeetne par streak increment
  const recordWin = () => {
    setWinStreak((prev) => {
      const nextStreak = prev + 1;
      setBestStreak((currentBest) => Math.max(currentBest, nextStreak));
      return nextStreak;
    });
    setTotalBattles((prev) => prev + 1);
  };

  // match haarne par current streak reset
  const recordLoss = () => {
    setWinStreak(0);
    setTotalBattles((prev) => prev + 1);
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  const resetMatch = () => {
    setPlayerPokemon(null);
    setCpuPokemon(null);
  };

  return (
    <GameContext.Provider
      value={{
        playerPokemon,
        setPlayerPokemon,
        cpuPokemon,
        setCpuPokemon,
        winStreak,
        bestStreak,
        totalBattles,
        soundEnabled,
        recordWin,
        recordLoss,
        toggleSound,
        resetMatch,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a <GameProvider>");
  }
  return context;
}
