"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Flame } from "lucide-react";
import { daysBetween } from "@/lib/radar/dates";
import type { Category, RadarItem } from "@/lib/radar/types";
import { Chip, ddayInfo, ItemCard, ListRow, md } from "./parts";

const byDate = (key: (i: RadarItem) => string | null) => (a: RadarItem, b: RadarItem) =>
  (key(a) ?? "9999").localeCompare(key(b) ?? "9999");
const byDeadline = byDate((i) => i.deadline ?? i.end);
const byStart = byDate((i) => i.start ?? i.deadline);

function Toggle<T extends string>({ options, value, onChange }: { options: [T, string][]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([key, label]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`px-3 py-1.5 rounded-lg text-sm border transition-colors duration-300 ${
            value === key ? "border-brand-purple bg-brand-purple/30 text-white" : "border-gray-700 text-gray-300 hover:bg-brand-purple/20"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

const Empty = () => <p className="text-center text-gray-500 py-12">조건에 맞는 항목이 없습니다.</p>;

const Grid = ({ items, today }: { items: RadarItem[]; today: string }) =>
  items.length ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => <ItemCard key={item.id} item={item} today={today} />)}
    </div>
  ) : <Empty />;

/* ---------- 전체 ---------- */

function Section({ title, count, onMore, children }: { title: string; count: number; onMore: () => void; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <div className="flex items-end justify-between mb-4">
        <h2 className="text-2xl font-bold tracking-tight">
          {title} <span className="text-brand-green text-base font-semibold ml-1">{count}</span>
        </h2>
        <button onClick={onMore} className="inline-flex items-center text-sm text-gray-400 hover:text-brand-green">
          전체 보기 <ArrowRight size={14} className="ml-1" />
        </button>
      </div>
      {children}
    </section>
  );
}

export function AllView({ items, today, onTab }: { items: RadarItem[]; today: string; onTab: (t: Category) => void }) {
  const of = (c: Category) => items.filter((i) => i.category === c);
  // 취업 공고는 마감일이 있는 게 많아 섞으면 하이라이트를 다 차지하므로 뺀다
  const urgent = items
    .filter((i) => i.category !== "job" && i.deadline && daysBetween(today, i.deadline) <= 7)
    .sort(byDeadline)
    .slice(0, 3);
  return (
    <>
      {urgent.length > 0 && (
        <div>
          <p className="flex items-center text-sm text-gray-400 mb-3"><Flame size={16} className="text-red-400 mr-1.5" />마감 임박</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {urgent.map((item) => {
              const d = ddayInfo(item, today);
              return (
                <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
                  className="bg-glass-bg border border-brand-purple rounded-xl backdrop-blur-xl p-5 hover:bg-brand-purple/20 transition-colors duration-300">
                  <div className={`text-4xl font-black tracking-tighter ${d.tone === "urgent" ? "text-red-400" : d.tone === "soon" ? "text-orange-400" : "text-brand-green"}`}>{d.label}</div>
                  <div className="font-semibold text-white mt-2 leading-snug">{item.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{d.sub} · {item.sourceLabel}</div>
                </a>
              );
            })}
          </div>
        </div>
      )}
      <Section title="공모전·대회" count={of("contest").length} onMore={() => onTab("contest")}>
        <Grid items={of("contest").sort(byDeadline).slice(0, 3)} today={today} />
      </Section>
      <Section title="게임잼" count={of("jam").length} onMore={() => onTab("jam")}>
        <Grid items={of("jam").sort(byStart).slice(0, 3)} today={today} />
      </Section>
      <Section title="행사·전시" count={of("event").length} onMore={() => onTab("event")}>
        <Grid items={of("event").sort(byStart).slice(0, 3)} today={today} />
      </Section>
      <Section title="새로 올라온 채용" count={of("job").length} onMore={() => onTab("job")}>
        {/* 게임잡은 등록일순으로 가져오므로 수집 순서가 곧 최신순 */}
        <div className="bg-glass-bg border border-gray-700 rounded-xl backdrop-blur-xl px-4">
          {of("job").slice(0, 5).map((item) => (
            <ListRow key={item.id} item={item} today={today} left={item.fields.map((f) => <Chip key={f}>{f}</Chip>)} />
          ))}
        </div>
      </Section>
    </>
  );
}

/* ---------- 공모전·대회 ---------- */

export function ContestView({ items, today }: { items: RadarItem[]; today: string }) {
  return <Grid items={[...items].sort(byDeadline)} today={today} />;
}

/* ---------- 게임잼 ---------- */

export function JamView({ items, today }: { items: RadarItem[]; today: string }) {
  const [sort, setSort] = useState<"start" | "joined">("start");
  const sorted = useMemo(
    () => [...items].sort(sort === "start" ? byStart : (a, b) => (b.joined ?? 0) - (a.joined ?? 0)),
    [items, sort],
  );
  return (
    <>
      <div className="mb-5"><Toggle options={[["start", "시작 임박순"], ["joined", "참가자 많은 순"]]} value={sort} onChange={setSort} /></div>
      <Grid items={sorted} today={today} />
    </>
  );
}

/* ---------- 행사·전시 ---------- */

export function EventView({ items, today }: { items: RadarItem[]; today: string }) {
  const [scope, setScope] = useState<"all" | "domestic" | "abroad">("all");
  const months = useMemo(() => {
    const filtered = items
      .filter((i) => scope === "all" || (scope === "abroad") === i.location.startsWith("해외"))
      .sort(byStart);
    // 이미 시작한 행사는 지난 달 묶음 대신 맨 위 '진행 중'으로
    const groups = new Map<string, RadarItem[]>([["진행 중", []]]);
    filtered.forEach((i) => {
      const date = i.start ?? i.deadline;
      const key = !date ? "일정 미정" : date < today ? "진행 중" : `${Number(date.slice(5, 7))}월`;
      groups.set(key, [...(groups.get(key) ?? []), i]);
    });
    return Array.from(groups.entries()).filter(([, list]) => list.length);
  }, [items, scope, today]);

  return (
    <>
      <div className="mb-5"><Toggle options={[["all", "전체"], ["domestic", "국내"], ["abroad", "해외"]]} value={scope} onChange={setScope} /></div>
      {months.length ? months.map(([month, list]) => (
        <section key={month} className="mb-8">
          <h2 className="text-brand-green font-bold mb-2">{month}</h2>
          <div className="bg-glass-bg border border-gray-700 rounded-xl backdrop-blur-xl px-4">
            {list.map((item) => (
              <ListRow key={item.id} item={item} today={today} left={
                <span className="font-bold text-white">
                  {md(item.start)}{item.end && item.end !== item.start ? "~" : ""}
                </span>
              } />
            ))}
          </div>
        </section>
      )) : <Empty />}
    </>
  );
}

/* ---------- 취업 ---------- */

export function JobView({ items, today, fields }: { items: RadarItem[]; today: string; fields: string[] }) {
  const [field, setField] = useState("");
  const shown = field ? items.filter((i) => i.fields.includes(field)) : items;
  const count = (f: string) => items.filter((i) => i.fields.includes(f)).length;
  return (
    <>
      {/* 여러 직종을 같이 뽑는 공고는 해당 분야마다 다 센다 */}
      <div className="mb-5">
        <Toggle
          options={[["", `전체 ${items.length}`], ...fields.map((f): [string, string] => [f, `${f} ${count(f)}`])]}
          value={field}
          onChange={setField}
        />
      </div>
      {shown.length ? (
        <div className="bg-glass-bg border border-gray-700 rounded-xl backdrop-blur-xl px-4">
          {shown.map((item) => (
            <ListRow key={item.id} item={item} today={today} left={item.fields.map((f) => <Chip key={f}>{f}</Chip>)} />
          ))}
        </div>
      ) : <Empty />}
    </>
  );
}
