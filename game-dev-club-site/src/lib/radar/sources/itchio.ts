import { load } from "cheerio/slim";
import { ITCH_EXCLUDE_KEYWORDS, ITCH_MIN_JOINED } from "../config";
import { kstDate } from "../dates";
import { clean, draft, type Draft, type Source } from "./base";

const LIST_URL = "https://itch.io/jams/upcoming";
const PAGES = 2;
const UNIT_DAYS: Record<string, number> = { hour: 1 / 24, day: 1, week: 7, month: 30, year: 365 };

export const itchio: Source = {
  name: "itchio",
  label: "itch.io",
  gameFilterTitle: false,
  excludeKeywords: ITCH_EXCLUDE_KEYWORDS,
  async fetch(http) {
    const items: Draft[] = [];
    for (let page = 1; page <= PAGES; page++) {
      const $ = load(await http.text(page > 1 ? `${LIST_URL}?page=${page}` : LIST_URL));
      const jams = $("div.jam");
      if (!jams.length) break;
      jams.each((_, el) => {
        const jam = $(el);
        const a = jam.find(".primary_info h3 a").first();
        const href = a.attr("href");
        const joined = Number(jam.find(".jam_stats .number").first().text().replace(/,/g, "")) || 0;
        if (!href || joined < ITCH_MIN_JOINED) return;
        // 'Starts in …' 만 받고, 이미 끝났거나(Ended) 투표 중인 잼은 건너뛴다
        if (!clean(jam.find(".timestmap, .timestamp").first().text()).startsWith("Starts in")) return;
        const countdown = jam.find(".date_countdown").first();
        const startMs = Date.parse(countdown.text().trim()) || Date.parse(`${countdown.attr("title")}Z`.replace(" ", "T"));
        if (!startMs) return;
        const duration = clean(jam.find(".date_duration").first().text());
        const m = duration.match(/(\d+)\s*(hour|day|week|month|year)/);
        const endMs = m ? startMs + Number(m[1]) * UNIT_DAYS[m[2]] * 86_400_000 : null;
        items.push(draft({
          key: href.split("/").pop() ?? href,
          category: "jam",
          title: clean(a.text()),
          url: `https://itch.io${href}`,
          org: clean(jam.find(".hosted_by a").first().text()),
          start: kstDate(startMs),
          end: endMs ? kstDate(endMs) : null,
          location: "온라인",
          tags: jam.find(".jam_ranked").length ? ["Ranked"] : [],
          note: duration ? `기간 ${duration}` : "",
          joined,
        }));
      });
    }
    return items;
  },
};
