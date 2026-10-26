import { load } from "cheerio/slim";
import { JOB_FIELDS, OTHER_FIELD } from "../config";
import { addDays, monthDayToDate, todayKst } from "../dates";
import { clean, draft, type Draft, type Source } from "./base";

const BASE = "https://www.gamejob.co.kr";
const LIST_PAGE = `${BASE}/Recruit/joblist?menucode=duty`;
const LIST_API = `${BASE}/Recruit/_GI_Job_List/`;
const PAGES = 2;

/** '~11/26' → 날짜, '오늘마감'/'내일마감', '채용시'·'상시' → null */
function deadline(text: string): string | null {
  const m = text.match(/(\d{1,2})\/(\d{1,2})/);
  if (m) return monthDayToDate(+m[1], +m[2]);
  if (text.includes("오늘")) return todayKst();
  if (text.includes("내일")) return addDays(todayKst(), 1);
  return null;
}

/** 공고 링크의 GA_Application_Prdt(...) 인자 중 첫 IsNullOrWhiteSpace('…') 가 직종 목록이다 */
function duties(onclick: string): string[] {
  const m = onclick.match(/IsNullOrWhiteSpace\('([^']*)'\)/);
  return m ? m[1].split(",").map((d) => d.trim()).filter(Boolean) : [];
}

function fields(dutyNames: string[]): string[] {
  const found = Object.keys(JOB_FIELDS).filter((field) => dutyNames.some((d) => JOB_FIELDS[field].includes(d)));
  return found.length ? found : [OTHER_FIELD];
}

/** '2시간 전 등록', '1일 전 등록' 은 최근, '07/28(화) 등록' 은 오래된 공고 */
const isRecent = (posted: string) => /(분|시간) 전/.test(posted) || /^[12]일 전/.test(posted);

export const gameJob: Source = {
  name: "gamejob",
  label: "게임잡",
  gameFilterTitle: false,
  async fetch(http) {
    await http.text(LIST_PAGE); // 세션 쿠키
    const items: Draft[] = [];
    for (let page = 1; page <= PAGES; page++) {
      // order 3 = 등록일순 (목록 페이지가 AJAX 로 부르는 것과 같은 요청)
      const html = await http.text(LIST_API, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8", "X-Requested-With": "XMLHttpRequest", Referer: LIST_PAGE },
        body: new URLSearchParams({ page: String(page), direct: "0", order: "3", pagesize: "40", tabcode: "1" }).toString(),
      });
      const $ = load(html);
      const rows = $("table.tblList tbody tr");
      if (!rows.length) break;
      rows.each((_, tr) => {
        const row = $(tr);
        const a = row.find(".tit a").first();
        const no = a.attr("href")?.match(/GI_No=(\d+)/)?.[1];
        if (!no) return;
        const info = row.find(".tit .info span").map((_, s) => clean($(s).text())).get();
        const dutyNames = duties(a.attr("onclick") ?? "");
        const location = info.find((t) => t.includes(">")) ?? "";
        const dateText = clean(row.find(".date").text());
        const posted = clean(row.find(".modifyDate").text());
        items.push(draft({
          key: no,
          category: "job",
          title: clean(a.text()),
          url: new URL(a.attr("href")!, BASE).toString(),
          org: clean(row.find(".company strong").text()),
          deadline: deadline(dateText),
          location,
          fields: fields(dutyNames),
          tags: [...dutyNames, ...info.filter((t) => t !== location)],
          note: [dateText, posted].filter(Boolean).join(" · "),
          isNew: isRecent(posted),
        }));
      });
    }
    return items;
  },
};
