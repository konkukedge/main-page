import { kstDate } from "../dates";
import { draft, type Draft, type Source } from "./base";

const SEARCH_API = "https://api.event-us.kr/api/v1/engine/search";
const NEW_WITHIN_MS = 3 * 86_400_000;

type Field = { raw?: any } | undefined;
interface SearchResponse {
  meta?: { page?: { total_pages?: number } };
  results?: Record<string, Field>[];
}

const day = (v: unknown) => (typeof v === "string" && v ? kstDate(v) : null);

export const eventUs: Source = {
  name: "eventus",
  label: "이벤터스",
  gameFilterTitle: false,
  async fetch(http) {
    const items: Draft[] = [];
    for (let page = 1, totalPages = 1; page <= totalPages && page <= 5; page++) {
      // 이벤터스 검색 페이지와 같은 조건: 공개 + 진행중 + 게임 카테고리 + 신청 마감 전
      const data = await http.json<SearchResponse>(SEARCH_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: "https://event-us.kr", Referer: "https://event-us.kr/" },
        body: JSON.stringify({
          query: "",
          page: { current: page, size: 30 },
          filters: { all: [
            { state: "Start" }, { disclosure_status: "open" }, { is_ignore: "false" },
            { category: ["게임"] }, { register_due_date: { from: new Date().toISOString() } },
          ] },
          sort: [{ date: "desc" }, { id: "desc" }],
        }),
      });
      totalPages = data.meta?.page?.total_pages ?? 1;
      for (const res of data.results ?? []) {
        const raw = (k: string) => res[k]?.raw;
        const id = String(raw("id"));
        const eventType = String(raw("event_type") ?? "");
        const created = Date.parse(raw("date") ?? "");
        items.push(draft({
          key: id,
          category: eventType.includes("대회") || eventType.includes("공모") ? "contest" : "event",
          title: String(raw("title") ?? "").trim(),
          url: `https://event-us.kr/${raw("subdomain")}/event/${id}`,
          org: String(raw("app_title") ?? ""),
          deadline: day(raw("register_due_date")),
          start: day(raw("start_date")),
          end: day(raw("close_date")),
          location: [raw("area"), raw("event_system_type") === "online" ? "온라인" : ""].filter(Boolean).join(" "),
          tags: eventType ? [eventType] : [],
          isNew: Date.now() - created < NEW_WITHIN_MS,
        }));
      }
    }
    return items;
  },
};
