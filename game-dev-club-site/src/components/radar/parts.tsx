import { daysBetween } from "@/lib/radar/dates";
import type { RadarItem } from "@/lib/radar/types";

export const md = (iso: string | null) => (iso ? `${Number(iso.slice(5, 7))}/${Number(iso.slice(8, 10))}` : "");

type Tone = "urgent" | "soon" | "ok" | "none";
const TONE_CLASS: Record<Tone, string> = {
  urgent: "text-red-400",
  soon: "text-orange-400",
  ok: "text-brand-green",
  none: "text-gray-500",
};

/** 마감일이 있으면 마감까지, 없으면 시작일까지(게임잼·행사) */
export function ddayInfo(item: RadarItem, today: string): { label: string; sub: string; tone: Tone } {
  if (item.deadline) {
    const n = daysBetween(today, item.deadline);
    return { label: n === 0 ? "D-DAY" : `D-${n}`, sub: `${md(item.deadline)} 마감`, tone: n <= 3 ? "urgent" : n <= 7 ? "soon" : "ok" };
  }
  if (item.start) {
    const n = daysBetween(today, item.start);
    if (n > 0) return { label: `D-${n}`, sub: `${md(item.start)} 시작`, tone: n <= 7 ? "soon" : "ok" };
    return { label: "진행중", sub: item.end ? `~${md(item.end)}` : "", tone: "ok" };
  }
  return { label: "상시", sub: "", tone: "none" };
}

export function period(item: RadarItem): string {
  if (!item.start) return "";
  const label = item.category === "contest" ? "접수" : item.category === "jam" ? "잼 기간" : "일정";
  return item.end && item.end !== item.start ? `${label} ${md(item.start)} ~ ${md(item.end)}` : `${label} ${md(item.start)}`;
}

export function Dday({ item, today, className = "" }: { item: RadarItem; today: string; className?: string }) {
  const d = ddayInfo(item, today);
  return (
    <div className={`text-right shrink-0 ${className}`}>
      <div className={`font-black text-lg leading-none ${TONE_CLASS[d.tone]}`}>{d.label}</div>
      {d.sub && <div className="text-xs text-gray-500 mt-1">{d.sub}</div>}
    </div>
  );
}

export function Chip({ children, tone = "purple" }: { children: React.ReactNode; tone?: "purple" | "green" | "gray" }) {
  const cls = {
    purple: "bg-brand-purple/25 text-purple-200",
    green: "bg-brand-green text-dark-bg font-bold",
    gray: "bg-light-bg text-gray-400",
  }[tone];
  return <span className={`inline-block text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${cls}`}>{children}</span>;
}

function SourceLinks({ item }: { item: RadarItem }) {
  return (
    <span className="text-xs text-gray-500">
      {item.sourceLabel}
      {item.also.map((o) => (
        <a key={o.url} href={o.url} target="_blank" rel="noopener noreferrer" className="hover:text-brand-green">
          {" · "}{o.label}
        </a>
      ))}
    </span>
  );
}

/** 공모전·게임잼·행사 카드 */
export function ItemCard({ item, today }: { item: RadarItem; today: string }) {
  const meta = [item.org, period(item), item.location, item.joined ? `${item.joined.toLocaleString()}명 참가` : ""].filter(Boolean);
  return (
    <div className="group bg-glass-bg border border-gray-700 hover:border-brand-purple rounded-xl backdrop-blur-xl p-4 flex flex-col gap-2 transition-colors duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {item.isNew && <Chip tone="green">NEW</Chip>}
          {item.tags.slice(0, 2).map((t) => <Chip key={t}>{t}</Chip>)}
        </div>
        <Dday item={item} today={today} />
      </div>
      <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-bold text-white leading-snug group-hover:text-brand-green transition-colors">
        {item.title}
      </a>
      {meta.length > 0 && <p className="text-sm text-gray-400">{meta.join(" · ")}</p>}
      <div className="mt-auto pt-1"><SourceLinks item={item} /></div>
    </div>
  );
}

/** 취업 탭·행사 일정처럼 촘촘한 목록 한 줄 */
export function ListRow({ item, today, left }: { item: RadarItem; today: string; left: React.ReactNode }) {
  const meta = [item.org, item.location, ...item.tags.filter((t) => /경력|신입|인턴|정규직|계약직/.test(t))].filter(Boolean);
  return (
    <div className="grid grid-cols-[5.5rem_minmax(0,1fr)_auto] sm:grid-cols-[7rem_minmax(0,1fr)_auto] gap-3 items-center py-3 border-b border-gray-800 last:border-0">
      <div className="flex flex-col items-start gap-1">{left}</div>
      <div className="min-w-0">
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-white font-semibold hover:text-brand-green transition-colors">
          {item.isNew && <span className="mr-1.5 align-middle"><Chip tone="green">NEW</Chip></span>}
          {item.title}
        </a>
        <p className="text-sm text-gray-400 truncate">{meta.join(" · ")}</p>
      </div>
      <Dday item={item} today={today} />
    </div>
  );
}
