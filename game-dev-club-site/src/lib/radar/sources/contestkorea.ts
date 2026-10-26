import { load } from "cheerio/slim";
import { ddayToDate, monthDayToDate } from "../dates";
import { clean, draft, type Draft, type Source } from "./base";

const LIST_URL = "https://www.contestkorea.com/sub/list.php";
const PAGES = 2;
const OPEN_STATES = ["접수중", "접수예정", "마감임박"];

export const contestKorea: Source = {
  name: "contestkorea",
  label: "콘테스트코리아",
  gameFilterTitle: false, // 이미 제목 검색이라 전부 게임 관련
  async fetch(http) {
    const items: Draft[] = [];
    for (let page = 1; page <= PAGES; page++) {
      // 제목에 '게임'이 들어간 대회·공모전 (최신 등록순)
      const html = await http.text(`${LIST_URL}?int_gbn=1&Txt_key=str_meeting&Txt_word=${encodeURIComponent("게임")}&page=${page}`);
      const $ = load(html);
      const rows = $(".list_style_2 > ul > li");
      if (!rows.length) break;
      rows.each((_, li) => {
        const row = $(li);
        const state = clean(row.find(".condition").text());
        if (!OPEN_STATES.includes(state)) return;
        const href = row.find(".title a").first().attr("href") ?? "";
        const no = href.match(/str_no=(\d+)/)?.[1];
        if (!no) return;
        // '접수 10.14~10.31'
        const period = row.find(".step-1").text().match(/(\d{1,2})\.(\d{1,2})\s*~\s*(\d{1,2})\.(\d{1,2})/);
        const [start, end] = period
          ? [monthDayToDate(+period[1], +period[2]), monthDayToDate(+period[3], +period[4])]
          : [null, null];
        const category = clean(row.find(".category").text());
        items.push(draft({
          key: no,
          category: "contest",
          title: clean(row.find(".txt").text()),
          url: new URL(href, LIST_URL).toString(),
          org: clean(row.find(".host .icon_1").text()).replace(/^주최\s*\.\s*/, ""),
          start,
          deadline: ddayToDate(row.find(".d-day .day").text()) ?? end,
          tags: category ? [category] : [],
          note: state,
          isNew: row.find("img[src*='ic_new']").length > 0,
        }));
      });
    }
    return items;
  },
};
