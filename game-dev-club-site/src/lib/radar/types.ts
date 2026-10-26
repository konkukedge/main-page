export type Category = "contest" | "jam" | "event" | "job";

export interface RadarItem {
  id: string;            // "<source>:<출처 안의 고유값>"
  source: string;
  sourceLabel: string;
  category: Category;
  title: string;
  url: string;
  org: string;
  // 날짜는 모두 KST 기준 YYYY-MM-DD
  deadline: string | null; // 접수·신청·지원 마감일
  start: string | null;    // 행사·잼 시작일 (공모전은 접수 시작일)
  end: string | null;      // 행사·잼 종료일
  location: string;
  fields: string[];        // 취업 분야 (프로그래밍·기획·아트…)
  tags: string[];
  note: string;
  joined: number | null;   // 게임잼 참가자 수
  isNew: boolean;          // 출처가 알려 주는 '최근 등록' 여부
  also: { label: string; url: string }[]; // 같은 공고가 올라온 다른 출처
}

export interface SourceStatus {
  name: string;
  label: string;
  count: number;
  error: string | null;
}

export interface RadarData {
  generatedAt: string; // ISO
  items: RadarItem[];
  sources: SourceStatus[];
  jobFields: string[];
}
