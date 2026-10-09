import { useEffect, useRef } from "react";

export default function BattleLog({ logs = [] }) {
  const scrollBottomRef = useRef(null);

  useEffect(() => {
    scrollBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const tag = (log) => {
    if (log.isCrit)
      return <span className="px-1.5 py-px bg-[#E8382A] text-white text-[10px] font-extrabold tracking-widest uppercase border border-black shrink-0">Crit</span>;
    if (log.action === "defend")
      return <span className="px-1.5 py-px bg-[#2E7CF6] text-white text-[10px] font-extrabold tracking-widest uppercase border border-black shrink-0">Guard</span>;
    if (log.action === "charge")
      return <span className="px-1.5 py-px bg-[#FFC93C] text-black text-[10px] font-extrabold tracking-widest uppercase border border-black shrink-0">Charge</span>;
    return <span className="px-1.5 py-px bg-[#1c1c1f] text-[#8F8F96] text-[10px] font-mono shrink-0 border border-[#26262b]">T{log.turn}</span>;
  };

  return (
    <div className="border-2 border-[#26262b] bg-[#101012] flex flex-col h-56 sm:h-64">
      <div className="flex items-center justify-between px-3 py-2 border-b-2 border-[#26262b]">
        <h4 className="font-bebas text-lg tracking-[0.12em] text-[#F2EFE6]">Combat feed</h4>
        <span className="text-[11px] font-mono text-[#8F8F96]">{logs.length} events</span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1.5 p-2.5 battle-log-scroll text-xs">
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[#8F8F96] italic text-center">
            Awaiting first move…
          </div>
        ) : (
          logs.map((item, index) => (
            <div
              key={index}
              className={`px-2 py-1.5 flex items-start gap-2 border-l-[3px] ${
                item.isCrit
                  ? "bg-[#160f0e] border-[#E8382A] text-[#F2EFE6]"
                  : item.isPlayer
                  ? "bg-[#131315] border-[#E8382A] text-[#D8D8DC]"
                  : "bg-[#0e1218] border-[#2E7CF6] text-[#C6D4EA]"
              }`}
            >
              {tag(item)}
              <p className="leading-relaxed flex-1">{item.message}</p>
            </div>
          ))
        )}
        <div ref={scrollBottomRef} />
      </div>
    </div>
  );
}
