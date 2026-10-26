import { EXCLUDE_KEYWORDS, GAME_KEYWORDS, JAM_KEYWORDS, JOB_FIELDS, OTHER_FIELD } from "./config";
import { isOver, todayKst } from "./dates";
import { Http } from "./http";
import type { Draft, Source } from "./sources/base";
import { contestKorea } from "./sources/contestkorea";
import { eventUs } from "./sources/eventus";
import { gameJob } from "./sources/gamejob";
import { itchio } from "./sources/itchio";
import { koccaCalendar } from "./sources/koccaCalendar";
import { linkareer } from "./sources/linkareer";
import { wevity } from "./sources/wevity";
import type { RadarData, RadarItem, SourceStatus } from "./types";

// 순서 = 같은 공모전이 여러 곳에 있을 때 대표로 보여 줄 출처 우선순위
const SOURCES: Source[] = [wevity, contestKorea, linkareer, itchio, eventUs, koccaCalendar, gameJob];

const hasAny = (text: string, words: string[]) => {
  const lower = text.toLowerCase();
  return words.some((w) => lower.includes(w.toLowerCase()));
};

function postprocess(drafts: Draft[], source: Source, today: string): Draft[] {
  return drafts.filter((d) => {
    if (source.gameFilterTitle && !hasAny(d.title, GAME_KEYWORDS)) return false;
    if (hasAny(d.title, [...EXCLUDE_KEYWORDS, ...(source.excludeKeywords ?? [])])) return false;
    if (isOver(d.deadline, d.end, today)) return false;
    if ((d.category === "contest" || d.category === "event") && hasAny(d.title, JAM_KEYWORDS)) d.category = "jam";
    return true;
  });
}

// tsconfig target 이 es5 라 u 플래그 정규식 리터럴 대신 생성자로 만든다
const NON_WORD = new RegExp("[^\\p{L}\\p{N}]+", "gu");
const normTitle = (title: string) => title.replace(/\[[^\]]*\]/g, "").replace(NON_WORD, "").toLowerCase();

/** 모든 출처를 동시에 긁는다. 한 사이트가 실패해도 나머지는 그대로 보여 준다 */
export async function crawlRadar(): Promise<RadarData> {
  const today = todayKst();
  const results = await Promise.all(SOURCES.map(async (source) => {
    try {
      return { source, drafts: postprocess(await source.fetch(new Http()), source, today), error: null };
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      console.error(`[radar] ${source.label} 수집 실패: ${error}`);
      return { source, drafts: [] as Draft[], error };
    }
  }));

  // 여러 포털에 같이 올라온 공모전은 하나로 합치고 나머지는 '다른 출처' 링크로 붙인다
  const items: RadarItem[] = [];
  const seen = new Map<string, RadarItem>();
  for (const { source, drafts } of results) {
    for (const { key, ...d } of drafts) {
      const dupKey = `${d.category}:${normTitle(d.title)}`;
      const first = seen.get(dupKey);
      if (first && first.source !== source.name) {
        first.also.push({ label: source.label, url: d.url });
        first.isNew ||= d.isNew;
        continue;
      }
      const item: RadarItem = { ...d, id: `${source.name}:${key}`, source: source.name, sourceLabel: source.label, also: [] };
      if (!first) seen.set(dupKey, item);
      items.push(item);
    }
  }

  const sources: SourceStatus[] = results.map(({ source, drafts, error }) => ({
    name: source.name, label: source.label, count: drafts.length, error,
  }));
  return { generatedAt: new Date().toISOString(), items, sources, jobFields: [...Object.keys(JOB_FIELDS), OTHER_FIELD] };
}
