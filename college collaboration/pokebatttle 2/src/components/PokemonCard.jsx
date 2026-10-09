import { SoundEngine } from "@/utils/audio";

const TYPE_COLORS = {
  Electric: "#FFC93C",
  Fire: "#FF6B1A",
  Water: "#2E7CF6",
  Grass: "#2FBF5A",
  Poison: "#a855f7",
  Flying: "#7dd3fc",
  Ghost: "#a78bfa",
  Psychic: "#ec4899",
  Normal: "#8F8F96",
};

export default function PokemonCard({
  pokemon,
  isSelected,
  onSelect,
  isCpuSelected,
  soundEnabled = true,
}) {
  const handleClick = () => {
    if (soundEnabled) SoundEngine.playClick();
    onSelect(pokemon);
  };

  const frame = isSelected
    ? "bg-[#160f0e] border-[#E8382A]"
    : isCpuSelected
    ? "bg-[#0e1218] border-[#2E7CF6]"
    : "bg-[#131315] border-[#26262b] hover:border-[#52525b]";

  return (
    <div
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      aria-label={`Select ${pokemon.name}`}
      className={`relative border-2 p-4 cursor-pointer transition-all duration-150 outline-none select-none hover:-translate-y-0.5 ${frame} focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black`}
    >
      {(isSelected || isCpuSelected) && (
        <>
          <span className={`select-bracket sb-tl ${isSelected ? "text-[#E8382A]" : "text-[#2E7CF6]"}`} />
          <span className={`select-bracket sb-tr ${isSelected ? "text-[#E8382A]" : "text-[#2E7CF6]"}`} />
          <span className={`select-bracket sb-bl ${isSelected ? "text-[#E8382A]" : "text-[#2E7CF6]"}`} />
          <span className={`select-bracket sb-br ${isSelected ? "text-[#E8382A]" : "text-[#2E7CF6]"}`} />
        </>
      )}
      {isSelected && (
        <span className="absolute -top-3 left-3 px-2 py-0.5 bg-[#E8382A] text-white text-[10px] font-extrabold tracking-[0.16em] uppercase border-2 border-black">
          Your pick
        </span>
      )}
      {isCpuSelected && !isSelected && (
        <span className="absolute -top-3 left-3 px-2 py-0.5 bg-[#2E7CF6] text-white text-[10px] font-extrabold tracking-[0.16em] uppercase border-2 border-black">
          CPU foe
        </span>
      )}

      <div className="flex items-baseline justify-between gap-2 mt-1">
        <h3 className="font-bebas text-3xl tracking-wide text-[#F2EFE6] leading-none">{pokemon.name}</h3>
        <span className="text-[11px] font-mono text-[#8F8F96]">#{String(pokemon.pokedexId || 1).padStart(3, "0")}</span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
        {pokemon.types.map((type) => (
          <span key={type} className="text-[10px] font-extrabold tracking-[0.16em] uppercase" style={{ color: TYPE_COLORS[type] || "#8F8F96" }}>
            {type}
          </span>
        ))}
      </div>

      <div className="h-28 flex items-center justify-center my-2 bg-[#0A0A0B] border-2 border-[#26262b]">
        <img src={pokemon.sprite} alt={pokemon.name} className={`max-h-24 object-contain ${isSelected ? "scale-110" : ""} transition-transform`} loading="lazy" />
      </div>

      <p className="text-[#8F8F96] text-xs line-clamp-2 min-h-[2rem]">
        {pokemon.description || "Battle-tested. Ready for the arena."}
      </p>

      <div className="grid grid-cols-4 border-t-2 border-[#26262b] mt-2 pt-2 font-mono text-[11px] text-center">
        <span className="text-[#8F8F96]">HP <strong className="text-[#F2EFE6] block text-sm">{pokemon.maxHp}</strong></span>
        <span className="text-[#8F8F96]">ATK <strong className="text-[#F2EFE6] block text-sm">{pokemon.baseDamage}</strong></span>
        <span className="text-[#8F8F96]">DEF <strong className="text-[#F2EFE6] block text-sm">{pokemon.defense}</strong></span>
        <span className="text-[#8F8F96]">COST <strong className="text-[#FFC93C] block text-sm">{pokemon.strongCost}</strong></span>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
        className={`w-full mt-3 py-2 font-bebas text-xl tracking-[0.12em] border-2 border-black transition-all cursor-pointer ${
          isSelected
            ? "bg-[#E8382A] text-white shadow-[3px_3px_0_#000]"
            : "bg-[#F2EFE6] text-black shadow-[3px_3px_0_#000] hover:bg-white"
        } active:translate-x-[2px] active:translate-y-[2px] active:shadow-none`}
      >
        {isSelected ? "Locked in" : "Select"}
      </button>
    </div>
  );
}
