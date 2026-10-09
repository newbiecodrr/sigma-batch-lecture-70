export default function StatBar({
  label = "HP",
  current = 100,
  max = 100,
  type = "hp", // 'hp' | 'energy'
  isDefending = false,
}) {
  const percent = Math.max(0, Math.min(100, Math.round((current / max) * 100)));
  const segs = 14;
  const filled = Math.round((percent / 100) * segs);

  const segColor = (i) => {
    if (i >= filled) return "#1c1c1f";
    if (type === "energy") return "#2E7CF6";
    if (percent > 50) return "#2FBF5A";
    if (percent > 25) return "#FFC93C";
    return "#E8382A";
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <span className="tick-label !text-[10px]">{label}</span>
          {type === "hp" && isDefending && (
            <span className="text-[9px] font-extrabold tracking-[0.16em] uppercase px-1.5 py-px bg-[#2E7CF6] text-white border border-black">
              Guard
            </span>
          )}
          {type === "hp" && percent <= 25 && (
            <span className="text-[9px] font-extrabold tracking-[0.16em] uppercase px-1.5 py-px bg-[#E8382A] text-white border border-black pb-blink">
              Low
            </span>
          )}
        </div>
        <div className="font-mono text-xs text-[#8F8F96]">
          <span className="font-bold text-[#F2EFE6] score-num text-sm">{current}</span>
          <span> / {max}</span>
        </div>
      </div>
      <div
        className="seg-bar h-3 w-full bg-black border-2 border-[#26262b] p-[2px]"
        role="progressbar"
        aria-label={label}
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        {Array.from({ length: segs }).map((_, i) => (
          <span key={i} style={{ background: segColor(i) }} />
        ))}
      </div>
    </div>
  );
}
