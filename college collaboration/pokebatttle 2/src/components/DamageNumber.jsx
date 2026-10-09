// Floating RPG damage / energy popup numbers
export default function DamageNumber({ event }) {
  if (!event) return null;

  const { value, isCrit, isBlocked, isEnergy } = event;

  const getStyle = () => {
    if (isEnergy) {
      return "text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]";
    }
    if (isCrit) {
      return "text-amber-300 text-2xl font-black drop-shadow-[0_0_20px_rgba(245,158,11,1)]";
    }
    if (isBlocked) {
      return "text-blue-300 text-sm drop-shadow-[0_0_12px_rgba(59,130,246,0.8)]";
    }
    return "text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.9)]";
  };

  const getLabel = () => {
    if (isEnergy) return `+${value} EN`;
    if (isCrit) return `CRIT! -${value}`;
    if (isBlocked) return `GUARDED -${value}`;
    return `-${value}`;
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
      <div
        className={`font-bebas text-xl sm:text-2xl tracking-wider select-none animate-damage-float ${getStyle()}`}
      >
        {getLabel()}
      </div>
    </div>
  );
}
