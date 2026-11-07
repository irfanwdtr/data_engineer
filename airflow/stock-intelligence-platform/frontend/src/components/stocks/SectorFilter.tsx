interface SectorFilterProps {
  activeSector: string;
  onSelectSector: (sector: string) => void;
  counts: Record<string, number>;
}

const SECTORS = [
  "Semua",
  "Keuangan",
  "Telekomunikasi",
  "Konsumer",
  "Energi",
  "Lainnya",
];

export function SectorFilter({
  activeSector,
  onSelectSector,
  counts,
}: SectorFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {SECTORS.map((sector) => {
        const isActive = activeSector.toLowerCase() === sector.toLowerCase();
        const count = counts[sector.toLowerCase()] ?? 0;

        return (
          <button
            key={sector}
            onClick={() => onSelectSector(sector)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isActive
                ? "bg-[#5B46E8] text-white shadow-md shadow-indigo-600/30"
                : "bg-[#101524] text-slate-400 hover:text-white border border-[#1C253D]"
            }`}
          >
            {sector} {sector === "Semua" ? `(${count})` : count > 0 ? `(${count})` : ""}
          </button>
        );
      })}
    </div>
  );
}

