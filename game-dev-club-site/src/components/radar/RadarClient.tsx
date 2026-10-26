"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, CalendarDays, Gamepad2, LayoutGrid, Search, Trophy } from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/radar/config";
import { isOver, kstDate, todayKst } from "@/lib/radar/dates";
import type { Category, RadarData } from "@/lib/radar/types";
import { AllView, ContestView, EventView, JamView, JobView } from "./views";

type Tab = "all" | Category;

// short: 폰 화면 5칸에 들어가는 짧은 이름
const TABS: { key: Tab; label: string; short: string; icon: React.ReactNode }[] = [
  { key: "all", label: "전체", short: "전체", icon: <LayoutGrid size={20} /> },
  { key: "contest", label: CATEGORY_LABELS.contest, short: "공모전", icon: <Trophy size={20} /> },
  { key: "jam", label: CATEGORY_LABELS.jam, short: "게임잼", icon: <Gamepad2 size={20} /> },
  { key: "event", label: CATEGORY_LABELS.event, short: "행사", icon: <CalendarDays size={20} /> },
  { key: "job", label: CATEGORY_LABELS.job, short: "취업", icon: <Briefcase size={20} /> },
];
const isTab = (v: string | null): v is Tab => TABS.some((t) => t.key === v);

export default function RadarClient({ data }: { data: RadarData }) {
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  // 주소의 ?tab= 으로 처음 들어온 전환은 애니메이션 없이 바로 보여 준다
  const [animate, setAnimate] = useState(false);
  // 서버 렌더와 첫 화면을 맞추려고 처음엔 수집한 날을 '오늘'로 쓰고, 화면이 뜬 뒤 실제 오늘로 바꾼다.
  // 페이지가 며칠 묵어도 D-day 와 마감 숨김은 보는 날 기준으로 맞게 나온다.
  const [today, setToday] = useState(() => kstDate(data.generatedAt));

  useEffect(() => {
    setToday(todayKst());
    const fromUrl = new URLSearchParams(window.location.search).get("tab");
    if (isTab(fromUrl)) setTab(fromUrl);
  }, []);

  const changeTab = (next: Tab) => {
    setAnimate(true);
    setTab(next);
    setQuery("");
    // 탭마다 주소가 달라서 '취업 탭' 링크를 그대로 공유할 수 있다
    window.history.replaceState(null, "", next === "all" ? window.location.pathname : `?tab=${next}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const live = useMemo(() => data.items.filter((i) => !isOver(i.deadline, i.end, today)), [data.items, today]);
  const counts = useMemo(() => {
    const c: Record<Tab, number> = { all: live.length, contest: 0, jam: 0, event: 0, job: 0 };
    live.forEach((i) => c[i.category]++);
    return c;
  }, [live]);
  const inTab = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return live.filter((i) => {
      if (tab !== "all" && i.category !== tab) return false;
      const hay = [i.title, i.org, i.location, ...i.tags, ...i.fields].join(" ").toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }, [live, tab, query]);

  const failed = data.sources.filter((s) => s.error);

  return (
    <>
      <nav className="sticky top-3 z-30 grid grid-cols-5 gap-1 p-1 mb-8 bg-light-bg/80 border border-gray-700 rounded-2xl backdrop-blur-xl">
        {TABS.map(({ key, label, short, icon }) => (
          <button
            key={key}
            onClick={() => changeTab(key)}
            aria-pressed={tab === key}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-xl py-2 px-1 transition-colors duration-300 ${
              tab === key ? "bg-brand-green text-dark-bg font-bold" : "text-gray-300 hover:bg-brand-purple/30"
            }`}
          >
            {icon}
            <span className="text-xs sm:text-sm leading-tight whitespace-nowrap">
              <span className="sm:hidden">{short}</span>
              <span className="hidden sm:inline">{label}</span>
            </span>
            <span className={`text-[11px] ${tab === key ? "text-dark-bg/70" : "text-gray-500"}`}>{counts[key]}</span>
          </button>
        ))}
      </nav>

      {tab !== "all" && (
        <label className="flex items-center gap-2 bg-light-bg rounded-lg px-3 py-2 mb-5 text-gray-400 focus-within:ring-1 focus-within:ring-brand-green">
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="제목·주최·태그로 찾기"
            className="bg-transparent outline-none flex-1 text-white placeholder:text-gray-500"
          />
        </label>
      )}

      {/* initial={false}: 첫 화면은 서버 HTML 그대로 보이게 하고, 사용자가 탭을 바꿀 때만 애니메이션 */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={animate ? { opacity: 0, y: -10 } : { opacity: 0, transition: { duration: 0 } }}
          transition={{ duration: animate ? 0.2 : 0 }}
        >
          {tab === "all" && <AllView items={inTab} today={today} onTab={changeTab} />}
          {tab === "contest" && <ContestView items={inTab} today={today} />}
          {tab === "jam" && <JamView items={inTab} today={today} />}
          {tab === "event" && <EventView items={inTab} today={today} />}
          {tab === "job" && <JobView items={inTab} today={today} fields={data.jobFields} />}
        </motion.div>
      </AnimatePresence>

      <footer className="mt-16 pt-6 border-t border-gray-800 text-xs text-gray-500 leading-relaxed">
        <p>
          출처: {data.sources.map((s) => s.label).join(", ")} · 몇 시간마다 자동으로 모은 정보라 정확한 일정과 조건은 원문에서 확인해 주세요.
        </p>
        {failed.length > 0 && (
          <p className="text-red-400 mt-1">이번 수집에 실패한 곳: {failed.map((s) => s.label).join(", ")}</p>
        )}
      </footer>
    </>
  );
}
