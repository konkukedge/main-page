import { load } from "cheerio/slim";
import { ddayToDate } from "../dates";
import { clean, draft, type Draft, type Source } from "./base";

const BASE = "https://www.wevity.com/";
const PAGES = 2;

export const wevity: Source = {
  name: "wevity",
  label: "위비티",
  gameFilterTitle: true,
  async fetch(http) {
    const items: Draft[] = [];
    for (let page = 1; page <= PAGES; page++) {
      // 공모내용에 '게임'이 들어간 공모전 검색 (최신순, 마감된 것도 섞여 나옴)
      const html = await http.text(`${BASE}?c=find&s=1&gub=1&sp=contents&sw=${encodeURIComponent("게임")}&gp=${page}`);
      const $ = load(html);
      const rows = $("ul.list > li").not(".top");
      if (!rows.length) break;
      rows.each((_, li) => {
        const row = $(li);
        const a = row.find(".tit a").first();
        const ix = a.attr("href")?.match(/ix=(\d+)/)?.[1];
        if (!ix) return;
        const day = clean(row.find(".day").text());
        if (day.includes("D+") || day.split(" ").pop() === "마감") return;
        const badges = a.find("span").map((_, s) => $(s).text().trim()).get();
        const fieldText = row.find(".sub-tit").text().replace("분야 :", "");
        items.push(draft({
          key: ix,
          category: "contest",
          title: clean(a.contents().filter((_, n) => n.type === "text").text()),
          url: `${BASE}?c=find&s=1&gbn=view&ix=${ix}`,
          org: clean(row.find(".organ").text()),
          deadline: ddayToDate(day),
          tags: fieldText.split(",").map((t) => t.trim()).filter(Boolean),
          note: clean(row.find(".day .dday").text()),
          isNew: badges.includes("신규"),
        }));
      });
    }
    return items;
  },
};
