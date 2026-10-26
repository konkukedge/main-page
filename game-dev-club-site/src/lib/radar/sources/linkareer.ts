import { kstDate } from "../dates";
import { draft, type Draft, type Source } from "./base";

const LIST_URL = "https://linkareer.com/list/contest";
const CATEGORY_IDS = [33, 35]; // 33: 캐릭터/만화/게임, 35: 과학/공학/IT
const PAGE_SIZE = 20;

interface Activity {
  id: string;
  title: string;
  organizationName?: string;
  recruitCloseAt?: number;
}

export const linkareer: Source = {
  name: "linkareer",
  label: "링커리어",
  gameFilterTitle: true,
  async fetch(http) {
    const items = new Map<string, Draft>();
    for (const cid of CATEGORY_IDS) {
      for (let page = 1; page <= 5; page++) {
        const { activities, total } = await fetchPage(http, cid, page);
        activities.forEach((a) => {
          if (items.has(a.id)) return;
          items.set(a.id, draft({
            key: a.id,
            category: "contest",
            title: a.title.trim(),
            url: `https://linkareer.com/activity/${a.id}`,
            org: a.organizationName ?? "",
            deadline: a.recruitCloseAt ? kstDate(a.recruitCloseAt) : null,
          }));
        });
        if (!activities.length || page * PAGE_SIZE >= total) break;
      }
    }
    return Array.from(items.values());
  },
};

/** 페이지에 심어진 Next.js/Apollo 데이터에서 모집중인 공모전 목록만 꺼낸다 */
async function fetchPage(http: Parameters<Source["fetch"]>[0], cid: number, page: number) {
  const html = await http.text(`${LIST_URL}?filterType=CATEGORY&filterBy_categoryIDs=${cid}&page=${page}`);
  const json = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)?.[1];
  if (!json) throw new Error("__NEXT_DATA__ 를 찾지 못했습니다");
  const state: Record<string, any> = JSON.parse(json).props.pageProps.__APOLLO_STATE__;
  const activities: Activity[] = [];
  let total = 0;
  for (const [key, value] of Object.entries<any>(state.ROOT_QUERY ?? {})) {
    if (!key.startsWith("activities(") || !value?.nodes) continue;
    total = Math.max(total, value.totalCount ?? 0);
    for (const node of value.nodes) {
      const act = state[node.__ref];
      if (act) activities.push(act);
    }
  }
  return { activities, total };
}
