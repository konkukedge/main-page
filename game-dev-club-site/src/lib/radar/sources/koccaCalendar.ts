import { load, type Cheerio, type CheerioAPI } from "cheerio/slim";
import { todayKst } from "../dates";
import { clean, draft, type Draft, type Source } from "./base";
import type { Http } from "../http";

// 한국콘텐츠진흥원 '글로벌 게임산업 트렌드' 웹진은 두 달마다 주소가 바뀐다 (예: /global/2026_7+8/).
// 최신 호부터 거슬러 올라가며 '행사명' 표가 있는 게임 캘린더 페이지를 찾는다.
const CANDIDATE_PAGES = ["sub05_01", "sub04_03", "sub05_02", "sub04_02"];
const ISSUES_TO_TRY = 4;

function issueSlugs(today: string): { slug: string; year: number }[] {
  let year = Number(today.slice(0, 4));
  let month = Number(today.slice(5, 7));
  if (month % 2 === 0) month -= 1; // 홀수 달로 맞춤
  const out: { slug: string; year: number }[] = [];
  for (let i = 0; i < ISSUES_TO_TRY; i++) {
    out.push({ slug: `${year}_${month}+${month + 1}`, year });
    month -= 2;
    if (month < 1) { year -= 1; month = 11; }
  }
  return out;
}

/** rowspan 을 펼친 셀 텍스트 행 목록 */
function tableRows($: CheerioAPI, table: Cheerio<any>): string[][] {
  const rows: string[][] = [];
  const carry: Record<number, { text: string; left: number }> = {};
  table.find("tr").each((_, tr) => {
    const cells: string[] = [];
    const tds = $(tr).find("th, td").toArray();
    let col = 0;
    while (true) {
      const held = carry[col];
      if (held) {
        cells.push(held.text);
        if (--held.left === 0) delete carry[col];
        col++;
        continue;
      }
      const td = tds.shift();
      if (!td) break;
      const text = clean($(td).text());
      const span = Number($(td).attr("rowspan") ?? 1);
      if (span > 1) carry[col] = { text, left: span - 1 };
      cells.push(text);
      col++;
    }
    rows.push(cells);
  });
  return rows;
}

/** '1. 26. ~ 2. 1.' 또는 '3. 9.' */
function parseDates(text: string, year: number): [string | null, string | null] {
  const parts = Array.from(text.matchAll(/(\d{1,2})\.\s*(\d{1,2})\.?/g));
  if (!parts.length) return [null, null];
  const pad = (n: string) => n.padStart(2, "0");
  const [, m1, d1] = parts[0];
  const [, m2, d2] = parts[parts.length - 1];
  return [`${year}-${pad(m1)}-${pad(d1)}`, `${year + (Number(m2) < Number(m1) ? 1 : 0)}-${pad(m2)}-${pad(d2)}`];
}

async function findCalendar(http: Http) {
  for (const { slug, year } of issueSlugs(todayKst())) {
    for (const page of CANDIDATE_PAGES) {
      const url = `https://kocca.kr/global/${slug}/${page}.html`;
      let html: string;
      try {
        html = await http.text(url);
      } catch {
        continue; // 아직 안 나온 호·없는 페이지는 404
      }
      const $ = load(html);
      for (const table of $("table").toArray()) {
        const rows = tableRows($, $(table));
        if (rows[0]?.join(" ").includes("행사명")) return { rows, year, url };
      }
    }
  }
  throw new Error("최근 호에서 게임 캘린더 표를 찾지 못했습니다");
}

export const koccaCalendar: Source = {
  name: "kocca_calendar",
  label: "KOCCA 게임 캘린더",
  gameFilterTitle: false,
  async fetch(http) {
    const { rows, year, url } = await findCalendar(http);
    const header = rows[0];
    const col = (key: string) => header.findIndex((name) => name.includes(key));
    const [iKind, iTitle, iDate, iPlace] = [col("구분"), col("행사명"), col("일정"), col("장소")];
    const items: Draft[] = [];
    for (const cells of rows.slice(1)) {
      if (cells.length < header.length) continue;
      const [start, end] = parseDates(cells[iDate], year);
      items.push(draft({
        key: `${year}-${cells[iTitle]}`,
        category: "event",
        title: cells[iTitle],
        url,
        start,
        end: end ?? start,
        location: `${cells[iKind]} · ${cells[iPlace]}`,
        tags: [cells[iKind]],
      }));
    }
    return items;
  },
};
